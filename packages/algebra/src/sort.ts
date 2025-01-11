import { Traversable } from "@traversable/core"
import type { Compare } from "@traversable/data"
import { fn, map, order } from "@traversable/data"
import { Weight, openapi } from "@traversable/openapi"
import type { Functor } from "@traversable/registry"
import { type Partial, WeightByType, WeightMap } from "@traversable/registry"

export { deriveSort as derive }

export type Options = Partial<typeof defaults>

export const defaults = {
  compare: order.mapInput(
    order.number,
    fn.flow(Weight.fromSchema({ paths: {} }, WeightMap), (_) => _.weight),
  ) as Compare<Traversable>,
  doc: openapi.doc({}),
  weightMap: WeightByType as Partial<WeightByType>,
} as const

deriveSort.defaults = defaults

/** @internal */
const Object_fromEntries = globalThis.Object.fromEntries
/** @internal */
const Object_entries = globalThis.Object.entries

function compareMany($: Compare<Traversable>): Compare<readonly Traversable[]> {
  return (l, r) => {
    const lengths = order.array.lengthAscending(l, r)
    if (lengths !== 0) return lengths
    else {
      const li = [...l].sort($)
      const ri = [...r].sort($)
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
}

export const compare
  : (comparisonFn: Compare<Traversable>) => Compare<Traversable> 
  = ($) => (l, r) => {
    const ordering = $(l, r)
    if (ordering !== 0) return ordering
    else switch (true) {
      default: return 0
      case Traversable.is.null(l): return 0
      case Traversable.is.boolean(l): return 0
      case Traversable.is.integer(l): return 0
      case Traversable.is.number(l): return 0
      case Traversable.is.string(l): return 0
      case Traversable.is.allOf(l) && Traversable.is.allOf(r): return compareMany($)(l.allOf, r.allOf)
      case Traversable.is.anyOf(l) && Traversable.is.anyOf(r): return compareMany($)(l.anyOf, r.anyOf)
      case Traversable.is.oneOf(l) && Traversable.is.oneOf(r): return compareMany($)(l.oneOf, r.oneOf)
      case Traversable.is.tuple(l) && Traversable.is.tuple(r): return compareMany($)(l.items, r.items)
      case Traversable.is.array(l) && Traversable.is.array(r): {
        const shallow = $(l.items, r.items)
        if (shallow !== 0) return shallow
        else return compare($)(l.items, r.items)
      }
      case Traversable.is.record(l) && Traversable.is.record(r): {
        const shallow = $(l.additionalProperties, r.additionalProperties)
        if (shallow !== 0) return shallow
        else return compare($)(l.additionalProperties, r.additionalProperties)
      }
      case Traversable.is.object(l) && Traversable.is.object(r): {
        const orderEntries = order.mapInput($, ([, v]: readonly [k: string, v: Traversable]) => v)
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
            const loop = compare($)(left[ix][1], right[ix][1])
            if (loop !== 0) return loop
          }
          return 0
        }
      }
    }
  }

export namespace Coalgebra {
  export const sort
    : (comparisonFn: Compare<Traversable>) => Functor.Coalgebra<Traversable.lambda, Traversable> 
    = ($) => (n) => {
      switch (true) {
        default: return fn.softExhaustiveCheck(n)
        case Traversable.is.enum(n): return n
        case Traversable.is.scalar(n): return n
        case Traversable.is.array(n): return n
        case Traversable.is.record(n): return n
        case Traversable.is.allOf(n): return { ...n, allOf: [...n.allOf].sort(compare($)) }
        case Traversable.is.anyOf(n): return { ...n, anyOf: [...n.anyOf].sort(compare($)) }
        case Traversable.is.oneOf(n): return { ...n, oneOf: [...n.oneOf].sort(compare($)) }
        case Traversable.is.tuple(n): return {
          ...n,
          items: n.items
            .map((x, ix) => [ix, x] satisfies [number, any])
            .sort(order.mapInput(compare($), ([, v]) => v))
            .map(([ix, x]) => (((x as never as { originalIndex: number }).originalIndex = ix), x)),
        }
        case Traversable.is.object(n): return {
          ...n,
          properties: fn.pipe(
            n.properties,
            Object_entries,
            (xs) => xs.sort(order.mapInput(compare($), ([, v]) => v)),
            Object_fromEntries,
          ),
        }
      }
    }
}

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
 *      E: { type: "object", properties: { E2: { type: "string" }, E1: { type: "null" } }, required: ["E1", "E2"] },
 *      C: { type: "object", properties: {}, required: [] },
 *      B: { type: "string", format: "date" },
 *      A: { type: "null" },
 *      F: { type: "array", items: { type: "object", properties: { F1: { type: "null" }, F2: { type: "integer" } }, required: [] } },
 *      D: { type: "object", properties: { D1: { type: "null" } }, required: ["D1"] },
 *    }
 *  }
 *
 *  const expected_1 = [
 *    ["A", { type: "null" }],
 *    ["B", { type: "string", format: "date" }],
 *    ["C", { type: "object", properties: {}, required: [] }],
 *    ["D", { type: "object", properties: { D1: { type: "null" } }, required: ["D1"] }],
 *    ["E", { type: "object", properties: { E1: { type: "null" }, E2: { type: "string" } }, required: ["E1", "E2"] }],
 *    ["F": { type: "array", items: { type: "object", properties: { F1: { type: "null" }, F2: { type: "integer" } }, required: [] } }],
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
 *  // However, obects do remember insertion-order for non-numeric properties, so 
 *  // we can observe that our sort worked by enumerating the object.
 *  vi.assert.deepEqual(actual, expected_1)
 *  // ⛳️ 1 passed
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
function deriveSort(options?: Options): <const T extends Traversable.any>(schema: T) => T
function deriveSort({ 
  compare,
  weightMap,
  doc = defaults.doc,
}: Options = deriveSort.defaults): {} {
  if (compare) return (
    fn.ana(Traversable.Functor)(
      Coalgebra.sort(order.mapInput(compare, Traversable.fromJsonSchema))
    )
  )
  else if (weightMap) {
    const weights: WeightMap = fn.pipe(
      { ...WeightByType, ...weightMap },
      map((weight) => ({ weight, predicate(u: unknown): u is unknown { return true } })),
    )
    const $ = order.mapInput(
      order.number,
      fn.flow(Weight.fromSchema(doc, weights), (_) => _.weight),
    ) as Compare<Traversable>
    return fn.ana(Traversable.Functor)(Coalgebra.sort($))
  }
  else return fn.ana(Traversable.Functor)(
    Coalgebra.sort(
      order.mapInput(defaults.compare, Traversable.fromJsonSchema),
    )
  )
}
