import * as fc from "fast-check"

import { Traversable } from "@traversable/core"
import { fn, object } from "@traversable/data"
import type { Functor, Partial } from "@traversable/registry"

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

export namespace Algebra {
  export const arbitrary
    : Functor.Algebra<Traversable.lambda, fc.Arbitrary<{} | null | undefined>> 
    = (x) => {
      switch (true) {
        // TODO: turn back on
        default: return fn.softExhaustiveCheck(x)
        case Traversable.is.enum(x): return fc.constantFrom(...x.enum)
        case Traversable.is.const(x): return fc.constant(x.const)
        case Traversable.is.null(x): return fc.constant(null)
        case Traversable.is.boolean(x): return fc.boolean()
        case Traversable.is.integer(x): return fc.integer()
        case Traversable.is.number(x): return fc.oneof(fc.integer(), fc.float())
        case Traversable.is.string(x): return fc.lorem()
        case Traversable.is.anyOf(x): return fc.oneof(...x.anyOf)
        case Traversable.is.oneOf(x): return fc.oneof(...x.oneOf)
        case Traversable.is.allOf(x): return fc.tuple(...x.allOf)
          .map((xs) => xs.reduce((ys: {}, y) => (y ? Object_assign(ys, y) : ys), {}))
        case Traversable.is.array(x): return fc.array(x.items)
        case Traversable.is.record(x): return fc.dictionary(fc.lorem(), x.additionalProperties)
        case Traversable.is.tuple(x): return fc.tuple(...x.items)
        case Traversable.is.object(x): return fc.record(
          { ...x.properties }, 
          { requiredKeys: [...(x.required ?? [])] }
        )
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
}: Options = defaults) { // : (term: Traversable.any) => string {
  return fn.flow(
    Traversable.fromJsonSchema, 
    fn.cata(Traversable.Functor)(Algebra.jit({ arbitraryName, stripTypes })),
  )
}

function generateArbitrary(options: Options = defaults): (term: Traversable.any) => string {
  return fn.flow(
    generateArbitrary_fold(options),
    (body) => "const " + options.arbitraryName + " = " + body,
  )
}

generateArbitrary.defaults = defaults
generateArbitrary.fold = generateArbitrary_fold

deriveArbitrary.defaults = object.pick(defaults, "compare")
deriveArbitrary.fold = deriveArbitrary_fold

function deriveArbitrary(_?: Options): <T extends Traversable.any>(schema: T) => fc.Arbitrary<Traversable.toType<T>>
function deriveArbitrary(_: Options = deriveArbitrary.defaults): {} 
  { return fn.flow(deriveArbitrary_fold) }

function deriveArbitrary_fold(_?: Options): <const T extends Traversable.any>(term: T) => fc.Arbitrary<Traversable.toType<T>>
function deriveArbitrary_fold(_: Options = defaults): {}
  { return fn.flow(Traversable.fromJsonSchema, fn.cata(Traversable.Functor)(Algebra.arbitrary)) }
