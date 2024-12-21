// export const inverted = {
//   null(x: Schema.null) { return fc.constant(null) },
//   boolean(x: Schema.boolean) { return fc.boolean() },
//   integer(x: Schema.integer) { return fc.integer() },
//   number(x: Schema.number) { return fc.oneof(fc.integer(), fc.float()) },
//   string(x: Schema.string) { return fc.lorem() },
//   array<T>(x: Schema.array.of<fc.Arbitrary<T>>)
//     { return fc.array(x.items) },
//   tuple<T>(x: Schema.tuple.of<fc.Arbitrary<T>>)
//     { return fc.tuple(...x.items) },
//   anyOf<T>(x: Schema.anyOf.of<fc.Arbitrary<T>>)
//     { return fc.oneof(...x.anyOf) },
//   oneOf<T>(x: Schema.oneOf.of<fc.Arbitrary<T>>)
//     { return fc.oneof(...x.oneOf) },
//   object<T>(x: Schema.object.of<fc.Arbitrary<T>>)
//     { return fc.object(x.properties) },
//   record<T>(x: Schema.record.of<fc.Arbitrary<T>>)
//     { return fc.dictionary(fc.lorem(), x.additionalProperties) },
//   allOf<T>(x: Schema.allOf.of<fc.Arbitrary<T>>)
//     { return fc.tuple(...x.allOf).map((xs) => xs.reduce((ys, y) => Object.assign(ys, y), {})) },
// } satisfies globalThis.Record<Schema.Tag, (x: never) => fc.Arbitrary<unknown>>
// export function invert<const T extends typeof inverted>(mapping: T): T { return mapping }
// const usage = invert({
//   null(x: Schema.null) { return fc.constant(null) },
//   boolean(x: Schema.boolean) { return fc.boolean() },
//   integer(x: Schema.integer) { return fc.integer() },
//   number(x: Schema.number) { return fc.oneof(fc.integer(), fc.float()) },
//   string(x: Schema.string) { return fc.lorem() },
//   array<T>(x: Schema.array.of<fc.Arbitrary<T>>)
//     { return fc.array(x.items) },
//   tuple<T>(x: Schema.tuple.of<fc.Arbitrary<T>>)
//     { return fc.tuple(...x.items) },
//   anyOf<T>(x: Schema.anyOf.of<fc.Arbitrary<T>>)
//     { return fc.oneof(...x.anyOf) },
//   oneOf<T>(x: Schema.oneOf.of<fc.Arbitrary<T>>)
//     { return fc.oneof(...x.oneOf) },
//   object<T>(x: Schema.object.of<fc.Arbitrary<T>>)
//     { return fc.object(x.properties) },
//   record<T>(x: Schema.record.of<fc.Arbitrary<T>>)
//     { return fc.dictionary(fc.lorem(), x.additionalProperties) },
//   allOf<T>(x: Schema.allOf.of<fc.Arbitrary<T>>)
//     { return fc.tuple(...x.allOf).map((xs) => xs.reduce((ys, y) => Object.assign(ys, y), {})) },
// })
// type inverted = {
//   null: HKT.const<null>
//   boolean: HKT.const<boolean>
//   integer: HKT.const<number>
//   number: HKT.const<number>
//   string: HKT.const<string>
//   array: Schema.array.lambda
//   tuple: Schema.tuple.lambda
//   object: Schema.object.lambda
//   record: Schema.record.lambda
//   allOf: Schema.allOf.lambda
//   anyOf: Schema.anyOf.lambda
//   oneOf: Schema.oneOf.lambda
// }
// type fold<F extends Schema.any, S extends fc.Arbitrary<unknown>>
//   = F extends { type: Schema.Tag } ? HKT.apply<inverted[F["type"]], S extends fc.Arbitrary<infer T> ? T : never>
//   : never

import { fn, object } from "@traversable/data"
import type { Functor, Partial } from "@traversable/registry"
import * as fc from "fast-check"

