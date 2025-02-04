import { Traversable, fc } from "@traversable/core"
import { fn, object } from "@traversable/data"
import type { Functor, Intersect, Partial, _ } from "@traversable/registry"

export { generateArbitrary as generate, deriveArbitrary as derive }

/**
 * ## {@link Options `Options`}
 * Configuration options for {@link deriveArbitrary `deriveArbitrary`}
 */
type Options = Partial<typeof defaults>

/**
 * ## {@link defaults `defaults`}
 * Default configuration options for {@link deriveArbitrary `deriveArbitrary`}.
 */
const defaults = {
  /**
   * ## {@link defaults.arbitraryName `Options.arbitraryName`}
   * If provided, the generated arbitrary will be bound to
   * {@link defaults.arbitraryName `Options.arbitraryName`}.
   */
  arbitraryName: "Arbitrary",
  /**
   * ## {@link defaults.stripTypes `Options.stripTypes`}
   * If `true`, TypeScript types will not be generated in the output.
   * This can be useful for testing.
   */
  stripTypes: false as boolean,
}

/** @internal */
const Object_entries = globalThis.Object.entries
/** @internal */
const Object_assign = globalThis.Object.assign
/** @internal */
const Object_keys 
  : <T>(x: T) => (keyof T)[]
  = globalThis.Object.keys
/** @internal */
function intersect<T>(xs: readonly T[]): Intersect<T> 
function intersect<T>(xs: readonly T[]) { return xs.reduce(Object_assign, {}) }


export namespace Algebra {
  interface Generators<T> {
    null(loop: (tie: keyof this) => fc.Arbitrary<T>): fc.Arbitrary<null>
    boolean(loop: (tie: keyof this) => fc.Arbitrary<T>): fc.Arbitrary<boolean>
    integer(loop: (tie: keyof this) => fc.Arbitrary<T>): fc.Arbitrary<number>
    number(loop: (tie: keyof this) => fc.Arbitrary<T>): fc.Arbitrary<number>
    string(loop: (tie: keyof this) => fc.Arbitrary<T>): fc.Arbitrary<string>
    enum(loop: (tie: keyof this) => fc.Arbitrary<T>): fc.Arbitrary<T>
    const(loop: (tie: keyof this) => fc.Arbitrary<T>): fc.Arbitrary<T>
    anyOf(loop: (tie: keyof this) => fc.Arbitrary<T>): fc.Arbitrary<T>
    allOf(loop: (tie: keyof this) => fc.Arbitrary<T>): fc.Arbitrary<T[]>
    oneOf(loop: (tie: keyof this) => fc.Arbitrary<T>): fc.Arbitrary<T[]>
    array(loop: (tie: keyof this) => fc.Arbitrary<T>): fc.Arbitrary<T[]>
    record(loop: (tie: keyof this) => fc.Arbitrary<T>): fc.Arbitrary<Record<string, T>>
    tuple(loop: (tie: keyof this) => fc.Arbitrary<T>): fc.Arbitrary<T[]>
    object(loop: (tie: keyof this) => fc.Arbitrary<T>): fc.Arbitrary<{ [x: string]: T }>
    any(loop: (tie: keyof this) => fc.Arbitrary<T>): fc.Arbitrary<T>
  }

  const generators = {
    null() { return fc.constant(null) },
    boolean() { return fc.boolean() },
    integer() { return fc.integer() },
    number() { return fc.oneof(fc.float(), fc.integer()) },
    string() { return fc.oneof(fc.lorem(), fc.string({ unit: 'grapheme' })) },
    enum(loop) { return fc.array(loop('any')) },
    const(loop) { return fc.constant(loop('any')) },
    allOf(loop) { return fc.array(loop('any')) },
    anyOf(loop) { return fc.array(loop('any')) },
    oneOf(loop) { return fc.array(loop('any')) },
    tuple(loop) { return fc.array(loop('any')) },
    array(loop) { return fc.array(loop('any')) },
    record(loop) { return fc.dictionary(loop('any')) },
    object(loop) { return fc.dictionary(loop('any'))  },
    any(loop) { return fc.oneof(...Object_keys(_gen).map((k) => loop(k))) },
  } as const satisfies Generators<_>
  const _gen: Generators<_> = generators

  function letrec<T>(tie: fc.LetrecTypedTie<Generators<T>>): 
    { [K in keyof Generators<T>]: ReturnType<Generators<T>[K]> } 
  function letrec<T>(tie: fc.LetrecTypedTie<Generators<T>>) { 
    return {
      null: generators.null(),
      boolean: generators.boolean(),
      integer: generators.integer(),
      number: generators.number(),
      string: generators.string(),
      enum: generators.enum(tie),
      const: generators.const(tie),
      any: generators.any(tie),
      allOf: generators.allOf(tie),
      anyOf: generators.anyOf(tie),
      array: generators.array(tie),
      object: generators.object(tie),
      oneOf: generators.oneOf(tie),
      record: generators.record(tie),
      tuple: generators.tuple(tie),
    } satisfies { 
      [K in keyof Generators<_>]: ReturnType<Generators<_>[K]> 
    }
  }

