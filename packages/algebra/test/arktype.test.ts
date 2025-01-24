import * as fs from "node:fs"
import * as path from "node:path"
import * as vi from "vitest"

import { Traversable, fc, is, tree } from "@traversable/core"
import { fn, keys, map } from "@traversable/data"
import { Schema, type openapi, Spec, $ref } from "@traversable/openapi"
import type { _ } from "@traversable/registry"

import { ark, escapePathSegment, unescapePathSegment } from "@traversable/algebra"

type Any = {} | null | undefined

/** 
 * Whether or not {@link REGENERATE_THE_WORLD_ON_FILE_SAVE `REGENERATE_THE_WORLD_ON_FILE_SAVE`} 
 * is commented out changes this test suite's behavior when the tests are run in watch mode, 
 * e.g.: `$ pnpm test:watch ark`
 * 
 * Behavior:
 * 
 * - _if false_, chokidar will regenerate **just** `__generated__/arg.gen.ts` on save
 * - _if true_, chokidar will regenerate **all of** `__generated__` on save 
 * 
 * **tl,dr:** Jon't put anything in `__generated__` that you care about and you'll be good either way
 */
////////////////////////////////////////////
let REGENERATE_THE_WORLD_ON_FILE_SAVE = true

/** @internal */
const JSON_parse = globalThis.JSON.parse
/** @internal */
const JSON_stringify = <T>(_: T) => globalThis.JSON.stringify(_, null, 2)
/** @internal */
const Array_isArray: <T>(u: unknown) => u is readonly T[] = globalThis.Array.isArray

const DIR = path.join(path.resolve(), "packages", "algebra", "test", "__generated__")
const PATH = {
  generated: DIR,
  spec: path.join(DIR, "traversable.gen.json"),
  targets: {
    jsdocHack: path.join(DIR, "traversable.gen.json.ts"),
    ark: path.join(DIR, "ark.gen.ts"),
  }
} as const

const PATTERN = {
  CleanPathName: /(\/|~|-|{|})/g
} as const

const generateSpec = () => fn.pipe(
  Spec.generate({
    include: { examples: false, description: false }, 
    schemas: {
      allOf: {
        arbitrary: (LOOP, $) => Schema.allOf.base(fc.dictionary(LOOP), $)
      }
    }
  }),
  fc.peek,
  (x) => Spec.map(x, (_) => Traversable.fromJsonSchema(_)),
  (x) => tree.modify(x, ["paths"], map((v, k) => ({ $unref: unescapePathSegment(k), ...(v as {}) }))),
  JSON_stringify,
)

  // Spec.map(Traversable.fromJsonSchema),
//   arbitrary({
//     include: { examples: false, description: false }, 
//     schemas: {
//       allOf: {
//         arbitrary: (LOOP, $) => Schema.allOf.base(fc.dictionary(LOOP), $)
//       }
//     }
//   }),
//   fc.peek,
//   // tree.modify("components", "schemas")(map(Traversable.fromJsonSchema)),
//   x=>x,
//   // tree.modify("paths")(map((v: Record<string, unknown>, k) => ({ $unref: unescapePathSegment(k), ...v }))),
//   // JSON_stringify,
// )

const refsDeep 
  : (leaveUnescaped: string) => (x: Any) => Any
  = (leaveUnescaped) => (x) => {
    switch (true) {
      default: return fn.exhaustive(x)
      case x == null: return x
      case Array_isArray(x): 
        return x.map(refsDeep(leaveUnescaped))
      case tree.has("$ref", is.string)(x):
        if (x.$ref.startsWith(leaveUnescaped)) return { 
          $ref: leaveUnescaped + escapePathSegment(x.$ref.substring(leaveUnescaped.length)),
          $unref: x.$ref,
        }
        else return { 
          $ref: escapePathSegment(x.$ref),
        }
      case !!x && typeof x === "object": 
        return map(x, refsDeep(leaveUnescaped))
      case is.nonnullable(x): return x
    }
  }

const pathify = fn.flow(
  keys.map.deep(escapePathSegment),
  refsDeep("#/components/schemas"),
  JSON_stringify,
  (_) => "export default " + _.trimEnd() + " as const;"
)

const capitalize = (s: string) => s.charAt(0).toUpperCase().concat(s.slice(1))
const typeNameFromPath = (k: string) => k.startsWith("/paths/") 
  ? capitalize(k.slice("/paths/".length).replace(PATTERN.CleanPathName, "_"))
  : capitalize(k).replace(PATTERN.CleanPathName, "_")



vi.describe("〖️⛳️〗‹‹‹ ❲@traversable/algebra/ark❳", () => {
  vi.it("〖️⛳️〗› ❲ark.generate❳", async () => {
    if (!fs.existsSync(PATH.generated)) fs.mkdirSync(PATH.generated, { recursive: true })
    if (!fs.existsSync(PATH.targets.ark)) fs.writeFileSync(PATH.targets.ark, "")
    if (!fs.existsSync(PATH.spec)) fs.writeFileSync(PATH.spec, "")
    if (!fs.existsSync(PATH.targets.jsdocHack)) fs.writeFileSync(PATH.targets.jsdocHack, "")

    ///////////////////////////////////////////////
    if (REGENERATE_THE_WORLD_ON_FILE_SAVE) 
      fs.writeFileSync(PATH.spec, generateSpec())
    ////////////////////////////////////////////

    /** 
     * TODO: generate tests that confirm that {@link ark.derive `derived`} and {@link ark.generate `generated`}
     * algebras are equivalent
     */
    const document
      : openapi.doc
      = JSON_parse(fs.readFileSync(PATH.spec).toString("utf8"))

    fs.writeFileSync(
      PATH.targets.jsdocHack, 
      pathify(document),
    )

    const schemas = document.components?.schemas ?? {}

    let generatedSchemas = [
      `import { type } from "arktype"`, 
      `import $doc from "./traversable.gen.json.js"`,
    ]

    for (const k in schemas) {
      const schema = schemas[k]
      const options = {
        typeName: typeNameFromPath(k),
        document,
        absolutePath: ["components", "schemas", k],
      } satisfies Parameters<typeof ark.generate>[1]

      void generatedSchemas.push(ark.generate(schema, options))
    }

    fs.writeFileSync(PATH.targets.ark, generatedSchemas.join("\n\n") + "\n")
    vi.assert.isTrue(fs.existsSync(PATH.targets.ark))
  })
})
