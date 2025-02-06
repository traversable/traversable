import * as fs from 'node:fs'
import * as path from 'node:path'

import type { JsonSchema } from '@traversable/core'
import { Traversable, fc, is, show, tree } from '@traversable/core'
import { fn, keys, map, object, string } from '@traversable/data'
import { composeExamples, OpenAPI, Schema } from '@traversable/openapi'
import type { Functor, _, autocomplete } from '@traversable/registry'
import { symbol } from '@traversable/registry'

import { escapePathSegment, unescapePathSegment } from './shared.js'

/** @internal */
type Any = {} | null | undefined
/** @internal */
const JSON_parse = globalThis.JSON.parse
/** @internal */
const JSON_stringify = <T>(_: T) => globalThis.JSON.stringify(_, null, 2)
/** @internal */
const Array_isArray: <T>(u: unknown) => u is readonly T[] = globalThis.Array.isArray
/** @internal */
const Object_values = globalThis.Object.values

const PATTERN = {
  CleanPathName: /(\/|~|-|{|})/g
} as const

export const TARGETS_DIR = path.join(path.resolve(), 'packages', 'algebra', 'test', '__generated__')
export const SPECS_DIR = path.join(path.resolve(), 'packages', 'algebra', 'test', '__specs__')
export const PATH = {
  dirs: {
    specs: SPECS_DIR,
    hacks: SPECS_DIR,
    targets: TARGETS_DIR,
  },
  specs: {
    dir: SPECS_DIR,
    arbitrary: path.join(SPECS_DIR, 'arbitrary.spec.json'),
    octokit: path.join(SPECS_DIR, 'octokit.spec.json'),
  },
  hacks: {
    dir: SPECS_DIR,
    arbitrary: path.join(SPECS_DIR, 'arbitrary.hack.ts'),
    octokit: path.join(SPECS_DIR, 'octokit.hack.ts'),
  },
  targets: {
    dir: TARGETS_DIR,
    octokit: path.join(TARGETS_DIR, `octokit.target.ts`),
    ark: path.join(TARGETS_DIR, 'ark.target.ts'),
    zod: path.join(TARGETS_DIR, 'zod.target.ts'),
    typebox: path.join(TARGETS_DIR, 'typebox.target.ts'),
    zodTypesOnly: path.join(TARGETS_DIR, 'zodtypesOnly.target.ts'),
  }
} as const

export const typeNameFromPath = (k: string) => k.startsWith('/paths/') 
  ? string.capitalize(k.slice('/paths/'.length).replace(PATTERN.CleanPathName, '_'))
  : string.capitalize(k).replace(PATTERN.CleanPathName, '_')

export const remapRefs
  : (leaveUnescaped: autocomplete<`#/components/schemas`>) => (x: Any) => Any
  = (leaveUnescaped) => (x) => {
    switch (true) {
      default: return fn.exhaustive(x)
      case x == null: return x
      case Array_isArray(x): 
        return x.map(remapRefs(leaveUnescaped))
      case tree.has('$ref', is.string)(x):
        if (x.$ref.startsWith(leaveUnescaped)) return { 
          $ref: leaveUnescaped + escapePathSegment(x.$ref.substring(leaveUnescaped.length)),
          $unref: x.$ref,
        }
        else return { 
          $ref: escapePathSegment(x.$ref),
        }
      case !!x && typeof x === 'object': 
        return map(x, remapRefs(leaveUnescaped))
      case is.nonnullable(x): return x
    }
  }


const pathify = fn.flow(
  keys.map.deep(escapePathSegment),
  remapRefs('#/components/schemas'),
  JSON_stringify,
  (_) => 'export default ' + _.trimEnd() + ' as const;'
)

const allOf = (LOOP: fc.Arbitrary<unknown>, $: Schema.Constraints.Config) => 
  Schema.allOf.base(Schema.object.base({ properties: LOOP, additionalProperties: LOOP }, $), $)
  
const preprocess = fn.flow(
  OpenAPI.map(Traversable.fromJsonSchema),
  (trav) => tree.modify(
    trav, 
    ["paths"], 
    map((v, k) => ({ $unref: unescapePathSegment(k), ...(v as {}) })),
  ),
)

