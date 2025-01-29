import { fn, map } from "@traversable/data"
import type { 
  Force, 
  Functor, 
  HKT, 
  Primitive, 
  TypeError,
} from "@traversable/registry"
import type { AST } from './ast.js'
import * as t from './ast.js'

type ScalarShortName = keyof ScalarMap

/** @internal */
const Array_isArray = globalThis.Array.isArray

const TerminalSeeds = [
  "string", 
  "number", 
  "boolean", 
  "symbol", 
  "integer", 
  "any"
] as const satisfies ScalarShortName[]
type TerminalSeeds = typeof TerminalSeeds
const TerminalArrays = TerminalSeeds.map((sn) => `${sn}[]` as const) as TerminalArrays_
type TerminalArrays = typeof TerminalArrays
const TerminalRecords = TerminalSeeds.map((sn) => `${sn}{}` as const) as TerminalRecords_
type TerminalRecords = typeof TerminalRecords
const Terminals = [...TerminalSeeds, ...TerminalArrays, ...TerminalRecords]
type Terminals = typeof Terminals
type Terminal = Terminals[number]

/** @internal */
type TerminalArrays_<T extends TerminalSeeds = TerminalSeeds> = never | { [I in keyof T]: `${T[I]}[]` }
/** @internal */
type TerminalRecords_<T extends TerminalSeeds = TerminalSeeds> = never | { [I in keyof T]: `${T[I]}{}` }



declare const ScalarName: keyof typeof ScalarMap
type ScalarName<T> = [T] extends [typeof ScalarName] ? T : never

type ScalarMap = typeof ScalarMap
declare const ScalarMap: {
  symbol: t.symbol
  boolean: t.boolean
  integer: t.integer
  number: t.number
  string: t.string
  any: t.any
}

declare const TerminalByTag:
  & ScalarMap
  & { [K in keyof ScalarMap as `${K}[]`]: t.array<ScalarMap[K]> }
  & { [K in keyof ScalarMap as `${K}{}`]: t.record<ScalarMap[K]> }

  type Composite =
    | readonly Short[]
    | { [x: string]: Short }

  type ScalarConst =
    | number
    | true
    | false
    | `'${string}'`
    | `"${string}"`
    | `\`${string}\``

  type Const =
    | ScalarConst
    | readonly Const[]
    | { [x: string]: Const }

type Short =
  | null
  | readonly ["[]", Short]
  | readonly ["{}", Short]
  | readonly ["|", ...Short[]]
  | readonly ["&", ...Short[]]
  | Terminal
  | Composite
  | Const

type Shortish =
  | null
  | readonly ["[]" | "{}", {}]
  | readonly ["&" | "|", ...{}[]]
  | (string & {})
  | readonly {}[]
  | { [x: string]: {} }
  ;

type ShortF<T> =
  | null
  | Terminal
  | readonly ["[]", T]
  | readonly ["{}", T]
  | readonly ["|", ...T[]]
  | readonly ["&", ...T[]]
  | readonly T[]
  | { [x: string]: T }
  // | Const

interface lambda extends HKT { [-1]: ShortF<this[0]> }

type fromShort<S>
  = S extends null ? t.null
  : S extends Terminal ? typeof TerminalByTag[S]
  : S extends readonly ["&", ...infer T extends Short[]]
  ? { -readonly [Ix in keyof T]: fromShort<T[Ix]> } extends
    | infer T extends readonly unknown[] ? t.allOf<T> : never
  : S extends readonly ["|", ...infer T extends Short[]]
    ? { -readonly [Ix in keyof T]: fromShort<T[Ix]> } extends
    | infer U extends AST.Node[] ? t.anyOf<U>
    : never
  : S extends readonly ["[]", Short] ? t.array<fromShort<S[1]>>
  : S extends readonly ["{}", Short] ? t.record<fromShort<S[1]>>
  : S extends object
    ? S extends readonly unknown[]
      ? { -readonly [Ix in keyof S]: fromShort<S[Ix]> } extends
      | infer T extends readonly unknown[] ? t.tuple<T>
      : never
    : S extends { [x: string]: unknown } ? t.object<object_.fromShort<S>>
  : never
  : t.const<const_.parse<S>>
  ;

