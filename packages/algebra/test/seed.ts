import * as fs from "node:fs"
import * as path from "node:path"

import type { _, autocomplete } from "@traversable/registry"
import { Traversable, fc, is, tree } from "@traversable/core"
import { fn, keys, map } from "@traversable/data"
import { Schema, Spec, openapi } from "@traversable/openapi"
import { escapePathSegment, unescapePathSegment } from "@traversable/algebra"

/** @internal */
type Any = {} | null | undefined
/** @internal */
const JSON_parse = globalThis.JSON.parse
/** @internal */
const JSON_stringify = <T>(_: T) => globalThis.JSON.stringify(_, null, 2)
/** @internal */
const Array_isArray: <T>(u: unknown) => u is readonly T[] = globalThis.Array.isArray

const PATTERN = {
  CleanPathName: /(\/|~|-|{|})/g
} as const
const DIR = path.join(path.resolve(), "packages", "algebra", "test", "__generated__")

export const PATH = {
  generated: DIR,
  spec: path.join(DIR, "traversable.gen.json"),
  targets: {
    jsdocHack: path.join(DIR, "traversable.gen.json.ts"),
    ark: path.join(DIR, "ark.gen.ts"),
    zod: path.join(DIR, "zod.gen.ts"),
    zodTypesOnly: path.join(DIR, "zodtypesOnly.gen.ts"),
  }
} as const

const capitalize = (s: string) => s.charAt(0).toUpperCase().concat(s.slice(1))

export const typeNameFromPath = (k: string) => k.startsWith("/paths/") 
  ? capitalize(k.slice("/paths/".length).replace(PATTERN.CleanPathName, "_"))
  : capitalize(k).replace(PATTERN.CleanPathName, "_")

const refsDeep 
  : (leaveUnescaped: autocomplete<`#/components/schemas`>) => (x: Any) => Any
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

const generateSpec = () => fn.pipe(
  Spec.generate({
    include: { example: true, description: false }, 
    schemas: {
      allOf: {
        arbitrary: (LOOP, $) => Schema.allOf.base(fc.dictionary(LOOP), $)
      }
    }
  }),
  fc.peek,
  // TODO: fix this type assertion
  (x) => Spec.map(x, (_) => Traversable.fromJsonSchema(_ as Traversable.any)),
  (x) => tree.modify(x, ["paths"], map((v, k) => ({ $unref: unescapePathSegment(k), ...(v as {}) }))),
  JSON_stringify,
)

declare namespace seed {
  export interface Options {
    /** 
     * Whether or not {@link seed `seed`} should regenerate test files on save.
     * 
     * Behavior:
     * 
     * - _if false_, {@link seed `seed`} will regenerate **just** `__generated__/arg.gen.ts` on save
     * - _if true_, {@link seed `seed`} will regenerate **all of** `__generated__` on save 
     */
    regenerateSeedFilesOnSave?: boolean
  }
}

export const defaults = {
  regenerateSeedFilesOnSave: false,
} as const satisfies Required<seed.Options>

let firstRun = !fs.existsSync(PATH.spec)

if (firstRun) {
  if (!fs.existsSync(PATH.generated)) fs.mkdirSync(PATH.generated, { recursive: true })
  if (!fs.existsSync(PATH.targets.ark)) fs.writeFileSync(PATH.targets.ark, "")
  if (!fs.existsSync(PATH.targets.zod)) fs.writeFileSync(PATH.targets.ark, "")
  if (!fs.existsSync(PATH.spec)) fs.writeFileSync(PATH.spec, generateSpec())
  if (!fs.existsSync(PATH.targets.jsdocHack)) fs.writeFileSync(PATH.targets.jsdocHack, "")
  firstRun = false
}

export function seed({ 
  regenerateSeedFilesOnSave = defaults.regenerateSeedFilesOnSave, 
}: seed.Options = defaults) {
  if (regenerateSeedFilesOnSave) {
    console.log("RE-GENERATING...")
    fs.writeFileSync(PATH.spec, generateSpec())
  }

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
}