  const $ = fc.letrec(letrec)

  export const arbitrary
    : Functor.Algebra<Traversable.lambda, fc.Arbitrary<{} | null | undefined>> 
    = (x) => {
      switch (true) {
        default: return $.any
        case Traversable.is.const(x): return fc.constant(x.const)
        case Traversable.is.enum(x): return fc.constantFrom(...x.enum)
        case Traversable.is.null(x): return $.null
        case Traversable.is.boolean(x): return $.boolean
        case Traversable.is.integer(x): return $.integer
        case Traversable.is.number(x): return $.number
        case Traversable.is.string(x): return $.string
        case Traversable.is.anyOf(x): return fc.oneof(...x.anyOf)
        case Traversable.is.oneOf(x): return fc.oneof(...x.oneOf)
        case Traversable.is.allOf(x): return fc.tuple(...x.allOf).map(intersect)
        case Traversable.is.array(x): return fc.array(x.items)
        case Traversable.is.record(x): return fc.dictionary(x.additionalProperties)
        case Traversable.is.tuple(x): return fc.tuple(...x.items)
        case Traversable.is.object(x): 
          return fc.record({ ...x.properties }, { requiredKeys: [...(x.required || [])] })
      }
    }

  /**
   * ## {@link codegen `Algebra.codegen`}
   */
  export const jit
  : (options?: Options) => Functor.Algebra<Traversable.lambda, string> 
  = ({ stripTypes: noTypes = defaults.stripTypes } = defaults) => (x) => {
    switch (true) {
      // TODO: turn back on
      default: return fn.softExhaustiveCheck(x)
      case Traversable.is.enum(x): return "fc.constantFrom(" + x + ")"
      case Traversable.is.const(x): return "fc.constant(" + x.const + ")"
      case Traversable.is.any(x): return "fc.anything()"
      case Traversable.is.null(x): return "fc.constant(null)"
      case Traversable.is.boolean(x): return "fc.boolean()"
      case Traversable.is.integer(x): return "fc.integer()"
      case Traversable.is.number(x): return "fc.float()"
      case Traversable.is.string(x): return "fc.lorem()"
      case Traversable.is.tuple(x): return "fc.tuple(" + x.items.join(", ") + ")"
      case Traversable.is.anyOf(x): return "fc.oneof(" + x.anyOf.join(", ") + ")"
      case Traversable.is.oneOf(x): return "fc.oneof(" + x.oneOf.join(", ") + ")"
      case Traversable.is.allOf(x): return "fc.tuple(" + x.allOf.join(", ") + ")" 
        + ".map((xs) => xs.reduce((ys" + noTypes ? "" : ": {}" + ", y) => y ? Object.assign(ys, y) : ys, {}))"
      case Traversable.is.array(x): return "fc.array(" + x.items + ")"
      case Traversable.is.record(x): return "fc.dictionary(fc.lorem(), " + x.additionalProperties + ")"
      case Traversable.is.object(x): return "fc.record(" 
        + "{ " + Object_entries(x.properties).map(object.parseEntry).join(", ") + " }, " 
        + "{ requiredKeys: [" + (x.required ?? []).map((k) => '"' + k + '"').join(", ") + "]" + " }" 
        + ")"
    }
  }
}

declare namespace generateArbitrary {
  export { Options }
}

function generateArbitrary_fold({
  arbitraryName = defaults.arbitraryName,
  stripTypes = defaults.stripTypes,
}: Options = defaults) {
  return fn.flow(
    Traversable.fromJsonSchema, 
    fn.cata(Traversable.Functor)(Algebra.jit({ arbitraryName, stripTypes })),
  )
}

function generateArbitrary(options: Options = defaults): (term: Traversable.orJsonSchema) => string {
  return fn.flow(
    generateArbitrary_fold(options),
    (body) => "const " + options.arbitraryName + " = " + body,
  )
}

generateArbitrary.defaults = defaults
generateArbitrary.fold = generateArbitrary_fold

deriveArbitrary.defaults = object.pick(defaults, "compare")
deriveArbitrary.fold = deriveArbitrary_fold

function deriveArbitrary(_?: Options): <T extends Traversable.orJsonSchema>(schema: T) => fc.Arbitrary<Traversable.toType<T>>
function deriveArbitrary(_: Options = deriveArbitrary.defaults): {} 
  { return fn.flow(deriveArbitrary_fold) }

function deriveArbitrary_fold(_?: Options): <const T extends Traversable.orJsonSchema>(term: T) => fc.Arbitrary<Traversable.toType<T>>
function deriveArbitrary_fold(_: Options = defaults): {}
  { return fn.flow(Traversable.fromJsonSchema, fn.cata(Traversable.Functor)(Algebra.arbitrary)) }
