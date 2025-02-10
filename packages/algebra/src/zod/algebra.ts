import { z } from 'zod'

import { Json, core, tree } from '@traversable/core'
import { Option, map as fmap, fn, map, object } from '@traversable/data';
import type { Functor, HKT, IndexedFunctor, _ } from '@traversable/registry'

import * as Print from '../print.js'

export {
  type Z as z,
  Algebra,
  Functor_ as Functor,
  tag,
  tagged,
  toString,
  serialize,
  fromValueObject,
  fromUnknownValue,
  unsafeFromUnknownValue,
}

const Array_isArray 
  : <T>(u: unknown) => u is readonly T[]
  = globalThis.Array.isArray

const tag = z.ZodFirstPartyTypeKind
type Tag = typeof Tag
const Tag = {
  /* alias */ allOf: `${tag[tag.ZodIntersection]}` as const,
  /* alias */ anyOf: `${tag[tag.ZodUnion]}` as const,
  /* alias */ oneOf: `${tag[tag.ZodDiscriminatedUnion]}` as const,
  any: `${tag.ZodAny}` as const,
  array: `${tag[tag.ZodArray]}` as const,
  bigint: `${tag[tag.ZodBigInt]}` as const,
  boolean: `${tag[tag.ZodBoolean]}` as const,
  branded: `${tag[tag.ZodBranded]}` as const,
  catch: `${tag[tag.ZodCatch]}` as const,
  date: `${tag[tag.ZodDate]}` as const,
  default: `${tag[tag.ZodDefault]}` as const,
  effects: `${tag[tag.ZodEffects]}` as const,
  enum: `${tag[tag.ZodEnum]}` as const,
  function: `${tag[tag.ZodFunction]}` as const,
  lazy: `${tag[tag.ZodLazy]}` as const,
  literal: `${tag[tag.ZodLiteral]}` as const,
  map: `${tag[tag.ZodMap]}` as const,
  NaN: `${tag[tag.ZodNaN]}` as const,
  nativeEnum: `${tag[tag.ZodNativeEnum]}` as const,
  never: `${tag[tag.ZodNever]}` as const,
  null: `${tag[tag.ZodNull]}` as const,
  nullable: `${tag[tag.ZodNullable]}` as const,
  number: `${tag[tag.ZodNumber]}` as const,
  object: `${tag[tag.ZodObject]}` as const,
  optional: `${tag[tag.ZodOptional]}` as const,
  pipeline: `${tag[tag.ZodPipeline]}` as const,
  promise: `${tag[tag.ZodPromise]}` as const,
  readonly: `${tag[tag.ZodReadonly]}` as const,
  record: `${tag[tag.ZodRecord]}` as const,
  set: `${tag[tag.ZodSet]}` as const,
  string: `${tag[tag.ZodString]}` as const,
  symbol: `${tag[tag.ZodSymbol]}` as const,
  tuple: `${tag[tag.ZodTuple]}` as const,
  undefined: `${tag[tag.ZodUndefined]}` as const,
  unknown: `${tag[tag.ZodUnknown]}` as const,
  void: `${tag[tag.ZodVoid]}` as const,
}

declare namespace Z {
  type lookup<K extends keyof Tag, S = _> = Z.byTag<S>[Tag[K]]
  type byTag<S> = {
    /* alias */ [Tag.allOf]: Z.AllOf<S>
    /* alias */ [Tag.anyOf]: Z.AnyOf<S>
    /* alias */ [Tag.oneOf]: Z.OneOf<S>
    [Tag.any]: Z.Any
    [Tag.array]: Z.Array<S>
    [Tag.bigint]: Z.BigInt
    [Tag.boolean]: Z.Boolean
    [Tag.branded]: Z.Branded<S>
    [Tag.catch]: Z.Catch<S>
    [Tag.date]: Z.Date
    [Tag.default]: Z.Default<S>
    [Tag.effects]: Z.Effect<S>
    [Tag.enum]: Z.Enum
    [Tag.function]: Z.Function<S>
    [Tag.lazy]: Z.Lazy<S>
    [Tag.literal]: Z.Literal<S>
    [Tag.map]: Z.Map<S>
    [Tag.NaN]: Z.NaN
    [Tag.nativeEnum]: Z.NativeEnum<S>
    [Tag.never]: Z.Never
    [Tag.null]: Z.Null
    [Tag.nullable]: Z.Nullable<S>
    [Tag.number]: Z.Number
    [Tag.object]: Z.Object<S>
    [Tag.optional]: Z.Optional<S>
    [Tag.pipeline]: Z.Pipeline<S>
    [Tag.promise]: Z.Promise<S>
    [Tag.readonly]: Z.Readonly<S>
    [Tag.record]: Z.Record<S>
    [Tag.set]: Z.Set<S>
    [Tag.string]: Z.String
    [Tag.symbol]: Z.Symbol
    [Tag.tuple]: Z.Tuple<S>
    [Tag.undefined]: Z.Undefined
    [Tag.unknown]: Z.Unknown
    [Tag.void]: Z.Void
  }

