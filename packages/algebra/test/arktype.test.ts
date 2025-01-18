import * as fs from "node:fs"
import * as path from "node:path"
import * as vi from "vitest"
import { type } from "arktype"

import { Traversable, fc, is, test, tree } from "@traversable/core"
import { fn, keys, map } from "@traversable/data"
import { arbitrary } from "@traversable/openapi"

import { ark, escapePathSegment } from "@traversable/algebra"
import { _ } from "@traversable/registry"

const DIR = path.join(path.resolve(), "packages", "algebra", "test", "__generated__")
const PATH = {
  generated: DIR,
  spec: path.join(DIR, "traversable.gen.json"),
  targets: {
    jsdocHack: path.join(DIR, "traversable.gen.json.ts"),
    ark: path.join(DIR, "ark.gen.ts"),
    arkTypesOnly: path.join(DIR, "arkTypesOnly.gen.ts"),
  }
} as const

const PATTERN = {
  CleanPathName: /(\/|~|-|{|})/g
} as const

const generateSpec = () => fn.pipe(
  arbitrary({ include: { examples: true, description: true } }),
  fc.peek,
  tree.modify("components", "schemas")(map(Traversable.fromJsonSchema)),
  (_) => JSON.stringify(_, null, 2),
)

const Array_isArray 
  : <T>(u: unknown) => u is readonly T[]
  = globalThis.Array.isArray

interface Invertible { [x: keyof any]: keyof any }

const sub
  : <const D extends Invertible>(dict: D) => (text: string) => string
  = (dict) => (text) => {
    let ks = [...text], out = "", k: string | undefined
    while ((k = ks.shift()) !== undefined) out += k in dict ? String(dict[k]) : k
    return out
  }

const refsDeep = (leaveUnescaped: string) => (x: {} | null | undefined): {} | null | undefined => {
  switch (true) {
    default: return fn.exhaustive(x)
    case x == null: return x
    case Array_isArray(x): return x.map(refsDeep(leaveUnescaped))
    case tree.has("$ref", is.string)(x): {
      if (x.$ref.startsWith(leaveUnescaped)) return { $ref: leaveUnescaped + escapePathSegment(x.$ref.substring(leaveUnescaped.length)) }
      else return { $ref: escapePathSegment(x.$ref) }
    }
    case !!x && typeof x === "object": return map(x, refsDeep(leaveUnescaped))
    case is.nonnullable(x): return x
  }
}

const pathify = fn.flow(
  keys.map.deep(escapePathSegment),
  refsDeep("#/components/schemas"),
  (_) => JSON.stringify(_, null, 2),
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
    if (!fs.existsSync(PATH.targets.ark)) fs.writeFileSync(PATH.targets.arkTypesOnly, "")
    if (!fs.existsSync(PATH.spec)) fs.writeFileSync(PATH.spec, generateSpec())
    if (!fs.existsSync(PATH.targets.jsdocHack)) fs.writeFileSync(PATH.targets.jsdocHack, "")

    /** 
     * TODO: generate tests that confirm that {@link ark.derive `derived`} and {@link ark.generate `generated`}
     * algebras are equivalent / at parity
     */
    const document = JSON.parse(fs.readFileSync(PATH.spec).toString("utf8"))

    fs.writeFileSync(
      PATH.targets.jsdocHack, 
      pathify(document),
    )

    const schemas
      : Record<string, Traversable.any>
      = document.components?.schemas ?? {}

    let generatedSchemas = [
      `import { type } from "arktype"`, 
      `import $doc from "./traversable.gen.json.js"`,
    ]

    for (const k in schemas) {
      const jsonSchema = schemas[k]
      const options = {
        typeName: typeNameFromPath(k),
        document,
        absolutePath: ["components", "schemas", k],
      } satisfies Parameters<typeof ark.generate>[1]

      const schema = ark.generate(jsonSchema, options)
      void generatedSchemas.push(schema)
    }

    fs.writeFileSync(PATH.targets.ark, generatedSchemas.join("\n\n") + "\n")
    // fs.writeFileSync(PATH.targets.arkTypesOnly, generatedTypes.join("\n\n"))
    vi.assert.isTrue(fs.existsSync(PATH.targets.ark))
    // vi.assert.isTrue(fs.existsSync(PATH.targets.arkTypesOnly))
  })
})
