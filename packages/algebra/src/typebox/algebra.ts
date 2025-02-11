import * as t from '@sinclair/typebox'

import { core, schema, tree } from '@traversable/core'
import { fn, map, object } from '@traversable/data';
import type { Functor, HKT, _, newtype } from '@traversable/registry'

import TNever = t.TNever
import TAny = t.TAny
import TVoid = t.TVoid
import TUnknown = t.TUnknown
import TUndefined = t.TUndefined
import TNull = t.TNull
import TSymbol = t.TSymbol
import TBoolean = t.TBoolean
import TInteger = t.TInteger
import TBigInt = t.TBigInt
import TNumber = t.TNumber
import TString = t.TString
import K = t.Kind
import OptionalKind = t.OptionalKind
import ReadonlyKind = t.ReadonlyKind

type Tag = typeof Tag
const Tag = {
  never: t.Never()[K],
  any: t.Any()[K],
  unknown: t.Unknown()[K],
  null: t.Null()[K],
  undefined: t.Undefined()[K],
  void: t.Void()[K],
  array: t.Array(t.Never())[K],
  bigint: t.BigInt()[K],
  boolean: t.Boolean()[K],
  integer: t.Integer()[K],
  number: t.Number()[K],
  string: t.String()[K],
  record: t.Record(t.Never(), t.Never())[K],
  object: t.Object({})[K],
  tuple: t.Tuple([])[K],
  literal: t.Literal(false)[K],
  symbol: t.Symbol()[K],
  union: t.Union([t.Number(), t.String()])[K],
  intersect: t.Intersect([t.Never(), t.Never()])[K],
  optional: 'Optional' as const,
  readonly: 'Readonly' as const,
}

const PropertyPattern = {
  AnyString: '^\(.*\)$'
} as const

declare namespace T {
  export {
    TNever as Never,
    TAny as Any,
    TVoid as Void,
    TUnknown as Unknown,
    TUndefined as Undefined,
    TNull as Null,
    TSymbol as Symbol,
    TBoolean as Boolean,
    TInteger as Integer,
    TBigInt as BigInt,
    TNumber as Number,
    TString as String,
  }
}

declare namespace T {
  interface Literal<S = _> { [K]: Tag['literal'], const: S }
  interface Array<S = _> { [K]: Tag['array'], items: S }
  interface StringIndex<S = _> { [K]: Tag['record'], patternProperties: { ['^(.*)$']: S } }
  interface NumericIndex<S = _> { [K]: Tag['record'], patternProperties: { ['^(0|[1-9][0-9]*)$']: S } }
  interface Record<S = _> { [K]: Tag['record'], additionalProperties?: S, patternProperties?: globalThis.Record<string, S> }
  interface Union<S = _> { [K]: Tag['union'], anyOf: S }
  interface Intersect<S = _> { [K]: Tag['intersect'], allOf: S }
  interface Tuple<S = _> { [K]: Tag['tuple'], items?: S }
  interface Optional<S = _> { [K]: Tag['optional'], target: S }
  interface Readonly<S = _> { [K]: Tag['readonly'], target: S }
  interface Object<S = _> { [K]: Tag['object'], properties: S }
  ///////////////////////////
  ///    special cases    ///
  interface UnparsedOptional<S = _> extends newtype<S & {}> { [OptionalKind]: Tag['optional'], [K]: Tag[keyof Tag] }
  interface UnparsedReadonly<S = _> extends newtype<S & {}> { [ReadonlyKind]: Tag['readonly'], [K]: Tag[keyof Tag] }
  ///    special cases    ///
  ///////////////////////////
  interface lambda extends HKT { [-1]: F<this[0]> }
  type F<S = _> =
    | T.Never
    | T.Any
    | T.Void
    | T.Unknown
    | T.Undefined
    | T.Null
    | T.Symbol
    | T.Boolean
    | T.Integer
    | T.BigInt
    | T.Number
    | T.String
    | T.Literal
    | T.Array<S>
    | T.Record<S>
    | T.Union<S[]>
    | T.Intersect<S[]>
    | T.Tuple<S[]>
    | T.Optional<S>
    | T.Readonly<S>
    | T.Object<{ [x: string]: S }>
    ;
  type lookup<K extends keyof Tag, S = _> = T.byTag<S>[typeof Tag[K]]
  type byTag<S> = {
    [Tag.any]: T.Any
    [Tag.array]: T.Array<S>
    [Tag.bigint]: T.BigInt
    [Tag.boolean]: T.Boolean
    [Tag.integer]: T.Integer
    [Tag.intersect]: T.Intersect<S>
    [Tag.literal]: T.Literal
    [Tag.never]: T.Never
    [Tag.null]: T.Null
    [Tag.number]: T.Number
    [Tag.object]: T.Object<S>
    [Tag.record]: T.Record<S>
    [Tag.string]: T.String
    [Tag.symbol]: T.Symbol
    [Tag.tuple]: T.Tuple<S>
    [Tag.undefined]: T.Undefined
    [Tag.union]: T.Union<S>
    [Tag.unknown]: T.Unknown
    [Tag.void]: T.Void
    [Tag.optional]: T.Optional<S>
    [Tag.readonly]: T.Readonly<S>
  }