  interface Never { _def: { typeName: Tag['never'] } }
  interface Any { _def: { typeName: Tag['any'] } }
  interface Unknown { _def: { typeName: Tag['unknown'] } }
  interface Undefined { _def: { typeName: Tag['undefined'] } }
  interface Null { _def: { typeName: Tag['null'] } }
  interface Void { _def: { typeName: Tag['void'] } }
  interface NaN { _def: { typeName: Tag['NaN'] } }
  interface Symbol { _def: { typeName: Tag['symbol'] } }
  interface Boolean { _def: { typeName: Tag['boolean'] } }
  interface BigInt { _def: { typeName: Tag['bigint'] } }
  // ._def.checks.find((check) => check.kind === 'int')
  interface Number { _def: { typeName: Tag['number'], checks?: Number.Check[] } }
  interface String { _def: { typeName: Tag['string'] } }
  interface Date { _def: { typeName: Tag['date'] } }
  interface Branded<S = _> { _def: { typeName: Tag['branded'], type: S } }
  interface Optional<S = _> { _def: { typeName: Tag['optional'], innerType: S } }
  interface Nullable<S = _> { _def: { typeName: Tag['nullable'], innerType: S } }
  interface Array<S = _> { _def: { typeName: Tag['array'] } & Array.Check, element: S }
  interface Set<S = _> { _def: { typeName: Tag['set'], valueType: S } }
  interface Map<S = _> { _def: { typeName: Tag['map'], keyType: S, valueType: S } }
  interface Readonly<S = _> { _def: { typeName: Tag['readonly'], innerType: S } }
  interface Promise<S = _> { _def: { typeName: Tag['promise'], type: S  } }
  interface Object<S = _> { _def: { typeName: Tag['object'], catchall: S }, shape: { [x: string]: S } }
  interface Branded<S = _> { _def: { typeName: Tag['branded'], type: S } }
  interface Record<S = _> { _def: { typeName: Tag['record'] }, element: S }
  interface Tuple<S = _> { _def: { typeName: Tag['tuple'], items: [S, ...S[]], rest?: S } }
  interface Function<S = _> { _def: { typeName: Tag['function'], args: [] | [S, ...S[]], returns: S } }
  interface Lazy<S = _> { _def: { typeName: Tag['lazy'], getter(): S } }
  interface AllOf<S = _> { _def: { typeName: Tag['allOf'], left: S, right: S } }
  interface AnyOf<S = _> { _def: { typeName: Tag['anyOf'], options: readonly [S, S, ...S[]] } }
  interface Catch<S = _> { _def: { typeName: Tag['catch'], catchValue: S } }
  interface Default<S = _> { _def: { typeName: Tag['default'], defaultValue: S } }
  interface Effect<S = _> { _def: { typeName: Tag['effects'], schema: S, effect: S } }
  interface Pipeline<S = _> { _def: { typeName: Tag['pipeline'], in: S, out: S } }
  interface OneOf<S = _, K extends keyof any = keyof any> { 
    _def: { 
      discriminator: K
      typeName: Tag['oneOf'], options: readonly (Z.Object<S>)[] 
    } 
  }
  interface Enum<N = _> { _def: { typeName: Tag['enum'], values: [N, ...N[]] } }
  interface Literal<N = _> { _def: { typeName: Tag['literal'], value: N } }
  interface NativeEnum<N = _> { _def: { typeName: Tag['nativeEnum'], values: { [x: number]: N } } }
  //
  interface lambda extends HKT { [-1]: Z.F<this[0]> }
  type F<S> =
    | Z.Never
    | Z.Any
    | Z.Unknown
    | Z.Undefined
    | Z.Null
    | Z.Void
    | Z.NaN
    | Z.Symbol
    | Z.Boolean
    | Z.BigInt
    | Z.Number
    | Z.String
    | Z.Date
    | Z.Enum
    | Z.Literal
    | Z.NativeEnum
    | Z.Optional<S>
    | Z.Nullable<S>
    | Z.Array<S>
    | Z.Set<S>
    | Z.Map<S>
    | Z.Readonly<S>
    | Z.Promise<S>
    | Z.Object<S>
    | Z.Branded<S>
    | Z.Record<S>
    | Z.Tuple<S>
    | Z.Function<S>
    | Z.Lazy<S>
    | Z.AllOf<S>
    | Z.AnyOf<S>
    | Z.OneOf<S>
    | Z.Catch<S>
    | Z.Default<S>
    | Z.Effect<S>
    | Z.Pipeline<S>
    ;

