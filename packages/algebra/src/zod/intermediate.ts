import type { 
  _,
  Functor as Functor_, 
  HKT, 
  Kind, 
  newtype, 
  Primitive, 
} from "@traversable/registry"
import { PATTERN, symbol } from "@traversable/registry"

import { fc } from "@traversable/core"
import { map, fn, object } from "@traversable/data"

import { z } from "zod"

export {
  /// namespaces
  IR,
  Algebra,
  // Arbitrary,
  /// algebra
  // toString,
  // arbitrary,
  // toSchema,
  /// predicates
  // is,
  /// folds
  // fold,
  // unfold,
  /// type constructors
  // Functor
  /// data constructors
  // make,
}

/** @internal */
const pre = (x: string) => x.startsWith("<??>") ? x.slice("<??>".length) : x

/**
 * TODO: move this to `@traversable/core/arbitrary`
 */
interface fc_optional<T> extends fc.Arbitrary<T | undefined> { readonly [symbol.optional]: true }
function optional<T>(arbitrary: fc.Arbitrary<T>, constraints?: fc.OneOfConstraints): fc_optional<T>
function optional<T>(arbitrary: fc.Arbitrary<T>, constraints: fc.OneOfConstraints = {}): fc.Arbitrary<T | undefined> {
  const model = fc.oneof(constraints, arbitrary, fc.constant(undefined));
  (model as typeof model & { [symbol.optional]: boolean })[symbol.optional] = true;
  return model
}

type IR_Null<M extends Meta.Base = never> = { tag: z.ZodFirstPartyTypeKind.ZodNull, meta: meta<M> }
type IR_Boolean<M extends Meta.Base = never> = { tag: z.ZodFirstPartyTypeKind.ZodBoolean, meta: meta<M> }
type IR_Number<M extends Meta.Base = never> = { tag: z.ZodFirstPartyTypeKind.ZodNumber, meta: meta<M> }
type IR_String<M extends Meta.Base = never> = { tag: z.ZodFirstPartyTypeKind.ZodString, meta: meta<M> }
type IR_Literal<V extends Primitive = Primitive> = { tag: z.ZodFirstPartyTypeKind.ZodLiteral, meta: Meta<{ literal: V }> }
type IR_Optional<Recursive, M extends Meta.Base = never> = { tag: z.ZodFirstPartyTypeKind.ZodOptional, meta: meta<M>, def: Recursive }
type IR_Array<Recursive, M extends Meta.Base = never> = { tag: z.ZodFirstPartyTypeKind.ZodArray, meta: meta<M>, def: Recursive }
type IR_Record<Recursive, M extends Meta.Base = never> = { tag: z.ZodFirstPartyTypeKind.ZodRecord, meta: meta<M>, def: Recursive }
type IR_Tuple<Recursive, M extends Meta.Base = never> = { 
  tag: z.ZodFirstPartyTypeKind.ZodTuple, 
  meta: meta<Meta.Base>, 
  def: readonly [Recursive, ...Recursive[]] 
}

type IR_Object<Recursive, Meta extends Meta.Base = never> = { 
  tag: z.ZodFirstPartyTypeKind.ZodObject, 
  meta: meta<Meta>, 
  def: { [x: string]: Recursive }
}

type IR_Union<Recursive, M extends Meta.Base = never> = { 
  tag: z.ZodFirstPartyTypeKind.ZodUnion, 
  meta: meta<M>, 
  def: readonly [Recursive, ...Recursive[]] 
}

type IR_Intersection<Recursive, M extends Meta.Base = never> = { 
  tag: z.ZodFirstPartyTypeKind.ZodIntersection
  meta: meta<M>
  def: readonly [left: Recursive, right: Recursive]
}

type meta<M extends Meta.Base = never> = never | ([M] extends [never] ? Meta.Base : Meta<M>)
interface Meta<M extends Meta.Base = Meta.Base> extends newtype<M> {}
declare namespace Meta {
  interface Base { literal?: Primitive, optional?: boolean, object?: string[] }
}

