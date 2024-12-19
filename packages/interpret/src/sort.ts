import { type Compare, fn, map, order } from "@traversable/data"
import { Weight } from "@traversable/openapi"
import { type Functor, WeightMap } from "@traversable/registry"

import { Ext, Ltd } from "./model.js"

export const nodesAreTheSameType: (l: Ext, r: Ext) => boolean = (l, r) =>
  "type" in l && "type" in r
    ? l.type === r.type
    : ("oneOf" in l && "oneOf" in r) || ("allOf" in l && "allOf" in r) || ("anyOf" in l && "anyOf" in r)

export { compareDeep }
const compareDeep: (compare: Compare<Ext>) => Compare<Ext> = (compare: Compare<Ext>) => {
  return (l, r) => {
    const ordering = compare(l, r)
    if (ordering !== 0) return ordering
    else {
      // nodes are the same type
      switch (true) {
        case Ltd.is.null(l):
          return 0
        case Ltd.is.boolean(l):
          return 0
        case Ltd.is.integer(l):
          return 0
        case Ltd.is.number(l):
          return 0
        case Ltd.is.string(l):
          return 0
        case Ext.is.array(l) && Ext.is.array(r): {
          const shallow = compare(l.items, r.items)
          if (shallow !== 0) return shallow
          else return compareDeep(compare)(l.items, r.items)
        }
        case Ext.is.record(l) && Ext.is.record(r): {
          const shallow = compare(l.additionalProperties, r.additionalProperties)
          if (shallow !== 0) return shallow
          else return compareDeep(compare)(l.additionalProperties, r.additionalProperties)
        }

        case Ext.is.tuple(l) && Ext.is.tuple(r): {
          const lengths = order.array.lengthAscending(l.items, r.items)
          if (lengths !== 0) return lengths
          else {
            const li = [...l.items].sort(compare)
            const ri = [...r.items].sort(compare)
            for (let ix = 0, len = li.length; ix < len; ix++) {
              const items = compare(li[ix], ri[ix])
              if (items !== 0) return items
            }
            for (let ix = 0, len = li.length; ix < len; ix++) {
              const itemsDeep = compareDeep(compare)(li[ix], ri[ix])
              if (itemsDeep !== 0) return itemsDeep
            }
            return 0
          }
        }

        case Ext.is.object(l) && Ext.is.object(r): {
          const orderEntries = order.mapInput(compare, ([, v]: readonly [k: string, v: Ext]) => v)
          const leftEntries = Object.entries(l.properties)
          const rightEntries = Object.entries(r.properties)
          const lengths = order.array.lengthAscending(leftEntries, rightEntries)
          if (lengths !== 0) return lengths
          else {
            const left = leftEntries.sort(orderEntries)
            const right = rightEntries.sort(orderEntries)
            for (let ix = 0, len = left.length; ix < len; ix++) {
              const values = compare(left[ix][1], right[ix][1])
              if (values !== 0) return values
            }
            for (let ix = 0, len = left.length; ix < len; ix++) {
              const valuesDeep = compareDeep(compare)(left[ix][1], right[ix][1])
              if (valuesDeep !== 0) return valuesDeep
            }
            return 0
          }
        }
        default:
          return 0
      }
    }
  }
}

const coalgebra: (compare: Compare<Ext>) => Functor.Coalgebra<Ext.lambda, Ext> = (compare) => (n) => {
  switch (true) {
    case Ltd.is.null(n):
      return n
    case Ltd.is.boolean(n):
      return n
    case Ltd.is.integer(n):
      return n
    case Ltd.is.number(n):
      return n
    case Ltd.is.string(n):
      return n
    case Ext.is.array(n):
      return n
    case Ext.is.record(n):
      return n
    case Ext.is.allOf(n):
      return { allOf: [...n.allOf].sort(compareDeep(compare)) }
    case Ext.is.anyOf(n):
      return { anyOf: [...n.anyOf].sort(compareDeep(compare)) }
    case Ext.is.oneOf(n):
      return { oneOf: [...n.oneOf].sort(compareDeep(compare)) }
    case Ext.is.tuple(n): {
      // const out = { ...n, items: [...n.items].sort(compareDeep(compare)) }

      const items =
        // Object.entries(
        n.items
          .map((x, ix) => [ix, x] as const)
          .sort(order.mapInput(compareDeep(compare), ([, v]) => v))
          .map(([originalIx, x]) => ({ ...x, originalIx }))
      // .reduce((acc: { [ix: `_${number}`]: typeof x }, [ix, x], order) => (acc["_" + order] = [ix, x], acc), {})
      // )
      // const out: { [originalIx: number]: Ext } = Array.from()

      // pre.forEach(([originalIx, x], ix) => {
      //   out["_" + originalIx] = x
      // })

      // console.log(JSON.stringify(n.items, null, 2))
      // console.log(out)
      // console.log(JSON.stringify(Object.entries(out), null, 2))
      // console.log(Object.fromEntries(Object.entries(out).map(([, x]) => x)))
      // console.log(Object.entries(Object.fromEntries(Object.entries(out).map(([, x]) => x))))

      return { ...n, items }
    }
    case Ext.is.object(n):
      return {
        ...n,
        properties: fn.pipe(
          n.properties,
          Object.entries,
          (xs) => xs.sort(order.mapInput(compareDeep(compare), ([, v]) => v)),
          Object.fromEntries,
        ),
      }
    default:
      return n // fn.exhaustive(n)
  }
}

export { deriveSort as sortDeep, deriveSort as derive }

/**
 * ## {@link deriveSort `sort.derive`}
 *
 * Given a comparison function that returns `-1`, `0` or `1` given 2 arbitrary
 * OpenAPI or JSON Schema nodes, returns a function that expects an OpenAPI
 * or JSON Schema spec, and recursively "sorts" it.
 *
 * @example
 *  import { sort } from "@traversable/interpret"
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

function deriveSort(options?: deriveSort.Options): <const T extends Ltd | Ext.lax | Ext>(schema: T) => T
function deriveSort(
  {
    compare = deriveSort.defaults.compare,
    // weightMap = deriveSort.defaults.weightMap,
  }: deriveSort.Options = deriveSort.defaults,
) {
  /// impl.
  return fn.ana(Ext.functor)(coalgebra(order.mapInput(compare, Ext.fromSchema)))
}

declare namespace deriveSort {
  type Options = Partial<typeof deriveSort.defaults>
  namespace _Internal {
    interface Options {
      compare: Compare<Ltd | Ext.lax | Ext>
      // weightMap: WeightMap
    }
  }
}

namespace deriveSort {
  export const defaults = {
    compare: order.mapInput(
      order.number,
      fn.flow(Weight.fromSchema({ paths: {} }, WeightMap), (_) => _.weight),
    ) as Compare<any>,
    // weightMap: WeightMap,
  } as const satisfies deriveSort._Internal.Options
}