  // TODO: make this more granular
  namespace Number {
    interface Check { 
      kind: 'int' | 'min' | 'max' | 'finite' | 'multipleOf', 
      value?: number, 
      inclusive?: boolean 
    }
  }
  namespace Array {
    interface Check {
      minLength: null | { value: number  }
      maxLength: null | { value: number }
      exactLength: null | { value: number }
    }
  }

}

const tagged
  : <K extends keyof Tag>(tag: K) => <S>(u: unknown) => u is Z.lookup<K, S>
  = (tag) => tree.has('_def', 'typeName', core.is.literally(Tag[tag])) as never

function deriveObjectNode<S, T>(f: (s: S) => T): (x: Z.Object<S>) => Z.Object<T>
function deriveObjectNode<S, T>(f: (s: S) => T) {
  return (x: Z.Object<S>) => ({
    ...x,
    shape: fmap(x.shape, f),
    _def: {
      ...x._def,
      ...!tagged('never')(x._def.catchall) && { catchall: f(x._def.catchall) }
    },
  })
}

function deriveTupleNode<S, T>(f: (s: S) => T): (x: Z.Tuple<S>) => Z.Tuple<T>
function deriveTupleNode<S, T>(f: (s: S) => T) {
  return (x: Z.Tuple<S>) => ({
    ...x,
    _def: { 
      ...x._def, 
      items: fmap(x._def.items, f), 
      ...x._def.rest && { rest: f(x._def.rest) },
    }
  })
}

function deriveOneOfNode<S, T>(f: (s: S) => T): (x: Z.OneOf<S>) => Z.OneOf<T>
function deriveOneOfNode<S, T>(f: (s: S) => T) {
  return (x: Z.OneOf<S>) => ({
    ...x,
    _def: { 
      ...x._def, 
      discriminator: x._def.discriminator,
      options: fmap(x._def.options, deriveObjectNode(f)),
    }
  })
}

const Functor_: Functor<Z.lambda, Any> = {
  map(f) {
    return (x) => {
      switch (true) {
        default: return x // fn.exhaustive(x)
        ///  leaves, a.k.a "nullary" types
        case tagged('never')(x): return x
        case tagged('any')(x): return x
        case tagged('unknown')(x): return x
        case tagged('void')(x): return x
        case tagged('undefined')(x): return x
        case tagged('null')(x): return x
        case tagged('symbol')(x): return x
        case tagged('NaN')(x): return x
        case tagged('boolean')(x): return x
        case tagged('bigint')(x): return x
        case tagged('date')(x): return x
        case tagged('number')(x): return x
        case tagged('string')(x): return x
        ///  branches, a.k.a. "unary" types
        case tagged('object')(x): return deriveObjectNode(f)(x)
        case tagged('enum')(x): return { ...x, _def: { ...x._def, values: x._def.values } } satisfies Z.Enum
        case tagged('nativeEnum')(x): return { ...x, _def: { ...x._def, values: x._def.values } } satisfies Z.NativeEnum
        case tagged('literal')(x): return { ...x, _def: { ...x._def, value: x._def.value } } satisfies Z.Literal
        case tagged('branded')(x): return { ...x, _def: { ...x._def, type: f(x._def.type) }} satisfies Z.Branded
        case tagged('set')(x): return { ...x, _def: { ...x._def, valueType: f(x._def.valueType) } } satisfies Z.Set
        case tagged('promise')(x): return { ...x, _def: { ...x._def, type: f(x._def.type) } } satisfies Z.Promise
        case tagged('map')(x): return { ...x, _def: { ...x._def, keyType: f(x._def.keyType), valueType: f(x._def.valueType) } } satisfies Z.Map
        case tagged('readonly')(x): return { ...x, _def: { ...x._def, innerType: f(x._def.innerType) } } satisfies Z.Readonly
        case tagged('nullable')(x): return { ...x, _def: { ...x._def, innerType: f(x._def.innerType) } } satisfies Z.Nullable
        case tagged('optional')(x): return { ...x, _def: { ...x._def, innerType: f(x._def.innerType) } } satisfies Z.Optional
        case tagged('array')(x): return { ...x, _def: { ...x._def }, element: f(x.element) } satisfies Z.Array
        case tagged('record')(x): return { ...x, _def: { ...x._def, }, element: f(x.element) } satisfies Z.Record
        case tagged('allOf')(x): return { ...x, _def: { ...x._def, left: f(x._def.left), right: f(x._def.right) } } satisfies Z.AllOf
        case tagged('anyOf')(x): return { ...x, _def: { ...x._def, options: fmap(x._def.options, f) } } satisfies Z.AnyOf
        case tagged('lazy')(x): return { ...x, _def: { ...x._def, getter: () => f(x._def.getter()) } } satisfies Z.Lazy
        case tagged('function')(x): return { ...x, _def: { ...x._def, args: fmap(x._def.args, f), returns: f(x._def.returns) } } satisfies Z.Function
        case tagged('pipeline')(x): return { ...x, _def: { ...x._def, in: f(x._def.in), out: f(x._def.out) } } satisfies Z.Pipeline
        case tagged('catch')(x): return { ...x, _def: { ...x._def, catchValue: f(x._def.catchValue) } } satisfies Z.Catch
        case tagged('default')(x): return { ...x, _def: { ...x._def, defaultValue: f(x._def.defaultValue) } } satisfies Z.Default
        case tagged('effects')(x): return { ...x, _def: { ...x._def, schema: f(x._def.schema), effect: f(x._def.effect) } } satisfies Z.Effect
        case tagged('oneOf')(x): return deriveOneOfNode(f)(x) satisfies Z.OneOf
        case tagged('tuple')(x): return deriveTupleNode(f)(x) satisfies Z.Tuple
      }
    }
  }
}