  type AnyRawType = Raw | { [K]: string }
  namespace Raw { interface lambda extends HKT { [-1]: Raw<this[0]> } }
  type Raw<S = _> =
    | T.Never
    | T.Any
    | T.Unknown
    | T.Void
    | T.Undefined
    | T.Null
    | T.Symbol
    | T.Boolean
    | T.Integer
    | T.BigInt
    | T.Number
    | T.String
    | T.Literal
    | T.Array<S>
    | T.Record<S>
    | T.Union<S[]>
    | T.Intersect<S[]>
    | T.Tuple<S[]>
    | T.Object<{ [x: string]: S }>
    | T.UnparsedOptional<S>
    | T.UnparsedReadonly<S>
    ;

  type Leaf =
    | T.Never
    | T.Any
    | T.Unknown
    | T.Void
    | T.Undefined
    | T.Null
    | T.Symbol
    | T.Boolean
    | T.Integer
    | T.BigInt
    | T.Number
    | T.String
    | T.Literal
    ;
}

function tagged<K extends keyof Tag>(tag: K): <S>(u: unknown) => u is T.lookup<K, S>
function tagged<K extends keyof Tag>(tag: K) { return (u: unknown) => tree.has(K, core.is.literally(Tag[tag]))(u) }

const isLeaf
  : (u: unknown) => u is T.Leaf
  = schema.anyOf$(
    tagged('never'),
    tagged('any'),
    tagged('unknown'),
    tagged('void'),
    tagged('undefined'),
    tagged('null'),
    tagged('symbol'),
    tagged('boolean'),
    tagged('integer'),
    tagged('bigint'),
    tagged('number'),
    tagged('string'),
    tagged('literal'),
  )

const Functor_: Functor<T.lambda, T.Raw> = {
  map(g) {
    return (z) => {
      const x = parseRaw(z)

      switch (true) {
        default: return x
        ///  leaves, a.k.a "nullary" types
        case isLeaf(x): return x
        ///  branches, a.k.a. "unary" types
        case isRecord(x): return mapRecord(g)(x) satisfies T.Record
        case tagged('object')(x): return { ...x, properties: map(x.properties, g) } satisfies T.Object
        case isTuple(x): return { ...x, items: !x.items ? [] : map(x.items, g)} satisfies T.Tuple
        case tagged('array')(x): return { ...x, items: g(x.items) } satisfies T.Array
        case isParsedOptional(x): return { ...x, target: g(x.target) } satisfies T.Optional
        case isParsedReadonly(x): return { ...x, target: g(x.target) } satisfies T.Readonly
        case tagged('union')(x): return { ...x, anyOf: map(x.anyOf, g) } satisfies T.Union
        case tagged('intersect')(x): return { ...x, allOf: map(x.allOf, g) } satisfies T.Intersect
      }
    }
  }
}

export namespace Algebra {
  const showRecord
    : (x: T.Record<string>) => string
    = (x) => x.additionalProperties
      ? `T.Record(T.String(), ${x.additionalProperties})`
      : x.patternProperties === undefined ? fn.throw(`'showRecord' encountered a record it did not know how to show`, x)
      : !!x.patternProperties[PropertyPattern.AnyString] ? `T.Record(T.String(), ${Object.values(x.patternProperties)})`
      : fn.throw(`'showRecord' encountered a pattern property that it does not recognize`)

  export const parse: Functor.Algebra<T.Raw.lambda, T.F> = (x) => {
    switch (true) {
      case isUnparsedOptional(x): return parseOptional(x)
      case isUnparsedReadonly(x): return parseReadonly(x)
      default: return x
    }
  }