type IR_Nullary<M extends Meta.Base = never> =
  | IR_Null<meta<M>>
  | IR_Boolean<meta<M>>
  | IR_Number<meta<M>>
  | IR_String<meta<M>>
  ;
type IR_Special<M extends Meta.Base = Meta.Base> =
  | IR_Literal<M["literal"]>
  ;
type IR_Unary<Recursive = unknown, M extends Meta.Base = never> = 
  | IR_Optional<Recursive, M>
  | IR_Array<Recursive, M>
  | IR_Record<Recursive, M>
  | IR_Tuple<Recursive, M>
  | IR_Object<Recursive, M>
  | IR_Intersection<Recursive, M>
  | IR_Union<Recursive, M>
  ;
type F<Recursive, M extends Meta.Base = never> =
  | IR_Null<M>
  | IR_Boolean<M>
  | IR_Number<M>
  | IR_String<M>
  | IR_Literal<M["literal"]>
  | IR_Optional<Recursive, M>
  | IR_Array<Recursive, M>
  | IR_Record<Recursive, M>
  | IR_Tuple<Recursive, M>
  | IR_Object<Recursive, M>
  | IR_Intersection<Recursive, M>
  | IR_Union<Recursive, M>
  ;
type IR_any = 
  | IR_Nullary 
  | IR_Special 
  | IR_Unary

type Extract<Tag> = globalThis.Extract<F<unknown, Meta.Base>, { tag: Tag }>
type FromTag<T extends string> = T extends `Zod${infer S}` ? Uncapitalize<S> : T
type ToTag<S extends string> = S extends `Zod${string}` ? S : `Zod${Capitalize<S>}`
namespace Extract {
  export type Tag<T, _ extends T[0 & keyof T] = T[0 & keyof T]> = globalThis.Extract<_, F<unknown, Meta.Base>["tag"]>
  export type Meta<T, _ extends T[1 & keyof 1] = T[1 & keyof 1]> = globalThis.Extract<_, Meta.Base>
  export type Target<Tag> = Extract<Tag>["tag"]
}
type AnyTag = keyof typeof Apply | ToTag<keyof typeof Apply>

  ///    hkt    ///
  type Bind<
    Tag extends AnyTag, 
    Target, 
    Meta extends Meta.Base = Meta.Base,
  > = Kind<lambda<Meta, Tag>, Target> 
  // type Apply<
  //   Tag extends AnyTag, 
  //   Target, 
  //   Meta extends Meta.Base = Meta.Base, 
  //   _F extends typeof Apply[IR.FromTag<Tag>] = typeof Apply[IR.FromTag<Tag>]
  // > = Kind<IR.lambda<Meta, IR.ToTag<Tag>>, Kind<_F, Target>>

  type Apply<Tag extends AnyTag, Target, _F extends typeof Apply[FromTag<Tag>] = typeof Apply[FromTag<Tag>]> = Kind<_F, Target>
  type Call<Tag extends AnyTag, _F extends typeof Apply[FromTag<Tag>] = typeof Apply[FromTag<Tag>]> = Kind<_F, _F[0]>

  declare const Apply: {
    null: Const$<null>
    boolean: Const$<boolean>
    number: Const$<number>
    string: Const$<string>
    literal: Identity$
    optional: Union$<undefined>
    array: Array$
    record: Record$
    tuple: NonEmptyArray$
    object: Record$
    union: Identity$
    intersection: Identity$
  }

  interface Union$<T = unknown> extends HKT { [-1]: T | this[0] }
  interface Intersection$ extends HKT<readonly [_, _]> { [-1]: this[0][0] & this[0][1] }
  interface Array$<T = unknown> extends HKT<T> { [-1]: readonly this[0][] }
  interface Record$<T = unknown> extends HKT<T> { [-1]: globalThis.Record<string, this[0]> }
  interface NonEmptyArray$<T = unknown> extends HKT<T> { [-1]: readonly [this[0], ...this[0][]] }
  interface Identity$<T = unknown> extends HKT<T> { [-1]: this[0] }
  interface Const$<T = unknown> extends HKT<T> { [-1]: T }
  interface Pair$<T = unknown> extends HKT<T> { [-1]: [this[0], this[0]] }

  interface lambda<M extends Meta.Base = never, _Tag = never> extends HKT { 
    [-1]: [_Tag] extends [never] ? F<this[0], M>: globalThis.Extract<F<this[0], M>, { tag: _Tag }> 
  }