function compileObjectNode<S>(x: Z.Object<S>) {
  const xs = Object.entries(x.shape)
  return xs.length === 0 ? `z.object({})` : `z.object({ ${
    xs.map(([k, v]) => object.parseKey(k) + ': ' + v).join(', ')} })${
    typeof x._def.catchall === 'string' ? `.catchall(${x._def.catchall})` : ''}`
}

const applyNumberConstraints = (x: Z.Number) => ''
  + (!x._def.checks?.length ? '' : '.')
  + ( x._def.checks?.map((check) => 
      ! Number.isFinite(check.value) ? `${check.kind}()`
      : check.kind === 'min' ? `${check.inclusive ? 'min' : 'gt'}(${check.value})`
      : check.kind === 'max' ? `${check.inclusive ? 'max' : 'lt'}(${check.value})`
      : `${check.kind}(${check.value})`
    ).join('.')
  )

const applyArrayConstraints = (x: Z.Array) => ([
  Number.isFinite(x._def.minLength?.value) && `.min(${x._def.minLength?.value})`,
  Number.isFinite(x._def.maxLength?.value) && `.max(${x._def.maxLength?.value})`,
  Number.isFinite(x._def.exactLength?.value) && `.length(${x._def.exactLength?.value})`
]).filter((_) => typeof _ === 'string').join('')


const FormatFunctor: IndexedFunctor<number, Json.lambda> = {
  map: Json.Functor.map,
  mapWithIndex(f) {
    return (indent, x) => {
      switch (true) {
        default: return fn.exhaustive(x)
        case x === null:
        case x === undefined:
        case x === true:
        case x === false:
        case typeof x === 'number':
        case typeof x === 'string': return x
        case Array_isArray(x): return x.map((s) => f(indent + 2, s))
        case !!x && typeof x === 'object': return map(x, (s) => f(indent + 2, s))
      }
    }
  }
}

namespace Algebra {
  export const toString: Functor.Algebra<Z.lambda, string> = (x) => {
    switch (true) {
      default: return x // fn.exhaustive(x)
      ///  leaves, a.k.a. "nullary" types
      case tagged('never')(x): return 'z.never()'
      case tagged('any')(x): return 'z.any()'
      case tagged('unknown')(x): return 'z.unknown()'
      case tagged('void')(x): return 'z.void()'
      case tagged('undefined')(x): return 'z.undefined()'
      case tagged('null')(x): return 'z.null()'
      case tagged('symbol')(x): return 'z.symbol()'
      case tagged('NaN')(x): return 'z.NaN()'
      case tagged('boolean')(x): return 'z.boolean()'
      case tagged('bigint')(x): return 'z.bigint()'
      case tagged('date')(x): return 'z.date()'
      case tagged('number')(x): return `z.number()${applyNumberConstraints(x)}`
      case tagged('string')(x): return 'z.string()'
      ///  branches, a.k.a. "unary" types
      case tagged('branded')(x): return `z.branded(${x._def.type})`
      case tagged('set')(x): return `z.set(${x._def.valueType})`
      case tagged('promise')(x): return `z.promise(${x._def.type})`
      case tagged('map')(x): return `z.map(${x._def.keyType}, ${x._def.valueType})`
      case tagged('readonly')(x): return `${x._def.innerType}.readonly()`
      case tagged('nullable')(x): return `${x._def.innerType}.nullable()`
      case tagged('optional')(x): return `${x._def.innerType}.optional()`
      case tagged('literal')(x): return `z.literal(${JSON.stringify(x._def.value)})`
      case tagged('array')(x): return `z.array(${x.element})${applyArrayConstraints(x)}`
      case tagged('record')(x): return `z.record(${x.element})`
      case tagged('allOf')(x): return `z.intersection(${x._def.left}, ${x._def.right})`
      case tagged('anyOf')(x): return `z.union([${x._def.options.join(', ')}])`
      case tagged('lazy')(x): return `z.lazy(() => ${x._def.getter()})`
      case tagged('pipeline')(x): return `z.pipeline(${x._def.in}, ${x._def.out})`
      case tagged('catch')(x): return `z.catch(${x._def.catchValue})`
      case tagged('default')(x): return `z.default(${x._def.defaultValue})`
      case tagged('effects')(x): return `z.effects(${x._def.schema}, ${x._def.effect})`
      case tagged('function')(x): return `z.function(t.tuple([${x._def.args.join(', ')}]), ${x._def.returns})`
      case tagged('enum')(x): return `z.enum([${
        x._def.values.map((_) => JSON.stringify(_)).join(', ')
      }])`
      case tagged('nativeEnum')(x): return `z.nativeEnum({ ${
        Object.entries(x._def.values)
          .map(([k, v]) => object.parseKey(k) + ': ' + JSON.stringify(v))
          .join(', ')
      } })`
      case tagged('tuple')(x): return `z.tuple([${x._def.items.join(', ')}])${
        typeof x._def.rest === 'string' ? `.rest(${x._def.rest})` : ''}`
      case tagged('oneOf')(x): return `z.discriminatedUnion("${String(x._def.discriminator)}", [${x._def.options.map(compileObjectNode).join(', ')}])`
      case tagged('object')(x): return compileObjectNode(x)
    }
  }