const generateSpec = (options?: seed.Options) => fn.pipe(
  OpenAPI.generate({
    ...options,
    include: !options?.include ? defaults.include : {
      const: options.include.const ?? defaults.include.const,
      description: options.include.description ?? defaults.include.description,
      example: options.include.example ?? defaults.include.example,
      examples: options.include.examples ?? defaults.include.examples,
    },
    exclude: !options?.exclude ? defaults.exclude : options.exclude,
    schemas: {
      ...options?.schemas,
      allOf: !options?.schemas?.allOf ? defaults.schemas.allOf : {
        arbitrary: options?.schemas?.allOf?.arbitrary || allOf,
        ...options?.schemas.allOf,
      },
      anyOf: !options?.schemas?.anyOf ? defaults.schemas.anyOf : {
        ...defaults.schemas.anyOf,
        ...options.schemas.anyOf,
      },
      oneOf: !options?.schemas?.oneOf ? defaults.schemas.oneOf : {
        ...defaults.schemas.oneOf,
        ...options.schemas.oneOf,
      },
      array: !options?.schemas?.array ? defaults.schemas.array : {
        ...defaults.schemas.array,
        ...options.schemas.array,
      },
      boolean: !options?.schemas?.boolean ? defaults.schemas.boolean : {
        ...defaults.schemas.boolean,
        ...options.schemas.boolean,
      },
      integer: !options?.schemas?.integer ? defaults.schemas.integer : {
        ...defaults.schemas.integer,
        ...options.schemas.integer,
      },
      null: !options?.schemas?.null ? defaults.schemas.null : {
        ...defaults.schemas.null,
        ...options.schemas.null,
      },
      number: !options?.schemas?.number ? defaults.schemas.number : {
        ...defaults.schemas.number,
        ...options.schemas.number,
      },
      object: !options?.schemas?.object ? defaults.schemas.object : {
        ...defaults.schemas.object,
        ...options.schemas.object,
      },
      record: !options?.schemas?.record ? defaults.schemas.record : {
        ...defaults.schemas.record,
        ...options.schemas.record,
      },
      string: !options?.schemas?.string ? defaults.schemas.string : {
        ...defaults.schemas.string,
        ...options.schemas.string,
      },
      tuple: !options?.schemas?.tuple ? defaults.schemas.tuple : {
        ...defaults.schemas.tuple,
        ...options.schemas.tuple,
      },
    },
  }),
  fc.peek,
  preprocess,
  options?.include?.example ?? defaults.include.example 
    ? OpenAPI.map(composeExamples)
    : fn.identity,
  JSON_stringify,
)

declare namespace seed {
  export interface Options extends OpenAPI.Constraints {
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
  ...OpenAPI.defaults,
} as const satisfies Required<seed.Options>

let firstRun = Object_values(PATH.specs).some((spec) => !fs.existsSync(spec))

export function seed(options?: seed.Options): void
export function seed($: seed.Options = defaults) {
  void map(PATH.dirs, (dir) => void ((!fs.existsSync(dir)) && fs.mkdirSync(dir, { recursive: true })))
  void map(PATH.targets, (target) => void (!fs.existsSync(target) && fs.writeFileSync(target, '')))
  void map(PATH.hacks, (hack) => void (!fs.existsSync(hack) && fs.writeFileSync(hack, '')))
  if (firstRun) {
    if (!fs.existsSync(PATH.specs.arbitrary)) void (fs.writeFileSync(PATH.specs.arbitrary, generateSpec($)))
    firstRun = false
  }

  if ($.regenerateSeedFilesOnSave) {
    const newDoc = generateSpec($)
    console.log('RE-GENERATING...')
    fs.writeFileSync(PATH.specs.arbitrary, newDoc)
  }

  /** 
   * TODO: generate tests that confirm that {@link ark.derive `derived`} and {@link ark.generate `generated`}
   * algebras are equivalent
   */
  const arbitrarySpec
    : OpenAPI.doc
    = JSON_parse(fs.readFileSync(PATH.specs.arbitrary).toString('utf8'))

  fs.writeFileSync(
    PATH.hacks.arbitrary, 
    pathify(arbitrarySpec),
  )

  const octokitSpec
    : OpenAPI.doc<JsonSchema>
    = JSON_parse(fs.readFileSync(PATH.specs.octokit).toString('utf8'))

  fs.writeFileSync(
    PATH.hacks.octokit,
    fn.pipe(
      octokitSpec,
      OpenAPI.map(Traversable.fromJsonSchema),
      pathify,
    )
  )
}

void (seed.PATH = PATH)
void (seed.preprocess = preprocess)
void (seed.pathify = pathify)

      /////////
      // if (!fs.existsSync(PATH.targets.ark)) fs.writeFileSync(PATH.targets.ark, '')
      // if (!fs.existsSync(PATH.targets.zod)) fs.writeFileSync(PATH.targets.zod, '')
      // if (!fs.existsSync(PATH.targets.octokit)) fs.writeFileSync(PATH.targets.octokit, '')
      // if (!fs.existsSync(PATH.targets.octokit)) fs.writeFileSync(PATH.hacks.octokit, '')
      /////////
// !fs.existsSync(PATH.specs.arbitrary)
    // if (!fs.existsSync(PATH.hacks.arbitrary)) fs.writeFileSync(PATH.hacks.arbitrary, '')