const defaultMeta = {} satisfies Meta.Base

const make = {
  null: <M extends Meta.Base>(m?: M): IR_Null<M> => 
    ({ tag: z.ZodFirstPartyTypeKind.ZodNull, meta: m ?? defaultMeta as never } as const),
  boolean: <M extends Meta.Base>(m?: M): IR_Boolean<M> => 
    ({ tag: z.ZodFirstPartyTypeKind.ZodBoolean, meta: m ?? defaultMeta as never } as const),
  number: <M extends Meta.Base>(m?: M): IR_Number<M> => 
    ({ tag: z.ZodFirstPartyTypeKind.ZodNumber, meta: m ?? defaultMeta as never } as const),
  string: <M extends Meta.Base>(m?: M): IR_String<M> => 
    ({ tag: z.ZodFirstPartyTypeKind.ZodString, meta: m ?? defaultMeta as never } as const),
  literal: <V extends Primitive>(m: { literal: V }): IR_Literal<V> => 
    ({ tag: z.ZodFirstPartyTypeKind.ZodLiteral, meta: { literal: m.literal } } as const), 
  optional: <R, M extends Meta.Base>(x: R, m?: M): IR_Optional<R, M> => 
    ({ tag: z.ZodFirstPartyTypeKind.ZodOptional, meta: m ?? defaultMeta as never, def: x } as const),
  array: <R, M extends Meta.Base>(x: R, m?: M): IR_Array<R, M> => 
    ({ tag: z.ZodFirstPartyTypeKind.ZodArray, meta: m ?? defaultMeta as never, def: x } as const),
  record: <R, M extends Meta.Base>(x: R, m?: M): IR_Record<R, M> => 
    ({ tag: z.ZodFirstPartyTypeKind.ZodRecord, meta: m ?? defaultMeta as never, def: x } as const),
  tuple: <R, M extends Meta.Base>(x: readonly [R, ...R[]], m?: M): IR_Tuple<R, M> => 
    ({ tag: z.ZodFirstPartyTypeKind.ZodTuple, meta: m ?? defaultMeta as never, def: x } as const),
  object: <R, M extends Meta.Base>(x: { [x: string]: R }, m?: M): IR_Object<R, M> => 
    ({ tag: z.ZodFirstPartyTypeKind.ZodObject, meta: m ?? defaultMeta as never, def: x } as const),
  intersection: <R, M extends Meta.Base>(x: readonly [R, R], m?: M): IR_Intersection<R, M> => 
    ({ tag: z.ZodFirstPartyTypeKind.ZodIntersection, meta: m ?? defaultMeta as never, def: x } as const),
  union: <R, M extends Meta.Base>(x: readonly [R, ...R[]], m?: M): IR_Union<R, M> => 
    ({ tag: z.ZodFirstPartyTypeKind.ZodUnion, meta: m ?? defaultMeta as never, def: x } as const),
} satisfies (
  & { [K in IR_Nullary["tag"] as FromTag<K>]: (meta?: Meta.Base) => Extract<K> }
  & { [K in IR_Special["tag"] as FromTag<K>]: (meta: { literal: Primitive }) => Extract<K> }
  & { [K in IR_Unary["tag"] as FromTag<K>]: (x: Extract<K>["def"], meta?: Extract<K>["meta"]) => Extract<K> }
)