  export const fromValueObject: Functor.Algebra<Json.lambda, z.ZodTypeAny> = (x) => {
    switch (true) {
      default: return fn.exhaustive(x)
      case x === null: return z.null()
      case x === undefined: return z.undefined()
      case typeof x === 'boolean': return z.boolean()
      case typeof x === 'symbol': return z.symbol()
      case typeof x === 'number': return z.number()
      case typeof x === 'string': return z.string()
      case Array_isArray(x): 
        return x.length === 0 ? z.tuple([]) : z.tuple([x[0], ...x.slice(1)])
      case !!x && typeof x === 'object': return z.object(x)
    }
  }

  export const serialize
    : Functor.IxAlgebra<number, Json.lambda, string> 
    = (indent, x) => {
      switch (true) {
        default: return fn.exhaustive(x)
        case x === null:
        case x === undefined:
        case typeof x === 'boolean':
        case typeof x === 'number': return `z.literal(${String(x)})`
        case typeof x === 'string': return `z.literal("${x}")`
        case Array_isArray(x): {
          return x.length === 0 ? `z.tuple([])`
          : Print.array({ indent })(`z.tuple([`, x.join(', '), `])`)
        }
        case !!x && typeof x === 'object': {
           const xs = Object.entries(x)
           return xs.length === 0 ? `z.object({})`
           : Print.array({ indent })(
            `z.object({`,
            ...fn.pipe(
              xs.map(([k, v]) => object.parseKey(k) +': ' + v),
              // (xs) => xs.map((_) => `${' '.repeat(depth)}${_}`),
            ),
            `})`,
          )
        }
      }
    }
}

/** 
 * ## {@link toString `zod.toString`}
 * 
 * Converts an arbitrary zod schema back into string form. Used internally 
 * for testing/debugging.
 * 
 * Very useful when you're applying transformations to a zod schema. 
 * Can be used (for example) to reify a schema, or perform codegen, 
 * and has more general applications in dev environments.
 * 
 * @example
 * import { zod } from "@traversable/algebra"
 * import * as vi from "vitest"
 * 
 * vi.expect(zod.toString( z.union([z.object({ tag: z.literal("Left") }), z.object({ tag: z.literal("Right") })])))
 * .toMatchInlineSnapshot(`z.union([z.object({ tag: z.literal("Left") }), z.object({ tag: z.literal("Right") })]))`)
 * 
 * vi.expect(zod.toString( z.tuple([z.number().min(0).lt(2), z.number().multipleOf(2), z.number().max(2).nullable()])))
 * .toMatchInlineSnapshot(`z.tuple([z.number().min(0).lt(2), z.number().multipleOf(2), z.number().max(2).nullable()])`)
 */
const toString = fn.cata(Functor_)(Algebra.toString)

/** 
 * ## {@link fromValueObject `zod.fromValueObject`}
 * 
 * Derive a zod schema from an arbitrary
 * [value object](https://en.wikipedia.org/wiki/Value_object). 
 * 
 * Used internally to support the
 * [`const` keyword](https://json-schema.org/draft/2020-12/draft-bhutton-json-schema-validation-00#rfc.section.6.1.3),
 * added in [2020-12](https://json-schema.org/draft/2020-12/schema).
 */
const fromValueObject = fn.cata(Json.Functor)(Algebra.fromValueObject)

const fromUnknownValue
  : (value: unknown) => Option<z.ZodTypeAny>
  = fn.flow(
    Option.guard(Json.is),
    Option.map(fromValueObject),
  )

