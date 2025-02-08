import { type Traversable, t } from "@traversable/core"
import { Invariant } from "@traversable/registry"

import { fn, map, object } from "@traversable/data"
import * as Gen from "../generator.js"
import * as Print from "../print.js" 
import type { Index, Matchers, Options, TargetTemplate } from "../shared.js"
import { 
  JsonLike,
  defaults as defaults_,
  escapePathSegment,
} from "../shared.js"

export {
  NS,
  TypeName,
  defaults,
  dependencies,
  headers,
  template,
  //
  derivatives,
  derive,
  deriveAll,
  compilers,
  compile,
  compileAll,
}

/** @internal */
const Object_entries = globalThis.Object.entries

type NS = typeof NS
const NS = 't' as const

type TypeName = typeof TypeName
const TypeName = 'Traversable'

const dependencies = [] as const satisfies string[]

const headers = [
  `import { ${NS} } from "@traversable/core"`,
] as const satisfies string[]

const template = (
  (target, $) => [
    '/**',
    ` * # {@link ${$.typeName} \`${$.typeName}\`}`,
    ` * - Visit: {@link $doc.${$.absolutePath.map(escapePathSegment).join('.')} OpenAPI definition}`,
    ' */',
    `export type ${$.typeName}`,
    '  //        ^?',
    `  = ${NS}.typeof<typeof ${$.typeName}>`,
    `export const ${$.typeName} =`,
    `  ${target.startsWith(NS) ? target : `${NS}(${target})`}`,
  ]
) satisfies TargetTemplate

const defaults = {
  ...defaults_,
  header: headers,
  typeName: defaults_.typeName + TypeName,
  template,
} as const satisfies Required<Omit<Options<unknown>, 'handlers'>>

const derivatives = {
  null() { return t.null() },
  boolean() { return t.boolean() },
  integer() { return t.integer() },
  number() { return t.number() },
  string() { return t.string() },
  any() { return t.any() },
  const({ const: x }) { return t.const(x) },
  enum({ enum: xs }) { return t.enum(...xs) },
  allOf({ allOf }) { return t.allOf(...allOf) },
  anyOf({ anyOf }) { return t.anyOf(...anyOf) },
  oneOf({ oneOf }) { return t.oneOf(...oneOf) },
  array({ items: x }) { return t.array(x) },
  record({ additionalProperties: x }) { return t.record(x) },
  tuple({ items: xs }) { return t.tuple(...xs) },
  object({ properties: p }) { return t.object(p) },
  $ref({ $ref: x }, $) { return $.refs[x] as t.type },
} satisfies Matchers<t.type>

const deriveObjectNode
  : (ix: Index) => (x: Traversable.objectF<string>) => string
  = ({ indent: left }) =>
    ({ properties: x, required: req = [] }) => { 
      const xs = Object_entries(x)
      if (xs.length === 0) return `${NS}.object({})`
      else return fn.pipe(
        xs.map(
          ([k, v]) => (
            '\n' 
            + ' '.repeat(left + 2) 
            + object.parseKey(k) 
            + ': ' 
            + (req.includes(k) ? v : `${NS}.optional(${v})`)
          )
        ),
        (body) => `${NS}.object({` + body + `\n${' '.repeat(left)}})`,
      )
    }

const compilers = {
  any() { return `${NS}.any()` as const },
  null() { return `${NS}.null()` as const },
  boolean() { return `${NS}.boolean()` as const },
  integer() { return `${NS}.integer()` as const },
  number() { return `${NS}.number()` as const },
  string() { return `${NS}.string()` as const },
  const({ const: x }, $) { return `${NS}.const(${serializer($)(x)})` },
  enum({ enum: x }, $) { return `${NS}.enum(${x.map(serializer($)).join(`, `)})` },
  allOf({ allOf: xs }, $) { return `${NS}.allOf(${xs.map(deriveObjectNode($)).join(', ')})` },
  anyOf({ anyOf: xs }) { return `${NS}.anyOf(${xs.join(', ')})` },
  oneOf({ oneOf: xs }) { return `${NS}.anyOf(${xs.join(', ')})` },
  array({ items: x }, $) { return Print.array($)(`${NS}.array(`, x, ')') },
  record({ additionalProperties: x }, $) { return `${NS}.record(${x})` },
  tuple(
    { items: xs }, 
    { indent: lhs },
  ) { 
    return xs.length === 0 
      ? `${NS}.tuple()` 
      : `${NS}.tuple(`
      + ('\n' + ' '.repeat(lhs + 2))
      + xs.join(',\n')
      + (' '.repeat(lhs + 2) + '\n')
      + ' '.repeat(lhs) + ')'
  },
  object(x, ix) { return deriveObjectNode(ix)(x) },
  $ref({ $ref: x }, $) { return $.refs[x] as never },
} as const satisfies Matchers<string>

const derive 
  : (schema: Traversable.orJsonSchema, options: Options<t.type>) => t.type
  = Gen.derive(derivatives, defaults)

const deriveAll 
  : (options: Options<t.type>) => Gen.All<t.type>
  = ($) => Gen.deriveAll(derive, { ...defaults, ...$ })

/**
 * ## {@link compile `t.compile`}
 *
 * Given a JSON Schema, OpenAPI document or {@link Traversable `@traversable`} 
 * spec, compiles the equivalent `@traversable` schema in string form.
 *
 * If you need to derive a schema on the fly, or if the spec comes from
 * some kind of user input, consider using {@link derive `t.derive`} instead.
 */
const compile = Gen.compile(compilers, defaults)

/**
 * ## {@link compileAll `t.compileAll`}
 *
 * Given a JSON Schema, OpenAPI document or {@link Traversable `@traversable`} 
 * spec, compiles a `@traversable` schema for every schema in the spec.
 * 
 * All schemas are returned in string form, and will 
 *
 * If you need to derive a schema dynamically, especially if the schema comes from
 * some kind of user input, use {@link derive `t.derive`} instead.
 */
const compileAll
  : (options: Options<string>) => Gen.All<string>
  = (options) => Gen.compileAll(compile, { ...defaults, ...options })

const serializer
  : (ix: Index) => (x: unknown) => string
  = (ix) => {
    const loop = (indent: number) => (x: JsonLike): string => {
      switch (true) {
        default: return fn.exhaustive(x)
        case x === null:
        case x === undefined:
        case typeof x === 'boolean':
        case typeof x === 'number': return x + ''
        case typeof x === 'string': return '"' + x + '"'
        case JsonLike.isArray(x): 
          return x.length === 0 ? '[]' 
            : Print.array({ indent })('[', 
              ...x.map(loop(indent + 2)), 
            ']')
        case !!x && typeof x === 'object': {
          const xs = Object_entries(x)
          return xs.length === 0 ? '{}' : fn.pipe(
            xs,
            map(([k, v]) => JSON.stringify(k) + ': ' + loop(indent + 2)(v)),
            (xs) => Print.array({ indent })('{', ...xs, '}'),
          )
        }
      }
    }
    return (x: unknown) => !JsonLike.is(x) 
      ? Invariant.InputIsNotSerializable("typebox.serialize", x)
      : loop(ix.indent)(x)
  }
