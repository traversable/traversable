
import * as vi from "vitest"

import { Property, fc, test, tree } from "@traversable/core"
import type { props } from "@traversable/data"

import fromPaths = tree.fromPaths
const { wrap } = fromPaths

const head
  : <T extends unknown[]>(xs: T) => T[0]
  = (xs) => xs[0]
const propsComparator = (l: props.any, r: props.any) => {
  for (let ix = 0, len = globalThis.Math.min(l.length, r.length); ix < len; ix++)
    if (l[ix] === r[ix]) return true
    return false
}
const withIndex = <K, V>(xss: readonly [readonly K[], V][]): readonly [readonly [number, ...readonly K[]], V][] => 
  xss.map(([path, leaf], ix) => [[ix, ...path], leaf])


/** 
 * =========================
 *    EXAMPLE-BASED TESTS
 * =========================
 * 
 * These tests are included as a form of documentation only.
 * 
 * The actual tests (the ones that give us the most confidence) 
 * are located in the `describe` block directly below this one.
 */
vi.describe("〖🩹〗 @traversable/core/tree", () => {
  vi.it("〖🩹〗 tree.set: applies the patch when both the source and target are composite types", () => {
    const patch = { X: { Y: { Z: 9000 }} }
    const ex_01 = tree.set
      ("a", "b", "c")
      ({ a: { b: { c: { d: 3 } } } })
      (patch)
    void vi.assert.deepEqual(
      // TODO: fix tree.set's types and remove these type assertions
      tree.get(ex_01 as never, "a", "b", "c"),
      patch
    )
  })

  vi.it("〖🩹〗 tree.set: applies the patch when both the source and target are primitive types", () => {
    const ex_01 = tree.set
      ("a", "b", "c")
      ({ a: { b: { c: 3 } } })
      (4)
    void vi.assert.deepEqual(
      // TODO: fix tree.set's types and remove these type assertions
      tree.get(ex_01 as never, "a", "b", "c"),
      4
    )
  })

  vi.it("〖🩹〗 tree.set: applies the patch when source is primitive and the target is composite", () => {
    const ex_01 = tree.set
      ("a", "b", "c")
      ({ a: { b: { c: 4 } } })
      ([1, 2, 3])
    void vi.assert.deepEqual(
      // TODO: fix tree.set's types so you can remove these type assertions
      tree.get(ex_01 as never, "a", "b", "c"),
      [1, 2, 3]
    )
  })

  vi.it("〖🩹〗 applies the patch when source is composite and the target is primitive", () => {
    const ex_01 = tree.set
      ("a", "b", "c")
      ({ a: { b: { c: [1, 2, 3] } } })
      (4)
    vi.assert.deepEqual(
      // TODO: fix tree.set's types so you can remove these type assertions
      tree.get(ex_01 as never, "a", "b", "c"),
      4
    )
  })

  vi.it("〖🩹〗 tree.set: mutates its argument", () => {
    const input_01 = { "$": { "_": { "0": { "_": { "A": {} } } } } }
    void tree.set
      ("$", "_", 0, "_", "A")
      (input_01)
      ([])
    void vi.assert.deepEqual(
      // TODO: fix tree.set's types so you can remove these type assertions
      tree.get(input_01 as never, "$", "_", 0, "_", "A"),
      []
    )
  })

  vi.it("〖🩹〗 tree.toPaths", () => {
    void vi.assert.deepEqual(tree.toPaths("hey"), [[[], "hey"]])
    void vi.assert.deepEqual(tree.toPaths(null), [[[], null]])
    void vi.assert.deepEqual(tree.toPaths([1]), [[[0], 1]])
    void vi.assert.deepEqual(
      tree.toPaths({ 
        a: [null], 
        b: [ [ 100 ], 200 ],
        c: { h: [ [ [ 300, 400 ], { i: 500 } ] ] },
        d: [],
        e: {},
        f: null,
        g: undefined,
      }),
      [
        [ [ 'a', 0 ], null ],
        [ [ 'b', 0, 0 ], 100 ],
        [ [ 'b', 1 ], 200 ],
        [ [ 'c', 'h', 0, 0, 0 ], 300 ],
        [ [ 'c', 'h', 0, 0, 1 ], 400 ],
        [ [ 'c', 'h', 0, 1, 'i' ], 500 ],
        [ [ 'd' ], [] ],
        [ [ 'e' ], {} ],
        [ [ 'f' ], null ],
        [ [ 'g' ], undefined ]
      ]
    )
  })

  vi.it("〖🩹〗 tree.fromPaths", () => {
    const ex_01 = tree.fromPaths([
      [ [ "a", 0 ], "zero" ],
      [ [ "a", 1 ], "one" ],
      [ [ "b", 0, 0 ], 100 ],
      [ [ "b", 1 ], 200 ],
      [ [ "c", 'j', 0, 0, 0 ], 300 ],
      [ [ "c", 'j', 0, 0, 1 ], 400 ],
      [ [ "c", 'j', 0, 1, 'i' ], 500 ],
      [ [ "d" ], [] ],
      [ [ "e" ], {} ],
      [ [ "f" ], null ],
      [ [ "g" ], [ 100, 200, 300 ] ],
      [ [ "h", 0 ], [ 400, 4000, 40_000 ] ],
      [ [ "h", 1 ], [ 500, 5000, 50_000 ] ],
      [ [ "h", 2 ], [ 600, 6000, 60_000 ] ],
    ])
    void vi.assert.deepEqual(
      ex_01,
      {
        a: [ "zero", "one" ],
        b: [ [ 100 ], 200 ],
        c: {
          j: [ [ [ 300, 400 ], { i: 500 } ] ]
        },
        d: [],
        e: {},
        f: null,
        g: [ 100, 200, 300 ],
        h: [
          [ 400, 4_000, 40_000 ],
          [ 500, 5_000, 50_000 ],
          [ 600, 6_000, 60_000 ],
        ],
      }
    )
  })

  vi.it("〖🩹〗 tree.fromPaths.ensureContiguous", () => {
    void vi.assert.isTrue(
      tree.fromPaths.isContiguous([
      [ [ 0, "c" ], 100 ],
      [ [ 0, "a" ],   2 ],
      [ [ 1, "b" ],  30 ],
    ]))
    void vi.assert.isTrue(
      tree.fromPaths.isContiguous([
      [ [ 0, "c" ], 100 ],
      [ [ 1, "a" ],   2 ],
      [ [ 2, "b" ],  30 ],
    ]))
    void vi.assert.isTrue(
      tree.fromPaths.isContiguous([
      [ [ 0, "c" ], 100 ],
      [ [ 2, "a" ],   2 ],
      [ [ 1, "b" ],  30 ],
    ]))
    void vi.assert.isFalse(
      tree.fromPaths.isContiguous([
      [ [ 0, "c" ], 100 ],
      [ [ 1, "a" ],   2 ],
      [ [ 3, "b" ],  30 ],
    ]))
    void vi.assert.isFalse(
      tree.fromPaths.isContiguous([
      [ [  0,  "c" ], 100 ],
      [ [ "x", "a" ],   2 ],
      [ [  1,  "b" ],  30 ],
    ]))
    void vi.assert.isTrue(
      tree.fromPaths.isContiguous([
      [ [  10,  "m" ],  110 ],
      [ [  7,  "q" ],  80 ],
      [ [  0,  "x" ], 10 ],
      [ [  2,  "v" ],  30 ],
      [ [  3,  "u" ],  40 ],
      [ [  4,  "t" ],  50 ],
      [ [  5,  "s" ],  60 ],
      [ [  1,  "w" ],  20 ],
      [ [  6,  "r" ],  70 ],
      [ [  8,  "p" ],  90 ],
      [ [  9,  "o" ],  100 ],
      [ [  11,  "n" ],  120 ],
    ]))
  })

  vi.it("〖🩹〗 tree.fromPaths.group", () => {
    void vi.assert.deepEqual(
      tree.fromPaths.group([
        [ [ "a", 0 ], wrap(null) ],
        [ [ "b", 0, 0 ], wrap(100) ],
        [ [ "b", 1 ], wrap(200) ],
        [ [ "c", 'h', 0, 0, 0 ], wrap(300) ],
        [ [ "c", 'h', 0, 0, 1 ], wrap(400) ],
        [ [ "c", 'h', 0, 1, 'i' ], wrap(500) ],
        [ [ "d" ], wrap([]) ],
        [ [ "e" ], wrap({}) ],
        [ [ "f" ], wrap(null) ],
        [ [ "g" ], wrap(undefined) ],
        [ [ "h" ], wrap([ 100, 200, 300 ]) ],
        [ [ "i", 0 ], wrap([ 400, 4000, 40_000 ]) ],
        [ [ "i", 1 ], wrap([ 500, 5000, 50_000 ]) ],
        [ [ "i", 2 ], wrap([ 600, 6000, 60_000 ]) ],
      ]),
      {
        a: [ 
          [ [ 0 ], wrap(null) ],
        ],
        b: [ 
          [ [ 0, 0 ], wrap(100) ], 
          [ [ 1 ], wrap(200) ],
        ],
        c: [
          [ [ "h", 0, 0, 0 ], wrap(300) ],
          [ [ "h", 0, 0, 1 ], wrap(400) ],
          [ [ "h", 0, 1, "i" ], wrap(500) ],
        ],
        d: wrap([]),
        e: wrap({}),
        f: wrap(null),
        g: wrap(undefined),
        h: wrap([ 100, 200, 300 ]),
        i: [
          [ [ 0 ], wrap([ 400, 4_000, 40_000 ]) ],
          [ [ 1 ], wrap([ 500, 5_000, 50_000 ]) ],
          [ [ 2 ], wrap([ 600, 6_000, 60_000 ]) ],
        ]
      }
    )
  })

  vi.it("〖🩹〗 tree.fromPaths.isGroupedArray", () => {
    void vi.assert.isTrue(
      tree.fromPaths.isGroupedArray([
        [ [ 0 ], wrap([ 400, 4_000, 40_000 ]) ],
        [ [ 1 ], wrap([ 500, 5_000, 50_000 ]) ],
        [ [ 2 ], wrap([ 600, 6_000, 60_000 ]) ],
      ])
    )
    void vi.assert.isFalse(
      tree.fromPaths.isGroupedArray([
        [ [ 0 ], wrap([ 400, 4_000, 40_000 ]) ],
        [ [ 1 ], wrap([ 500, 5_000, 50_000 ]) ],
        [ [ 3 ], wrap([ 600, 6_000, 60_000 ]) ],
      ])
    )
    void vi.assert.isFalse(
      tree.fromPaths.isGroupedArray([
        [ [ "a" ], wrap([ 400, 4_000, 40_000 ]) ],
      ])
    )
  })

  vi.it("〖🩹〗 tree.fromPaths.markAll", () => {
    void vi.assert.deepEqual(
      tree.fromPaths.markAll([
        [ [ "a", 0 ], null ],
        [ [ "b", 0, 0 ], 100 ],
        [ [ "b", 1 ], 200 ],
        [ [ "c", 'h', 0, 0, 0 ], 300 ],
        [ [ "c", 'h', 0, 0, 1 ], 400 ],
        [ [ "c", 'h', 0, 1, 'i' ], 500 ],
        [ [ "d" ], [] ],
        [ [ "e" ], {} ],
        [ [ "f" ], null ],
        [ [ "g" ], [ 100, 200, 300 ] ],
        [ [ "h", 0 ], [ 400, 4000, 40_000 ] ],
        [ [ "h", 1 ], [ 500, 5000, 50_000 ] ],
        [ [ "h", 2 ], [ 600, 6000, 60_000 ] ],
      ]),
      [
        [ [ "a", 0 ], wrap(null) ],
        [ [ "b", 0, 0 ], wrap(100) ],
        [ [ "b", 1 ], wrap(200) ],
        [ [ "c", 'h', 0, 0, 0 ], wrap(300) ],
        [ [ "c", 'h', 0, 0, 1 ], wrap(400) ],
        [ [ "c", 'h', 0, 1, 'i' ], wrap(500) ],
        [ [ "d" ], wrap([]) ],
        [ [ "e" ], wrap({}) ],
        [ [ "f" ], wrap(null) ],
        [ [ "g" ], wrap([ 100, 200, 300 ]) ],
        [ [ "h", 0 ], wrap([ 400, 4000, 40_000 ]) ],
        [ [ "h", 1 ], wrap([ 500, 5000, 50_000 ]) ],
        [ [ "h", 2 ], wrap([ 600, 6000, 60_000 ]) ],
      ]
    )
  })
})