const unsafeFromUnknownValue 
  : (value: unknown) => z.ZodTypeAny
  = fn.flow(
    fromUnknownValue,
    Option.getOrThrow,
  )

const serialize = fn.cataIx(FormatFunctor)(Algebra.serialize)

type Any<T extends z.ZodTypeAny = z.ZodTypeAny> =
  | z.ZodAny
  | z.ZodUnion<readonly [T, ...T[]]>
  | z.ZodDiscriminatedUnion<string, z.ZodObject<{ [x: string]: T }>[]>
  | z.ZodArray<T>
  | z.ZodBigInt
  | z.ZodBoolean
  | z.ZodBranded<T, keyof never>
  | z.ZodCatch<T>
  | z.ZodDate
  | z.ZodDefault<T>
  | z.ZodEffects<T>
  | z.ZodEnum<[string, ...string[]]>
  | z.ZodFunction<z.ZodTuple<[] | [T, ...T[]]>, T>
  | z.ZodIntersection<T, T>
  | z.ZodLazy<T>
  | z.ZodLiteral<z.Primitive>
  | z.ZodMap<T, T>
  | z.ZodNaN
  | z.ZodNativeEnum<z.EnumLike>
  | z.ZodNever
  | z.ZodNull
  | z.ZodNullable<T>
  | z.ZodNumber
  | z.ZodObject<{ [x: string]: T }>
  | z.ZodArray<T>
  | z.ZodPipeline<T, T>
  | z.ZodPromise<T>
  | z.ZodReadonly<T>
  | z.ZodRecord<z.ZodString, T>
  | z.ZodSet<T>
  | z.ZodString
  | z.ZodSymbol
  | z.ZodTuple<[T, ...T[]], T | null>
  | z.ZodUndefined
  | z.ZodUnknown
  | z.ZodVoid
  ;