const is = {
  null: (u: unknown): u is IR_Null => !!u && typeof u === "object" && "tag" in u && u.tag === z.ZodFirstPartyTypeKind.ZodNull,
  boolean: (u: unknown): u is IR_Boolean => !!u && typeof u === "object" && "tag" in u && u.tag === z.ZodFirstPartyTypeKind.ZodBoolean,
  number: (u: unknown): u is IR_Number => !!u && typeof u === "object" && "tag" in u && u.tag === z.ZodFirstPartyTypeKind.ZodNumber,
  string: (u: unknown): u is IR_String => !!u && typeof u === "object" && "tag" in u && u.tag === z.ZodFirstPartyTypeKind.ZodString,
  literal: <V extends Primitive>(u: unknown): u is IR_Literal<V> => !!u && typeof u === "object" && "tag" in u && u.tag === z.ZodFirstPartyTypeKind.ZodLiteral,
  optional: <R>(u: unknown): u is IR_Optional<R> => !!u && typeof u === "object" && "tag" in u && u.tag === z.ZodFirstPartyTypeKind.ZodOptional,
  array: <R>(u: unknown): u is IR_Array<R> => !!u && typeof u === "object" && "tag" in u && u.tag === z.ZodFirstPartyTypeKind.ZodArray,
  record: <R>(u: unknown): u is IR_Record<R> => !!u && typeof u === "object" && "tag" in u && u.tag === z.ZodFirstPartyTypeKind.ZodRecord,
  tuple: <R>(u: unknown): u is IR_Tuple<R> => !!u && typeof u === "object" && "tag" in u && u.tag === z.ZodFirstPartyTypeKind.ZodTuple,
  object: <R>(u: unknown): u is IR_Object<R> => !!u && typeof u === "object" && "tag" in u && u.tag === z.ZodFirstPartyTypeKind.ZodObject,
  intersection: <R>(u: unknown): u is IR_Intersection<R> => !!u && typeof u === "object" && "tag" in u && u.tag === z.ZodFirstPartyTypeKind.ZodIntersection,
  union: <R>(u: unknown): u is IR_Union<R> => !!u && typeof u === "object" && "tag" in u && u.tag === z.ZodFirstPartyTypeKind.ZodUnion,
} satisfies ({ [K in IR_any["tag"] as FromTag<K>]: (u: unknown) => u is Extract<K> })

export const Functor: Functor_<lambda, IR_any> = { 
  map(f) {
    return (F) => {
      switch (true) {
        default: return fn.exhaustive(F)
        case is.null(F):
        case is.boolean(F):
        case is.number(F):
        case is.string(F): return F
        case is.literal(F): return { tag: F.tag, meta: { ...F.meta, literal: F.meta.literal } }
        case is.optional(F): return { tag: F.tag, meta: { ...F.meta, optional: true }, def: f(F.def) }
        case is.array(F): return { tag: F.tag, meta: F.meta, def: f(F.def) }
        case is.record(F): return { tag: F.tag, meta: F.meta, def: f(F.def) }
        case is.tuple(F): return { tag: F.tag, meta: F.meta, def: map(F.def, f) }
        case is.union(F): return { tag: F.tag, meta: F.meta, def: map(F.def, f) }
        case is.intersection(F): return { tag: F.tag, meta: F.meta, def: [f(F.def[0]), f(F.def[1])] }
        case is.object(F): {
          const meta = Object.keys(F.def).filter((k) => is.optional(F.def[k]))
          return { tag: F.tag, meta: { ...F.meta, object: meta }, def: map(F.def, f) }
        }
      }
    }
  }
}

const fold = fn.cata(Functor)
const unfold = fn.ana(Functor)

namespace Algebra {
  export function toString(options?: toString.Options): Functor_.Algebra<lambda, string> 
  export function toString(options?: toString.Options): Functor_.Algebra<lambda, string> {
    const $ = { ...toString.handlers, ...options?.handlers }
    return (x) => {
      switch (true) {
        default: return fn.exhaustive(x)
        case is.null(x): return pre($.null())
        case is.boolean(x): return pre($.boolean())
        case is.number(x): return pre($.number())
        case is.string(x): return pre($.string())
        case is.literal(x): return pre($.literal(x))
        case is.optional(x): return pre($.optional(x))
        case is.array(x): return pre($.array(x))
        case is.record(x): return pre($.record(x))
        case is.tuple(x): return pre($.tuple(x))
        case is.union(x): return pre($.union(x))
        case is.object(x): return pre($.object(x))
        case is.intersection(x): return pre($.intersection(x))
      }
    }
  }

