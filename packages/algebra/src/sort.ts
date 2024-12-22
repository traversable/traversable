import type { Compare } from "@traversable/data"
import { fn, order } from "@traversable/data"
import { Weight } from "@traversable/openapi"
import type { Functor } from "@traversable/registry"
import { type Partial, type Required, WeightMap } from "@traversable/registry"

import { Ext as Schema } from "./model.js"

export { deriveSort as derive }

export type Options = Partial<{
  compare: Compare<Schema.any>
}>

export const defaults = {
  compare: order.mapInput(
    order.number,
    fn.flow(Weight.fromSchema({ paths: {} }, WeightMap), (_) => _.weight),
  ) as Compare<any>,
} as const satisfies Required<Options>

/** @internal */
const Object_entries = globalThis.Object.entries
/** @internal */
const Object_fromEntries = globalThis.Object.fromEntries

export const areTheSameType: (l: Schema, r: Schema) => boolean = (l, r) =>
  "type" in l && "type" in r
    ? l.type === r.type
    : ("oneOf" in l && "oneOf" in r) || ("allOf" in l && "allOf" in r) || ("anyOf" in l && "anyOf" in r)

export const compare: (comparisonFn: Compare<Schema>) => Compare<Schema> = ($) => (l, r) => {
  // if (!areTheSameType(l, r))
  //   return Invariant.IllegalState("Node types do not match", l, r)
  const ordering = $(l, r)
  if (ordering !== 0) return ordering
  else
    switch (true) {
      case Schema.is.null(l):
        return 0
      case Schema.is.boolean(l):
        return 0
      case Schema.is.integer(l):
        return 0
      case Schema.is.number(l):
        return 0
      case Schema.is.string(l):
        return 0
      case Schema.is.array(l) && Schema.is.array(r): {
        const shallow = $(l.items, r.items)
        if (shallow !== 0) return shallow
        else return compare($)(l.items, r.items)
      }
      case Schema.is.record(l) && Schema.is.record(r): {
        const shallow = $(l.additionalProperties, r.additionalProperties)
        if (shallow !== 0) return shallow
        else return compare($)(l.additionalProperties, r.additionalProperties)
      }
      case Schema.is.tuple(l) && Schema.is.tuple(r): {
        const lengths = order.array.lengthAscending(l.items, r.items)
        if (lengths !== 0) return lengths
        else {
          const li = [...l.items].sort($)
          const ri = [...r.items].sort($)
          for (let ix = 0, len = li.length; ix < len; ix++) {
            const shallow = $(li[ix], ri[ix])
            if (shallow !== 0) return shallow
          }
          for (let ix = 0, len = li.length; ix < len; ix++) {
            const items = compare($)(li[ix], ri[ix])
            if (items !== 0) return items
          }
          return 0
        }
      }
      case Schema.is.object(l) && Schema.is.object(r): {
        const orderEntries = order.mapInput($, ([, v]: readonly [k: string, v: Schema]) => v)
        const leftEntries = Object_entries(l.properties)
        const rightEntries = Object_entries(r.properties)
        const lengths = order.array.lengthAscending(leftEntries, rightEntries)
        if (lengths !== 0) return lengths
        else {
          const left = leftEntries.sort(orderEntries)
          const right = rightEntries.sort(orderEntries)
          for (let ix = 0, len = left.length; ix < len; ix++) {
            const shallow = $(left[ix][1], right[ix][1])
            if (shallow !== 0) return shallow
          }
          for (let ix = 0, len = left.length; ix < len; ix++) {
            const values = compare($)(left[ix][1], right[ix][1])
            if (values !== 0) return values
          }
          return 0
        }
      }
      case Schema.is.allOf(l) && Schema.is.allOf(r):
      case Schema.is.anyOf(l) && Schema.is.anyOf(r):
      case Schema.is.oneOf(l) && Schema.is.oneOf(r):
      default:
        return fn.exhaustive(l as never, r as never)
    }
}