const isScalarShortName = (s: string): s is Terminal => Terminals.includes(s as never)
const isTerminal = (u: unknown): u is Terminal => typeof u === "string" && isScalarShortName(u)
const isArrayShorthand = <T>(u: unknown): u is array_.Short<T> => (u as any)?.[0] === "[]"
const isRecordShorthand = <T>(u: unknown): u is record_.Short<T> => Array_isArray(u) && u[0] === "{}"
const isTupleShorthand = <T>(u: unknown): u is tuple_.Short<T> => Array_isArray(u) && u.every(isShorthand)
const isObjectShorthand = <T>(u: unknown): u is object_.Short<T> => !!u && typeof u === "object"
const isAllOfShorthand = <T>(u: unknown): u is allOf_.Short<T> => Array_isArray(u) && u[0] === "|"
const isAnyOfShorthand = <T>(u: unknown): u is anyOf_.Short<T> => {
  return (u as any)?.[0] === "&"
}
const isConstStringLiteral
  : (u: unknown) => u is `'${string}'` | `"${string}"` | `\`${string}\``
  = (u): u is never => typeof u === "string" && (
    u.startsWith("'") && u.endsWith("'") ||
    u.startsWith("`") && u.endsWith("`") ||
    u.startsWith(`"`) && u.endsWith(`"`)
    // || Array.isArray(u) && isConstStringLiteral(u[0])
  )
const isShorthand
  = (_: unknown): _ is Short =>
  isTerminal(_) ||
  isArrayShorthand(_) ||
  isRecordShorthand(_) ||
  isTupleShorthand(_) ||
  isObjectShorthand(_) ||
  isAllOfShorthand(_) ||
  isAnyOfShorthand(_) ||
  isConstStringLiteral(_)

// TODO: fix type assertion
const parseConstStringLiteral = (s: Short) =>
  (isConstStringLiteral(s) ? s.slice(1, -1) : s) as never

const terminalMap = {
  any: t.any,
  "any[]": () => t.array(t.any()),
  "any{}": () => t.record(t.any()),
  boolean: t.boolean,
  "boolean[]": () => t.array(t.boolean()),
  "boolean{}": () => t.record(t.boolean()),
  integer: t.integer,
  "integer[]": () => t.array(t.integer()),
  "integer{}": () => t.record(t.integer()),
  number: t.number,
  "number[]": () => t.array(t.number()),
  "number{}": () => t.record(t.number()),
  string: t.string,
  "string[]": () => t.array(t.string()),
  "string{}": () => t.record(t.string()),
  symbol: t.symbol,
  "symbol[]": () => t.array(t.symbol()),
  "symbol{}": () => t.record(t.symbol()),
} as const satisfies { [Tag in keyof typeof TerminalByTag]: () => typeof TerminalByTag[Tag] }

type tail<S> = S extends readonly [any, ...infer T] ? T : never
function tail<const T extends readonly unknown[]>(xs: T): tail<T>
function tail<const T extends readonly unknown[]>(xs: T)
  { return xs.slice(1) }

const ShortFunctor: Functor<lambda, Short> = {
  map: (f) => (x) => {
    switch (true) {
      default: return (console.info("exhaustive check in ast.ShortFunctor, x:", x), x)
      case x === null: return x
      case isTerminal(x): return x
      case isArrayShorthand(x): return [x[0], f(x[1])]
      case isRecordShorthand(x): return [x[0], f(x[1])]
      case isAllOfShorthand(x): return [x[0], f(x[1])]
      case isAnyOfShorthand(x): return [x[0], f(x[1])]
      case isObjectShorthand(x): return map(x, f)
      case isTupleShorthand(x): return map(x, f)
      case isConstStringLiteral(x): return x
    }
  }
}

function foldShorthand<T>(algebra: Functor.Algebra<lambda, T>) { return fn.cata(ShortFunctor)(algebra) }