  toString.handlers = {
    null: () => "z.null()",
    boolean: () => "z.boolean()",
    number: () => "z.number()",
    string: () => "z.string()",
    optional: (x) => "<??>z.optional(" + pre(x.def) + ")",
    array: (x) => "z.array(" + pre(x.def) + ")",
    record: (x) => "z.record(" + pre(x.def) + ")",
    tuple: (x) => "z.tuple([" + x.def.map(pre).join(", ") + "])",
    union: (x) => "z.union([" + x.def.map(pre).join(", ") + "])",
    intersection: (x) => "z.intersection(" + pre(x.def[0]) + ", " + pre(x.def[1]) + ")",
    literal: (x) => 
      "z.literal(" + typeof x.meta.literal === "string" 
      ? JSON.stringify(x.meta.literal) 
      : String(x.meta.literal) + ")",
    object: (x) =>
      "z.object({" 
        + Object.entries(x.def).map(([k, v]) => ""
          + (PATTERN.identifier.test(k) ? k : JSON.stringify(k))
          + (v.startsWith("<??>") ? "?:" : ":")
          + (pre(v))
        ).join(", ")
      + "})"
  } satisfies toString.Handlers

  const requiredKeys = <T extends { [x: string]: unknown }>(x: T) => 
    Object.keys(x).filter((k) => {
      const v = x[k]
      return !!v && typeof v === "object" && !(symbol.optional in v)
    })

  export declare namespace toArbitrary {
    type Options = { handlers?: toArbitrary.Handlers }
    type Handlers = (
      & { [K in IR_Nullary["tag"] as FromTag<K>]: () => fc.Arbitrary<Call<K>> }
      & { [K in IR_Unary["tag"] as FromTag<K>]: <R>(x: Bind<K, fc.Arbitrary<R>>) => fc.Arbitrary<Apply<K, R>> }
      & { [K in IR_Special["tag"] as FromTag<K>]: <V extends Primitive>(x: IR_Literal<V>) => fc.Arbitrary<V> }
    )
  }

  export function toArbitrary(options?: toArbitrary.Options): Functor_.Algebra<lambda, fc.Arbitrary<unknown>>
  export function toArbitrary(options?: toArbitrary.Options): Functor_.Algebra<lambda, fc.Arbitrary<unknown>> {
    const $ = { ...toArbitrary.handlers, ...options?.handlers }
    return (x) => {
      switch (true) {
        default: return fn.exhaustive(x)
        case is.null(x): return $.null()
        case is.boolean(x): return $.boolean()
        case is.number(x): return $.number()
        case is.string(x): return $.string()
        case is.literal(x): return $.literal(x)
        case is.optional(x): return $.optional(x)
        case is.array(x): return $.array(x)
        case is.record(x): return $.record(x)
        case is.tuple(x): return $.tuple(x)
        case is.union(x): return $.union(x)
        case is.object(x): return $.object(x)
        case is.intersection(x): return $.intersection(x)
      }
    }
  }

  toArbitrary.handlers = {
    null: () => fc.constant(null),
    boolean: () => fc.boolean(),
    number: () => fc.oneof(fc.integer(), fc.float({ noNaN: true })),
    string: () => fc.string(),
    literal: (x) => fc.constant(x.meta.literal),
    optional: (x) => optional(x.def),
    array: (x) => fc.array(x.def),
    record: (x) => fc.dictionary(x.def),
    tuple: (x) => fc.tuple(...x.def),
    union: (x) => fc.oneof(...x.def),
    object: (x) => fc.record(x.def, { requiredKeys: requiredKeys(x.def) }),
    intersection: (x) => fc.tuple(x.def[0], x.def[1]).map(([l, r]) => Object.assign(Object.create(null), l, r)),
    // intersection: (x) => fc.tuple(x.def[0], x.def[1]).map(([l, r]) => Object.assign(Object.create(null), l, r)),
  } as const satisfies toArbitrary.Handlers