  export const toString: Functor.Algebra<T.lambda, string> = (x) => {
    switch (true) {
      default: return fn.exhaustive(x)
      ///  special cases that need to be handled first
      ///  leaves, a.k.a. "nullary" types
      case tagged('never')(x): return `T.Never()`
      case tagged('any')(x): return `T.Any()`
      case tagged('unknown')(x): return `T.Unknown()`
      case tagged('void')(x): return `T.Void()`
      case tagged('undefined')(x): return `T.Undefined()`
      case tagged('null')(x): return `T.Null()`
      case tagged('symbol')(x): return `T.Symbol()`
      case tagged('boolean')(x): return `T.Boolean()`
      case tagged('bigint')(x): return `T.Bigint()`
      case tagged('integer')(x): return `T.Integer()`
      case tagged('number')(x): return `T.Number()`
      case tagged('string')(x): return `T.String()`
      ///  branches, a.k.a. "unary" types
      case tagged('optional')(x): return `T.Optional(${x.target})`
      case tagged('readonly')(x): return `T.Readonly(${x.target})`
      case tagged('literal')(x): return `T.Literal(${JSON.stringify(x.const)})`
      case tagged('array')(x): return `T.Array(${x.items})`
      case tagged('intersect')(x): return `T.Intersect(${x.allOf.join(', ')})`
      case tagged('union')(x): return `T.Union([${x.anyOf.join(', ')}])`
      case tagged('tuple')(x): {
        return !x.items || x.items.length === 0
          ? `T.Tuple([])`
          : `T.Tuple([${x.items.join(', ')}])${''/** ...rest */}`
      }
      case isRecord(x): return showRecord(x)
      case tagged('object')(x): {
        const xs = globalThis.Object.entries(x.properties)
        return xs.length === 0
          ? `T.Object({})`
          : `T.Object({ ${xs.map(([k, v]) => object.parseKey(k) + ': ' + v).join(', ')} })`
      }
    }
  }
}

export const toString 
  : <S extends T.AnyRawType>(term: S) => string
  = fn.cata(Functor_)(Algebra.toString) as never

const isRecord
  : <S>(u: unknown) => u is T.Record<S>
  = (u): u is never => tree.has('type', core.is.literally('object'))(u) && tree.has('patternProperties')(u)

const isTuple
  : <S>(u: unknown) => u is T.Tuple<S>
  = (u): u is never =>
    tree.has('type', core.is.literally('array'))(u)
    && tree.has('minItems', core.is.number)(u)
    && tree.has('maxItems', core.is.number)(u)
    && u.minItems === u.maxItems

const isUnparsedOptional
  : <S>(u: unknown) => u is T.UnparsedOptional<S>
  = tree.has(OptionalKind, core.is.literally(Tag.optional)) as never

const isParsedOptional
  : <S>(u: unknown) => u is T.Optional<S>
  = schema.allOf$(
    tree.has(K, core.is.literally(Tag.optional)),
    tree.has('target', core.is.any),
  )

const isUnparsedReadonly
  : <S>(u: unknown) => u is T.UnparsedReadonly<S>
  = tree.has(ReadonlyKind, core.is.literally(Tag.readonly)) as never

const isParsedReadonly
  : <S>(u: unknown) => u is T.Readonly<S>
  = schema.allOf$(
    tree.has(K, core.is.literally(Tag.readonly)),
    tree.has('target', core.is.any),
  )

const parseOptional
  : <S>(unparsed: T.UnparsedOptional<S>) => T.Optional<S>
  = <S>(unparsed: T.UnparsedOptional<S>) => ({
    [K]: Tag.optional,
    target: {
      ...object.omit(unparsed, OptionalKind) as {},
      [K]: unparsed[K],
    } as never
  })

const parseReadonly
  : <S>(unparsed: T.UnparsedReadonly<S>) => T.Readonly<S>
  = <S>(unparsed: T.UnparsedReadonly<S>) => ({
    [K]: Tag.readonly,
    target: {
      ...object.omit(unparsed, ReadonlyKind) as {},
      [K]: unparsed[K],
    } as never
  })

const parseRaw
  : <S>(unparsed: T.Raw<S> | T.F<S>) => T.F<S>
  = (x) => (
      isUnparsedReadonly(x) ? parseReadonly(x)
    : isUnparsedOptional(x) ? parseOptional(x)
    : x
  ) as never

const mapRecord
  : <S, T>(f: (s: S) => T) => (x: T.Record<S>) => T.Record<T>
  = (f) => ({ additionalProperties, patternProperties, ...x }) => ({
    ...x,
    ...additionalProperties &&
    ({ additionalProperties: f(additionalProperties) }),
    ...patternProperties &&
    ({ patternProperties: map(patternProperties, f) }),
  })