/** 
 * ==========================
 *    PROPERTY-BASED TESTS
 * ==========================
 * 
 * Here, we're using 
 * [property testing](https://en.wikipedia.org/wiki/Property_testing)
 * to generate 1000s of inputs.
 * 
 * Since we don't have control over the inputs, we're forced to
 * write tests a bit differently, since it forces us to make assertions
 * that operate on various _properties_ of the system, rather than
 * testing that the program behaves in a particular way when fed a 
 * specific set of _examples_ that I happened to think of.
 * 
 * If you've heard of [fuzzing](https://en.wikipedia.org/wiki/Fuzzing)
 * before, you're on the right track -- property testing takes the best
 * parts of fuzz testing, and applies propositional logic to make it
 * more robust.
 * 
 * It looks a little weird and takes some practice to get used to, but
 * of all the techniques / patterns I've picked up over the years, this
 * one might be the most useful. Because of it, I write programs that 
 * are more testable.
 * 
 * Plus, humans are terrible at thinking of corner cases. And believe me,
 * *fast-check will find them*.
 * 
 * A lot of them. Like, _way more_ than you'd think.
 */

vi.describe("〖🧪〗 @traversable/core/tree", () => {
  test.prop([fc.needleInAHaystack()])(
    "〖🧪〗 tree.get", 
    ([haystack, path]) => 
      void vi.assert.isTrue(tree.get(haystack, ...path) === fc.needle)
  )

  test.prop([fc.needleInAHaystack()])(
    "〖🧪〗 tree.has", 
    ([haystack, path]) => (
      void vi.assert.isTrue(tree.has(...path as [])(haystack)),
      /** 
       * This can't ever be the case, since the generated haystack's
       * max depth is less than or equal to the path's length
       */
      void vi.assert.isFalse(tree.has(...path as [], path[0]!)(haystack))
    )
  )

  test.prop([
    fc.needleInAHaystack(),
    fc.dictionary(fc.identifier(), fc.jsonValue()),
  ])(
    "〖🧪〗 tree.set", 
    ([haystack, path], patch) => {
      // TODO: fix tree.set's types so you can remove these type assertions
      const modified: {} = tree.set(...path as [])(haystack)(patch) as never
      void vi.assert.deepEqual(
        tree.get(modified, ...path),
        patch,
      )
    }
  )

  const constraints = { 
    selector: head, 
    comparator: propsComparator,
  } satisfies fc.UniqueArrayConstraints<[string[], number], string[]>

  const named
    : fc.Arbitrary<readonly [readonly string[], number][]>
    = fc.uniqueArray(
      fc.tuple(fc.nonemptyPath, fc.nat()),
      constraints,
    )

  const positional 
    : fc.Arbitrary<readonly [readonly [number, ...string[]], number][]>
    = named.map(withIndex)

  const fromPaths = (paths: readonly [path: props.any, leaf: unknown][]) => tree.fromPaths(paths, { roundtrip: true })
  const toPaths = (json: { [x: string]: fromPaths.Leaf }) => tree.toPaths(json, { roundtrip: true })

  void Property.roundtrip({
    to: fromPaths,
    from: toPaths,
    arbitrary: named,
  })()

  void Property.roundtrip({
    arbitrary: positional,
    to: fromPaths,
    from: toPaths,
  })()

  vi.it("〖🧪〗 tree.toPaths", () =>
    fc.assert(
      fc.property(
        fc.dictionary(fc.identifier(), fc.jsonValue()),
        (json) => tree.toPaths(json)
          .forEach(([path]) => void vi.assert.isTrue(tree.has(...path)(json)))
      ),
    )
  )

  /** 
   * TODO: figure out how to make this roundtrip
   */
  vi.it.todo("〖🧪〗 tree.toPaths <-> tree.fromPaths", () => {
  })
})