export namespace Coalgebra {
  export const sort: (comparisonFn: Compare<Schema>) => Functor.Coalgebra<Schema.lambda, Schema> =
    ($) => (n) => {
      switch (true) {
        case Schema.is.enum(n): return n
        case Schema.is.null(n): return n
        case Schema.is.boolean(n): return n
        case Schema.is.integer(n): return n
        case Schema.is.number(n): return n
        case Schema.is.string(n): return n
        case Schema.is.array(n): return n
        case Schema.is.record(n): return n
        case Schema.is.allOf(n): return { ...n, allOf: [...n.allOf].sort(compare($)) }
        case Schema.is.anyOf(n): return { ...n, anyOf: [...n.anyOf].sort(compare($)) }
        case Schema.is.oneOf(n): return { ...n, oneOf: [...n.oneOf].sort(compare($)) }
        case Schema.is.tuple(n):
          return {
            ...n,
            items: n.items
              .map((x, ix) => [ix, x] satisfies [number, Schema])
              .sort(order.mapInput(compare($), ([, v]) => v))
              .map(([ix, x]) => (((x as { originalIndex: number }).originalIndex = ix), x)),
          }
        case Schema.is.object(n):
          return {
            ...n,
            properties: fn.pipe(
              n.properties,
              Object_entries,
              (xs) => xs.sort(order.mapInput(compare($), ([, v]) => v)),
              Object_fromEntries,
            ),
          }
        default:
          return fn.softExhaustiveCheck(n)
      }
    }
}

deriveSort.defaults = defaults

/**
 * ## {@link deriveSort `sort.derive`}
 *
 * Given a comparison function that returns `-1`, `0` or `1`, and 2 arbitrary
 * OpenAPI or JSON Schema nodes, returns a function that expects an OpenAPI
 * or JSON Schema spec, and recursively "sorts" it.
 *
 * @example
 *  import { sort } from "@traversable/algebra"
 *  import * as vi from "vitest"
 *
 *  const input_1 = {
 *    type: "object",
 *    properties: {
 *      E: { type: "object", properties: { e2: { type: "string" }, e1: { type: "null" } }},
 *      D: { type: "object", properties: { d1: { type: "null" }, d2: { type: "null" } }},
 *      B: { type: "object", properties: {} },
 *      A: { type: "string" },
 *      F: { type: "array", items: { type: "null" } },
 *      C: { type: "object", properties: { c1: { type: "tuple", items: [{ type: "string" }] } } },
 *    }
 *  }
 *
 *  const expected_1 = [
 *    ["A", { type: "string" }],
 *    ["B", { type: "object", properties: {} }],
 *    ["C", { type: "object", properties: { c1: { type: "tuple", items: [{ type: "string" }] } } }],
 *    ["D", { type: "object", properties: { d1: { type: "null" }, d2: { type: "null" } } }],
 *    ["E", { type: "object", properties: { e1: { type: "string" }, e2: { type: "null" } } }],
 *    ["F", { type: "array", items: { type: "null" } }],
 *  ]
 *
 *  const actual_1 = sort(input_1).properties
 *
 *  // Sanity check: make sure the entries aren't in-order to begin with
 *  vi.assert.notDeepEqual(Object.entries(actual_1), expected_1)
 *  // ⛳️ 1 passed
 *
 *  // **Note:** here we're comparing **entries** -- remember, objects themselves
 *  // don't have any semantics when it comes to order, or sequencing.
 *  // They do however preserve insertion order for non-numeric properties, which
 *  // means we can observe that our sort function by forcing the object to enumerate.
 *  vi.assert.deepEqual(actual, expected_1)
 *  // ⛳️ 1 passed
 *
 *
 *  // Cool. Let's make sure the sorting was actually recursive:
 *  const input_2 = input_1.properties.E.properties
 *  const expected_2 = [
 *    ["e1", { type: "null" }],
 *    ["e2", { type: "string" }],
 *  ]
 *  const actual_2 = actual_1.properties.E.properties
 *
 *  // Confirm that they're not already well-ordered to begin with:
 *  vi.assert.notDeepEqual(Object.entries(input_2), expected_2)
 *  // ⛳️ 1 passed
 *
 *  // Confirm that they're well-ordered after applying the sort
 *  vi.assert.notDeepEqual(Object.entries(actual_2), expected_2)
 *  // ⛳️ 1 passed
 *  // 😌
 */

function deriveSort(options?: Options): <const T extends Schema.any>(schema: T) => T
function deriveSort({ compare = defaults.compare }: Options = deriveSort.defaults) {
  return fn.ana(Schema.functor)(Coalgebra.sort(order.mapInput(compare, Schema.fromSchema)))
}