namespace Recursive {
  export const UnrecognizedLiteral
    : (_: unknown) => never
    = (_) => fn.throw(""
      + `Unrecognized string literal. Expected the name of a type (like \`string\`") `
      + `or a string wrapped in quotes (like \`'xyx'\`, x), got: `,
      _
    )
  export const fromSeed: Functor.Algebra<lambda, AST.Node> = (x) => {
    switch (true) {
      case x === null: return t.null()
      case isTerminal(x): return terminalMap[x]()
      case isArrayShorthand(x): return t.array(x[1])
      case isRecordShorthand(x): return t.record(x[1])
      case isAllOfShorthand(x): return t.allOf(...tail(x))
      case isAnyOfShorthand(x): return t.anyOf(...tail(x))
      case isTupleShorthand(x): return t.tuple(...x)
      case isObjectShorthand(x): return t.object(x)
      case isConstStringLiteral(x): return t.const(parseConstStringLiteral(x))
      default: return typeof x === "string" ? UnrecognizedLiteral(x) : t.const(x)
    }
  }
}

const fromSeed = foldShorthand(Recursive.fromSeed)
// export const toJsonSchema = fold(Recursive.toJsonSchema)

export type { null_ as null }
declare namespace null_ {
  type Short = typeof shorthand
  const shorthand: null
  type shorthand<T> = [T] extends [typeof null_.shorthand] ? typeof null_.shorthand : never
}
export type { boolean_ as boolean }
declare namespace boolean_ {
  type Short = typeof shorthand
  const shorthand: typeof t.Tag.boolean
  type shorthand<T> = [T] extends [typeof boolean_.shorthand] ? typeof boolean_.shorthand : never
}
export type { symbol_ as symbol }
declare namespace symbol_ {
  type Short = typeof shorthand
  const shorthand: typeof t.Tag.symbol
  type shorthand<T> = [T] extends [typeof symbol_.shorthand] ? typeof symbol_.shorthand : never
}
export type { integer_ as integer }
declare namespace integer_ {
  type Short = typeof shorthand
  const shorthand: typeof t.Tag.integer
  type shorthand<T> = [T] extends [typeof integer_.shorthand] ? typeof integer_.shorthand : never
}
export type { number_ as number }
declare namespace number_ {
  type Short = typeof shorthand
  const shorthand: typeof t.Tag.number
  type shorthand<T> = [T] extends [typeof number_.shorthand] ? typeof number_.shorthand : never
}
export type { string_ as string }
declare namespace string_ {
  const shorthand: typeof t.Tag.string
  type Short = typeof string_.shorthand
  type shorthand<T> = [T] extends [typeof string_.shorthand] ? typeof string_.shorthand : never
}
export type { any_ as any }
declare namespace any_ {
  const shorthand: typeof t.Tag.any
  type Short = typeof any_.shorthand
  type shorthand<T> = [T] extends [typeof any_.shorthand] ? typeof any_.shorthand : never
}
export type { enum_ as enum }
declare namespace enum_ {}
export { const_ as const }
function const_<const T extends [T] extends [Primitive] ? Primitive : never>(value: T): t.const<const_.parse<T>>
function const_<const T extends { [x: number]: unknown }>(value: T, options: t.const.Options<T>): t.const<T>
function const_<const T extends { [x: number]: unknown }>(value: T, options?: t.const.Options<T>): t.const<T>
function const_<const T>(v: T, _?: t.const.Options) {
  return t.const(v, _)
}
declare namespace const_ {
  type shorthand<T>
  = [T] extends [string]
  ? [T] extends [`'${string}'`] ? `'${string}'`
  : [T] extends [`"${string}"`] ? `"${string}"`
  : [T] extends [`\`${string}\``] ? `\`${string}\``
  : never : unknown
  type validate<S>
    = [S] extends [string] ?
    | [S] extends [ `'${string}'` ] ? `'${string}'`
    : [S] extends [ `"${string}"` ] ? `"${string}"`
    : [S] extends [`\`${string}\``] ? `\`${string}\``
    : TypeError<`'short' requires string literals to be be wrapped in quotes (for example, pass '"hi"' instead of 'hi')`, S>
    : unknown
    ;
  type parse<S>
    = [S] extends [ `'${infer T}'` ] ? T
    : [S] extends [ `"${infer T}"` ] ? T
    : [S] extends [`\`${infer T}\``] ? T
    : S
    ;
}
export type { optional_ as optional }
declare namespace optional_ {
  const shorthand: `${string}?`
  type Short = typeof optional_.shorthand
  type shorthand<T> = [T] extends [typeof optional_.shorthand] ? typeof optional_.shorthand : never
}
export type { allOf_ as allOf }
declare namespace allOf_ { export { FromShort as fromShort, short as Short } }
declare namespace allOf_ {
  const shorthand: allOf_.Short<Short>
  type short<T> = readonly ["&", ...readonly T[]]
  type shorthand<T> = [T] extends [short<T>] ? short<T> : never
  type FromShort<S extends typeof t.allOf.spec> = never | t.allOf<{ -readonly [Ix in keyof S]: fromShort<S[Ix]> }>
}
export type { anyOf_ as anyOf }
declare namespace anyOf_ { export { short as Short, FromShort as fromShort }}
declare namespace anyOf_ {
  const spec: readonly unknown[]
  const children: readonly AST.Node[]
  const shorthand: anyOf_.Short<Short>
  type short<T> = readonly ["|", ...readonly T[]]
  type shorthand<T> = [T] extends [anyOf_.Short<T>] ? anyOf_.Short<T> : never
  type FromShort<S extends typeof anyOf_.spec> = never | t.anyOf<{ -readonly [Ix in keyof S]: fromShort<S[Ix]> }>
  type toJsonSchema<T extends typeof anyOf_.spec> = never | { anyOf: { [I in keyof T]: T[I]["toJsonSchema" & keyof T[I]] } }
}
export type { oneOf_ as oneOf }
declare namespace oneOf_ { export { short as Short, FromShort as fromShort } }
declare namespace oneOf_ {
  const shorthand: oneOf_.Short<Short>
  type short<T> = readonly ["|", ...readonly T[]]
  type shorthand<T> = [T] extends [oneOf_.Short<T>] ? oneOf_.Short<T> : never
  type FromShort<S extends typeof t.oneOf.spec> = never | t.oneOf<{ -readonly [Ix in keyof S]: fromShort<S[Ix]> }>
}
export type { array_ as array }
declare namespace array_ { export { short as Short, FromShort as fromShort } }
declare namespace array_ {
  type short<T> = readonly ["[]", T]
  const shorthand: array_.Short<Short>
  type FromShort<S> = never | t.array<fromShort<S>>
}
export type { record_ as record }
declare namespace record_ { export type { short as Short, FromShort as fromShort } }
declare namespace record_ {
    const shorthand: record_.Short<Short>
    type FromShort<T> = never | t.record<fromShort<T>>
    type short<T> = readonly ["{}", T]
}
export type { object_ as object}
declare namespace object_ { export { FromShort as fromShort, short as Short } }
declare namespace object_ {
  const shorthand: never | object_.Short<Short>
  type short<T> = never | { [x: string]: T }
  type shorthand<T> = [T] extends [typeof shorthand] ? typeof shorthand : never
  type FromShort<T> = never | t.object<_fromShort<T>>
  type _fromShort<
    S,
    Opt extends t.object.hasQuestionMark<S> = t.object.hasQuestionMark<S>,
    Req extends t.object.noQuestionMark<S> = t.object.noQuestionMark<S>
  > = never | Force<
    & t.object.$<{ [K in Opt as K extends `${infer _}?` ? _ : K]: t.optional<fromShort<S[K]>> }>
    & t.object.$<{ [K in Req]-?: fromShort<S[K]> }>
  >
}
export type { tuple_ as tuple }
declare namespace tuple_ { export { short as Short, FromShort as fromShort } }
declare namespace tuple_ {
  const shorthand: tuple_.Short<Short>
  type short<T> = readonly T[]
  type shorthand<T> = [T] extends [tuple_.Short<Short>] ? tuple_.Short<Short> : never
  type FromShort<T extends typeof tuple_.shorthand>
    = never | { -readonly [I in keyof T]: fromShort<T[I]> } extends
    | infer S extends readonly unknown[]
    ? t.tuple<S> : never
    ;
}