/** 
 * ======================
 *    TYPE-LEVEL TESTS
 * ======================
 */
vi.describe("〖🧙〗 @traversable/core/tree", () => {
    vi.it("〖🧙〗 tree.get", () => {
      type input_01 = typeof input_01
      const input_01 = { 
        a: { 
          ...Math.random() > 0.5 &&
          ({
          b: { 
            ...Math.random() > 0.5 &&
            ({
            c: { 
              ...Math.random() > 0.5 &&
              ({
                ...Math.random() > 0.5 &&
                ({ 
                  d: { 
                  ...Math.random() > 0.5 && 
                  ({ e: [ { f: { g: 1, h: 2 }, i: 3 }, [6] ] as const }),
                  j: 7 
                }, 
                }),
              }),
              k: 8 
            }, 
            }),
          }, 
          }),
          l: 10 
        }, 
        m: {
          ...Math.random() > 0.5 && ({ n: 11 }),
          o: {
            p: [
              100,
              200,
              300,
              { q: { r: [ 0, { s: 12, t: { u: [13, { v: 14 }] } } ] as const, w: 15 }, x: 16 },
            ],
            y: 17,
          },
          z: 18,
        }
      } as const
  
      vi.assertType<readonly [13, { v: 14 }]>
        (tree.get(input_01, "m", "o", "p", 3, "q", "r", 1, "t", "u"))
  
      vi.assertType<undefined | 1>
        (tree.get(input_01, "a", "b", "c", "d", "e", 0, "f", "g"))
  
      vi.assertType<undefined | { g: 1, h: 2 }>
        (tree.get(input_01, "a", "b", "c", "d", "e", 0, "f"))
  
      vi.assertType<undefined | { f: { g: 1, h: 2 }, i: 3 }>
        (tree.get(input_01, "a", "b", "c", "d", "e", 0))
  
      vi.assertType<undefined | readonly [{ f: { g: 1, h: 2 }, i: 3 }, readonly [6]]>
        (tree.get(input_01, "a", "b", "c", "d", "e"))
  
      vi.assertType<
        | { e?: readonly [{ f: { g: 1, h: 2 }, i: 3 }, readonly [6]], j: number }
        | undefined
      >(tree.get(input_01, "a", "b", "c", "d"))
  
      vi.assertType<
        undefined | 
        { 
          k: number
            d?: {
              e?: readonly [
                { f: { g: 1, h: 2 }, i: 3 },
                readonly [6]
              ]
              j: number
            }
          }
        >(tree.get(input_01, "a", "b", "c"))
      
      vi.assertType<
        undefined | 
        { 
          c?: {
            k: number 
            d?: { e?: readonly [ { f: { g: 1, h: 2 }, i: 3 }, readonly [6] ], j: number }
          }
        }
      >(tree.get(input_01, "a", "b"))
  
      vi.assertType<
        undefined |
        { 
          l: number 
          b?: { 
            c?: { 
              k: number 
              d?: { j: number, e?: readonly [ { f: { g: 1, h: 2 }, i: 3 }, readonly [6] ] }
            }
          }
        }
      >(tree.get(input_01, "a"))
    })
})