/*
  toString.handlers = {
    null: () => 'z.null()',
    boolean: () => 'z.boolean()',
    number: () => 'z.number()',
    string: () => 'z.string()',
    optional: (x) => '<??>z.optional(' + pre(x.def) + ')',
    array: (x) => 'z.array(' + pre(x.def) + ')',
    record: (x) => 'z.record(' + pre(x.def) + ')',
    tuple: (x) => 'z.tuple([' + x.def.map(pre).join(', ') + '])',
    union: (x) => 'z.union([' + x.def.map(pre).join(', ') + '])',
    intersection: (x) => 'z.intersection(' + pre(x.def[0]) + ', ' + pre(x.def[1]) + ')',
    literal: (x) =>
      'z.literal(' + typeof x.meta.literal === 'string'
      ? JSON.stringify(x.meta.literal)
      : String(x.meta.literal) + ')',
    object: (x) =>
      'z.object({'
        + Object.entries(x.def).map(([k, v]) => ''
          + (PATTERN.identifier.test(k) ? k : JSON.stringify(k))
          + (v.startsWith('<??>') ? '?:' : ':')
          + (pre(v))
        ).join(', ')
      + '})'
  } satisfies toString.Handlers
*/
// export function map<S, T>(f: (src: S) => T): (x: Z.Z<S>) => Z.Z<T> {
//   return (x: Z.Z<S>) => {
//     switch (true) {
//       default: return fn.exhaustive(x)
//       case hasZodTag('never')(x): return x
//       case hasZodTag('any')(x): return x
//       case hasZodTag('unknown')(x): return x
//       case hasZodTag('void')(x): return x
//       case hasZodTag('undefined')(x): return x
//       case hasZodTag('null')(x): return x
//       case hasZodTag('symbol')(x): return x
//       case hasZodTag('NaN')(x): return x
//       case hasZodTag('boolean')(x): return x
//       case hasZodTag('bigint')(x): return x
//       case hasZodTag('date')(x): return x
//       case hasZodTag('number')(x): return x
//       case hasZodTag('string')(x): return x
//       case hasZodTag('enum')(x): return x
//       case hasZodTag('nativeEnum')(x): return x
//       case hasZodTag('literal')(x): return x
//       case hasZodTag('branded')(x): return { ...x, _def: { ...x._def, type: f(x._def.type) }} satisfies Z.Branded<T>
//       case hasZodTag('set')(x): return { ...x, _def: { ...x._def, valueType: f(x._def.valueType) } } satisfies Z.Set<T>
//       case hasZodTag('promise')(x): return { ...x, _def: { ...x._def, type: f(x._def.type) } } satisfies Z.Promise<T>
//       case hasZodTag('map')(x): return { ...x, _def: { ...x._def, keyType: f(x._def.keyType), valueType: f(x._def.valueType) } } satisfies Z.Map<T>
//       case hasZodTag('readonly')(x): return { ...x, _def: { ...x._def, innerType: f(x._def.innerType) } } satisfies Z.Readonly<T>
//       case hasZodTag('nullable')(x): return { ...x, _def: { ...x._def, innerType: f(x._def.innerType) } } satisfies Z.Nullable<T>
//       case hasZodTag('optional')(x): return { ...x, _def: { ...x._def, innerType: f(x._def.innerType) } } satisfies Z.Optional<T>
//       case hasZodTag('array')(x): return { ...x, _def: { ...x._def, element: f(x._def.element) } } satisfies Z.Array<T>
//       case hasZodTag('record')(x): return { ...x, _def: { ...x._def, element: f(x._def.element) } } satisfies Z.Record<T>
//       case hasZodTag('allOf')(x): return { ...x, _def: { ...x._def, left: f(x._def.left), right: f(x._def.right) } } satisfies Z.AllOf<T>
//       case hasZodTag('object')(x): return { ...x, _def: { ...x._def, shape: fmap(x._def.shape, f) } } satisfies Z.Object<T>
//       case hasZodTag('anyOf')(x): return { ...x, _def: { ...x._def, options: fmap(x._def.options, f) } } satisfies Z.AnyOf<T>
//       case hasZodTag('tuple')(x): return { ...x, _def: { ...x._def, items: fmap(x._def.items, f)} } satisfies Z.Tuple<T>
//       case hasZodTag('oneOf')(x): return { ...x, _def: { ...x._def, options: fmap(x._def.options, (opt) => fmap(opt, f)) } } satisfies Z.OneOf<T>
//       case hasZodTag('lazy')(x): return { ...x, _def: { ...x._def, getter() { return f(x._def.getter()) } } } satisfies Z.Lazy<T>
//       case hasZodTag('function')(x): return { ...x, _def: { ...x._def, args: fmap(x._def.args, f), returns: f(x._def.returns) } } satisfies Z.Function<T>
//       case hasZodTag('pipeline')(x): return { ...x, _def: { ...x._def, in: f(x._def.in), out: f(x._def.out) } } satisfies Z.Pipeline<T>
//       case hasZodTag('catch')(x): return { ...x, _def: { ...x._def, catchValue: f(x._def.catchValue) } } satisfies Z.Catch<T>
//       case hasZodTag('default')(x): return { ...x, _def: { ...x._def, defaultValue: f(x._def.defaultValue) } } satisfies Z.Default<T>
//       case hasZodTag('effects')(x): return { ...x, _def: { ...x._def, schema: f(x._def.schema), effect: f(x._def.effect) } } satisfies Z.Effect<T>
//     }
//   }
// }
// const hasTag
//   : <K extends keyof TagMap>(tag: K)
//     => <S>(u: unknown)
//     => u is Extract<Z.F<S>, { _def: { typeName: TagMap[K] } }>
//   = (tag) => <never>has('_def', 'typeName', core.is.literally(tag))
// export { Functor_ as Functor }
// const Functor_: Functor<Z.lambda> = {
//   map(f) {
//     return (x) => {
//       switch(true) {
//         default: return fn.exhaustive(x)
//         case hasTag('never')(x): return x
//         case hasTag('any')(x): return x
//         case hasTag('undefined')(x): return x
//         case hasTag('unknown')(x): return x
//         case hasTag('void')(x): return x
//         case hasTag('allOf')(x): return x
//         case hasTag('anyOf')(x): return x
//         case hasTag('oneOf')(x): return x
//         case hasTag('bigint')(x): return x
//         case hasTag('boolean')(x): return x
//         case hasTag('branded')(x): return x
//         case hasTag('catch')(x): return x
//         case hasTag('date')(x): return x
//         case hasTag('default')(x): return x
//         case hasTag('effects')(x): return x
//         case hasTag('enum')(x): return x
//         case hasTag('function')(x): return x
//         case hasTag('lazy')(x): return x
//         case hasTag('literal')(x): return x
//         case hasTag('map')(x): return x
//         case hasTag('NaN')(x): return x
//         case hasTag('nativeEnum')(x): return x
//         case hasTag('null')(x): return x
//         case hasTag('nullable')(x): return x
//         case hasTag('number')(x): return x
//         case hasTag('object')(x): return x
//         case hasTag('pipeline')(x): return x
//         case hasTag('promise')(x): return x
//         case hasTag('readonly')(x): return x
//         case hasTag('record')(x): return x
//         case hasTag('set')(x): return x
//         case hasTag('string')(x): return x
//         case hasTag('symbol')(x): return x
//         case hasTag('tuple')(x): return x
//         case hasTag('array')(x): return fmap(x['-1'], f)
//         case hasTag('optional')(x): return fmap(x['-1'], f)
//     }
//   }
// }
// }
// declare namespace Z {
//   export {
//     Z_allOf as allOf, Z_any as any, Z_anyOf as anyOf, Z_array as array, Z_bigint as bigint,
//     Z_boolean as boolean, Z_branded as branded, Z_catch as catch, Z_date as date,
//     Z_default as default, Z_effects as effects, Z_enum as enum, Z_function as function,
//     Z_lazy as lazy, Z_literal as literal, Z_map as map, Z_NaN as nan,
//     Z_nativeEnum as nativeEnum, Z_never as never, Z_null as null, Z_nullable as nullable,
//     Z_number as number, Z_object as object, Z_oneOf as oneOf, Z_optional as optional,
//     Z_pipeline as pipeline, Z_promise as promise, Z_readonly as readonly, Z_record as record,
//     Z_set as set, Z_string as string, Z_symbol as symbol, Z_tuple as tuple,
//     Z_undefined as undefined, Z_unknown as unknown, Z_void as void,
//     // re-export aliases
//     Z_allOf as intersection,
//     Z_anyOf as union,
//     Z_oneOf as discriminatedUnion,
//   }
// }
// declare namespace Z {
//   interface lambda extends HKT { [-1]: Z.F<this[0]> }
//   type order<S = _, U = _> = [
//     // nullary
//     Z_never,
//     Z_any,
//     Z_unknown,
//     Z_undefined,
//     Z_null,
//     Z_void,
//     Z_NaN,
//     Z_symbol,
//     Z_boolean,
//     Z_bigint,
//     Z_number,
//     Z_string,
//     Z_enum,
//     Z_date,
//     // "nullary"
//     Z_branded,
//     Z_literal,
//     Z_nativeEnum,
//     // unary
//     Z_optional<S>,
//     Z_nullable<S>,
//     Z_array<S>,
//     Z_set<S>,
//     Z_map<S>,
//     Z_promise<S>,
//     Z_readonly<S>,
//     Z_object<S>,
//     // composite
//     Z_record<S>,
//     Z_tuple<S>,
//     Z_function<S>,
//     Z_lazy<S>,
//     Z_anyOf<S>,
//     Z_allOf<S>,
//     Z_oneOf<S>,
//     // idiosync
//     Z_catch<S>,
//     Z_default<S>,
//     Z_effects<S>,
//     Z_pipeline<S>,
//   ]
//   type F<S> =
//     // nullary
//     | Z_never
//     | Z_any
//     | Z_unknown
//     | Z_undefined
//     | Z_null
//     | Z_void
//     | Z_NaN
//     | Z_symbol
//     | Z_boolean
//     | Z_bigint
//     | Z_number
//     | Z_string
//     | Z_enum
//     | Z_date
//     // "nullary"
//     | Z_branded
//     | Z_literal
//     | Z_nativeEnum
//     // unary
//     | Z_optional<S>
//     | Z_nullable<S>
//     | Z_array<S>
//     | Z_set<S>
//     | Z_map<S>
//     | Z_promise<S>
//     | Z_readonly<S>
//     | Z_object<S>
//     // composite
//     | Z_record<S>
//     | Z_tuple<S>
//     | Z_function<S>
//     | Z_lazy<S>
//     | Z_anyOf<S>
//     | Z_allOf<S>
//     | Z_oneOf<S>
//     // idiosync
//     | Z_catch<S>
//     | Z_default<S>
//     | Z_effects<S>
//     | Z_pipeline<S>
// }
// interface _def<T extends {}> extends newtype<T> {}
// type Named<typeName extends keyof TagMap, T = {}> = { _def: _def<T & { typeName: TagMap[typeName] }> }
// export function serialize(leftOffset?: number): (x: unknown) => string {
//   const loop = (indent: number) => (x: JsonLike): string => {
//     switch (true) {
//       default: return fn.exhaustive(x)
//       case x === null:
//       case x === undefined:
//       case typeof x === 'boolean':
//       case typeof x === 'number': return `z.literal(${String(x)})`
//       case typeof x === 'string': return `z.literal("${x}")`
//       case JsonLike.isArray(x): {
//         return x.length === 0
//           ? `z.tuple([])`
//           : Print.array({ indent })(
//             `z.tuple([`, 
//             ...x.map(loop(indent + 2)), 
//             '])'
//           )
//       }
//       case !!x && typeof x === 'object': {
//         const xs = Object.entries(x)
//         return xs.length === 0 
//           ? `z.object({})`
//           : Print.array({ indent })(
//             `z.object({`,
//             ...xs.map(([k, v]) => object.parseKey(k) + ': ' + loop(indent + 2)(v)),
//             `})`
//           )
//       }
//     }
//   }
//   return (x: unknown) => !JsonLike.is(x) 
//     ? Invariant.InputIsNotSerializable('algebra/zod.serialize', x)
//     : loop(ix.indent)(x)
// }