/**
 * @deprecated use {@link t `t`} instead
 */
export const short: {
  (s: undefined): t.null
  (s: null): t.null
  <const S extends Terminal>(s: S): typeof TerminalByTag[S]
  <const S extends string>(s: S): t.const<const_.parse<S>>
  <const S extends readonly Short[]>($: "|", ...ss: S): anyOf_.fromShort<S>
  <const S extends readonly Short[]>($: "&", ...ss: S): allOf_.fromShort<S>
  <const S extends Short>($: "[]", s: S): array_.fromShort<S>
  <const S extends Short>($: "{}", s: S): record_.fromShort<S>
  <const S extends object_.shorthand<S>>(s: S): object_.fromShort<S>
  <const S extends tuple_.shorthand<S>>(ss: S): tuple_.fromShort<S>
  <const S>(s: S): t.const<S>
} = ((
  ...args:
    | [x: undefined]
    | [x: null]
    | [x: Terminal]
    | [x: `'${string}'`]
    | [x: `"${string}"`]
    | [x: `\`${string}\``]
    | [$: "|", ...xs: Short[]]
    | [$: "&", ...xs: Short[]]
    | [$: "[]", x: Short]
    | [$: "{}", x: Short]
    | [x: object_.Short<Short>]
    | [xs: tuple_.Short<Short>]
) => {
  /** forcing the 2nd overload for use in a pipeline */
  const objectSchema
    : <S extends typeof t.object.children>(spec: S) => t.object<S>
    = t.object
  switch (true) {
    case args[0] === null: return t.null()
    case isTerminal(args[0]): return terminalMap[args[0]]()
    case isConstStringLiteral(args[0]): return t.const(parseConstStringLiteral(args[0]))
    case args[0] === "[]": return t.array(fromSeed(args[1]))
    case args[0] === "{}": return t.record(fromSeed(args[1]))
    case args[0] === "&": return t.allOf(...tail(args).map(fromSeed))
    case args[0] === "|": return t.anyOf(...tail(args).map(fromSeed))
    case isObjectShorthand(args[0]): return fn.pipe(
      Object.entries(args[0]),
      (xs) => xs.map(([k, v]) => [k, fromSeed(v)] satisfies [string, any]),
      Object.fromEntries,
      objectSchema,
    )
    case isTupleShorthand(args): return t.tuple(...args.filter((x) => x !== undefined).map((x) => fromSeed(x)))
    default: return typeof args[0] === "string" ? Recursive.UnrecognizedLiteral(args[0]) : t.const(args[0] as never)
  }
}) as never // TODO: fix type assertion