  export const toSchema: Functor_.Algebra<lambda, z.ZodTypeAny> = (x) => {
    switch (true) {
      default: return fn.exhaustive(x)
      case is.null(x): return z.null()
      case is.boolean(x): return z.boolean()
      case is.number(x): return z.number()
      case is.string(x): return z.string()
      case is.literal(x): return z.literal(x.meta.literal)
      case is.optional(x): return z.optional(x.def)
      case is.array(x): return z.array(x.def)
      case is.record(x): return z.record(x.def)
      case is.object(x): return z.object(x.def)
      case is.tuple(x): return z.tuple([...x.def])
      case is.union(x): return z.union([x.def[0], x.def[1], ...x.def.slice(2)])
      case is.intersection(x): return z.intersection(x.def[0], x.def[1])
    }
  }
}

/** 
 * ## {@link toString `zod.toString`}
 * 
 * Given an {@link IR `IntermediateRepresentation`}, {@link toString `zod.toString`} 
 * recursively folds the IR into its normalized string form.
 * 
 * Useful to cut some of the noise when debugging. Also since this intermediate 
 * representation intentionally avoids unnecessary allocations, can be used as a
 * more compact, computer-readable format of a schema.
 */
const toString 
  : <S extends IR_any>(intermediate: S, options?: toString.Options) => string
  = (intermediate, options) => fold(Algebra.toString(options))(intermediate)

const Arbitrary_meta = fc.record({
  // literal: fc.literal(),
  // object: fc.constant([]),
  // optional: fc.boolean(),
}, { requiredKeys: [] }) satisfies fc.Arbitrary<Meta.Base>

export declare namespace Arbitrary {
  interface Loop<Recursive> {
    optional: IR_Optional<Recursive>
    array: IR_Array<Recursive>
    record: IR_Record<Recursive>
    intersection: IR_Intersection<Recursive>
    union: IR_Union<Recursive>
    tuple: IR_Tuple<Recursive>
    object: IR_Object<Recursive>
    tree:
      | IR_Null
      | IR_Boolean
      | IR_Number
      | IR_String
      | IR_Literal
      | IR_Optional<Recursive>
      | IR_Array<Recursive>
      | IR_Record<Recursive>
      | IR_Intersection<Recursive>
      | IR_Union<Recursive>
      | IR_Tuple<Recursive>
      | IR_Object<Recursive>
  }

  type Options = { handlers?: Arbitrary.Handlers, exclude?: (keyof Arbitrary.Handlers)[] }
  type Handlers = (
    & { [K in IR_Nullary["tag"] as FromTag<K>]: fc.Arbitrary<Extract<K>> }
    & { [K in IR_Special["tag"] as FromTag<K>]: fc.Arbitrary<Extract<K>> }
    & { [K in IR_Unary["tag"] as FromTag<K>]: <R>(gen: () => fc.Arbitrary<R>) => fc.Arbitrary<Bind<K, R, Meta.Base>> }
  )
}

// const Arbitrary_scalar = fc.oneof(
//   Arbitrary.handlers.null,
//   Arbitrary.handlers.boolean, 
//   Arbitrary.handlers.number, 
//   Arbitrary.handlers.string,
// )