import { Ext as Schema } from "./model.js"

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
  export const arbitrary: Functor.Algebra<Schema.lambda, fc.Arbitrary<{} | null>> = (x) => {
    switch (true) {
      case Schema.is.null(x):
        return fc.constant(null)
      case Schema.is.boolean(x):
        return fc.boolean()
      case Schema.is.integer(x):
        return fc.integer()
      case Schema.is.number(x):
        return fc.oneof(fc.integer(), fc.float())
      case Schema.is.string(x):
        return fc.lorem()
      case Schema.is.array(x):
        return fc.array(x.items)
      case Schema.is.record(x):
        return fc.dictionary(fc.lorem(), x.additionalProperties)
      case Schema.is.tuple(x):
        return fc.tuple(...x.items)
      case Schema.is.anyOf(x):
        return fc.oneof(...x.anyOf)
      case Schema.is.oneOf(x):
        return fc.oneof(...x.oneOf)
      case Schema.is.object(x):
        return fc.record({ ...x.properties }, { requiredKeys: [...x.required] })
      case Schema.is.allOf(x):
        return fc.tuple(...x.allOf).map((xs) => xs.reduce((ys: {}, y) => (y ? Object_assign(ys, y) : ys), {}))
      default:
        return fn.exhaustive(x)
    }
  }

  /**
   * ## {@link codegen `Algebra.codegen`}
   */
  export const jit: (options?: Options) => Functor.Algebra<Schema.lambda, string> =
    ({ stripTypes: noTypes = defaults.stripTypes } = defaults) =>
    (x) => {
      switch (true) {
        case Schema.is.null(x):
          return "fc.constant(null)"
        case Schema.is.boolean(x):
          return "fc.boolean()"
        case Schema.is.integer(x):
          return "fc.integer()"
        case Schema.is.number(x):
          return "fc.float()"
        case Schema.is.string(x):
          return "fc.lorem()"
        case Schema.is.array(x):
          return "fc.array(" + x.items + ")"
        case Schema.is.record(x):
          return "fc.dictionary(fc.lorem(), " + x.additionalProperties + ")"
        case Schema.is.tuple(x):
          return "fc.tuple(" + x.items.join(", ") + ")"
        case Schema.is.anyOf(x):
          return "fc.oneof(" + x.anyOf.join(", ") + ")"
        case Schema.is.oneOf(x):
          return "fc.oneof(" + x.oneOf.join(", ") + ")"
        case Schema.is.object(x):
          return (
            "fc.record(" +
            "{ " +
            Object_entries(x.properties).map(object.parseEntry).join(", ") +
            " }, " +
            "{ requiredKeys: [" +
            x.required.map((k) => '"' + k + '"').join(", ") +
            "]" +
            " }" +
            ")"
          )
        case Schema.is.allOf(x):
          return "fc.tuple(" + x.allOf.join(", ") + ")" + ".map((xs) => xs.reduce((ys" + noTypes
            ? ""
            : ": {}" + ", y) => y ? Object.assign(ys, y) : ys, {}))"
        default:
          return fn.exhaustive(x)
      }
    }
}

declare namespace generateArbitrary {
  export { Options }
}
generateArbitrary.defaults = defaults

generateArbitrary.fold = ({
  arbitraryName = defaults.arbitraryName,
  stripTypes = defaults.stripTypes,
}: Options = defaults) =>
  fn.flow(Schema.fromSchema, fn.cata(Schema.functor)(Algebra.jit({ arbitraryName, stripTypes })))

function generateArbitrary<T extends Schema.any>(
  schema: T,
  options: Options = generateArbitrary.defaults,
): string {
  return fn.pipe(
    schema,
    generateArbitrary.fold(options),
    (body) => "const " + options.arbitraryName + " = " + body,
  )
}

deriveArbitrary.fold = deriveFold
deriveArbitrary.defaults = object.pick(defaults, "compare")

function deriveArbitrary(
  options?: Options,
): <T extends Schema.Weak>(schema: T) => fc.Arbitrary<Schema.toType<T>>
function deriveArbitrary(options: Options = defaults): {} {
  return fn.flow(Schema.fromSchema, fn.cata(Schema.functor)(Algebra.arbitrary))
}

function deriveFold(
  options?: Options,
): <const T extends Schema.Weak>(term: T) => fc.Arbitrary<Schema.toType<T>>
function deriveFold(_: Options = defaults): {} {
  return fn.flow(Schema.fromSchema, fn.cata(Schema.functor)(Algebra.arbitrary))
}