const fromShort
  : <T>(x: T) => fromShort<T>
  = (x) => x as never

// type OrderedSchemas = [
//   null_,
//   boolean_,
//   symbol_,
//   integer_,
//   number_,
//   string_,
//   any_,
//   enum_<typeof enum_.spec>,
//   const_<typeof const_.spec>,
//   optional_<typeof optional_.spec>,
//   array_<typeof array_.spec>,
//   record_<typeof record_.spec>,
//   tuple_<typeof tuple_.spec>,
//   allOf_<typeof allOf_.spec>,
//   anyOf_<typeof anyOf_.spec>,
//   oneOf_<typeof oneOf_.spec>,
//   object_<typeof object_.spec>,
// ]
// const SchemaMap = {
//   null: null_,
//   boolean: boolean_,
//   symbol: symbol_,
//   integer: integer_,
//   number: number_,
//   string: string_,
//   any: any_,
//   enum: enum_,
//   const: const_,
//   optional: optional_,
//   array: array_,
//   record: record_,
//   tuple: tuple_,
//   allOf: allOf_,
//   anyOf: anyOf_,
//   oneOf: oneOf_,
//   object: object_,
// }
// type SchemaOrder<T extends typeof SchemaOrder = typeof SchemaOrder> = { [I in keyof T]: T[I] }
// const SchemaOrder = [
//   SchemaMap.null,
//   SchemaMap.boolean,
//   SchemaMap.symbol,
//   SchemaMap.integer,
//   SchemaMap.number,
//   SchemaMap.string,
//   SchemaMap.any,
//   SchemaMap.const,
//   SchemaMap.optional,
//   SchemaMap.array,
//   SchemaMap.record,
//   SchemaMap.tuple,
//   SchemaMap.allOf,
//   SchemaMap.anyOf,
//   SchemaMap.oneOf,
//   SchemaMap.object,
// ] as const