const Arbitrary_scalar = {
  null: Arbitrary_meta.map(make.null),
  boolean: Arbitrary_meta.map(make.boolean),
  number: Arbitrary_meta.map(make.number), 
  string: Arbitrary_meta.map(make.string),
} as const
const Arbitrary_handlers = {
  ...Arbitrary_scalar,
  literal: fc.tuple(Arbitrary_meta, fc.literal()).map(([m, literal]) => make.literal({ ...m, literal })),
  optional: (gen) => fc.tuple(Arbitrary_meta, gen()).map(([m, x]) => make.optional(x, m)),
  array: (gen) => fc.tuple(Arbitrary_meta, gen()).map(([m, x]) => make.array(x, m)),
  record: (gen) => fc.tuple(Arbitrary_meta, gen()).map(([m, x]) => make.record(x, m)), 
  object: (gen) => fc.tuple(Arbitrary_meta, fc.entries(gen())).map(([m, xs]) => make.object(Object.fromEntries(xs), m)),
  intersection: (gen) => fc.tuple(Arbitrary_meta, gen(), gen()) .map(([m, l, r]) => make.intersection([l, r], m)), 
  tuple: (gen) => 
    fc.tuple(Arbitrary_meta, gen(), fc.array(gen(), { minLength: 1, maxLength: 8 }))
      .map(([m, hd, tl]) => make.tuple([hd, ...tl] as const, m)),
  union: (gen) => 
    fc.tuple(Arbitrary_meta, gen(), gen(), fc.array(gen(), { minLength: 2, maxLength: 8 }))
      .map(([m, x1, x2, xs]) => make.union([x1, x2, ...xs] as const, m)),
} as const satisfies Arbitrary.Handlers

export function Arbitrary(options?: Arbitrary.Options): fc.LetrecValue<Arbitrary.Loop<IR_any>> {
    const $ = { ...Arbitrary_handlers, ...options?.handlers }
    return fc.letrec((loop: fc.LetrecTypedTie<Arbitrary.Loop<IR_any>>) => {
      const GO = () => loop("tree")
      const arbitraries = object.omit({
        ...Arbitrary_scalar,
        array: $.array(GO),
        object: $.object(GO),
        union: $.union(GO),
        optional: $.optional(GO),
        tuple: $.tuple(GO),
        intersection: $.intersection(GO),
      }, ...(options?.exclude ? options.exclude : []))

      return {
        ...arbitraries,
        optional: $.optional(GO),
        array: $.array(GO),
        record: $.record(GO),
        intersection: $.intersection(GO),
        union: $.union(GO),
        tuple: $.tuple(GO),
        object: $.object(GO),
        tree: fc.oneof(...Object.values(arbitraries))
      }
    })
  }

Arbitrary.any = Arbitrary().tree

Arbitrary.handlers = Arbitrary_handlers


declare namespace toString {
  type Options = { handlers?: Partial<toString.Handlers> }
  type Handlers = (
    & { [K in IR_Nullary["tag"] as FromTag<K>]: () => string }
    & { [K in IR_Special["tag"] as FromTag<K>]: (x: Bind<K, string>) => string }
    & { [K in IR_Unary["tag"] as FromTag<K>]: (x: Bind<K, string>) => string }
  )
}

/** 
 * ## {@link toArbitrary `IR.toArbitrary`}
 * 
 * Derive a fast-check arbitrary from a zod schemas intermediate representation.
 */
const toArbitrary 
  : <S extends IR_any>(intermediate: S, options?: Algebra.toArbitrary.Options) => fc.Arbitrary<unknown>
  = (intermediate, options) => fold(Algebra.toArbitrary(options))(intermediate)

const toSchema = fold(Algebra.toSchema)

declare namespace IR {
  export { 
    IR_any as any,
    IR_Null as null,
    IR_Boolean as boolean,
    IR_Number as number,
    IR_String as string,
    IR_Literal as literal,
    IR_Optional as optional,
    IR_Array as array,
    IR_Record as record,
    IR_Object as object,
    IR_Tuple as tuple,
    IR_Union as union,
    IR_Intersection as intersection,
  }
}

function IR() {}
IR.Algebra = Algebra
IR.toSchema = toSchema 
IR.toString = toString
IR.arbitrary = Arbitrary
IR.toArbitrary = toArbitrary
IR.fold = fold
IR.unfold = unfold
IR.is = is
IR.make = make

/* 
 [
      [Object: null prototype] {
        '0': 'r',
        '1': false,
        '2': false,
        '3': true,
        '4': false
      },
      [ true, null ]
    ]
*/
