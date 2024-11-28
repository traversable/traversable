import { fc, test } from "@fast-check/vitest"
import * as vi from "vitest"

import { fn, object, type props } from "@traversable/data"
import { URI, symbol } from "@traversable/registry"

const PATTERN = {
  identifier: /^[a-z$_][a-z$_0-9]*$/,
} as const

//////////////
/// UTILS
export const xor = (left: boolean, right: boolean) => (left && !right) || (right && !left)
export const head
  : <T extends unknown[]>(xs: T) => T[0]
  = (xs) => xs[0]
export const propsComparator = (l: props.any, r: props.any) => {
  for (let ix = 0, len = globalThis.Math.min(l.length, r.length); ix < len; ix++)
    if (l[ix] === r[ix]) return true
    return false
}
export const withIndex = <K, V>(xss: [K[], V][]): [[number, ...K[]], V][] => 
  xss.map(([path, leaf], ix) => [[ix, ...path], leaf])

/// UTILS
//////////////

//////////////////
/// ARBITRARIES
export const nonemptyPath = fc.array(identifier(), { minLength: 1 })

export function identifier(constraints?: fc.StringMatchingConstraints): fc.Arbitrary<string>
export function identifier(constraints?: fc.StringMatchingConstraints) {
  return fc.stringMatching(PATTERN.identifier, constraints)
}

function keyOf<T extends object.any>(object: T): fc.Arbitrary<keyof T | undefined>
function keyOf<T extends object.any>(object: T) { 
  const keys = globalThis.Object.keys(object)
  return fc.constantFrom(...(keys.length === 0 ? [undefined] : keys))
}

function keysOf<T extends object.any>(object: T, constraints?: keysOf.Constraints): fc.Arbitrary<(keyof T)[]>
function keysOf<T extends object.any>(object: T, constraints: keysOf.Constraints = keysOf.defaults) { 
  return fc.array(keyOf(object), constraints)
}
namespace keysOf {
  export interface Constraints extends fc.ArrayConstraints {}
  export const defaults = { maxLength: 10 } satisfies keysOf.Constraints
}

function entry<T>(arbitrary: fc.Arbitrary<T>): fc.Arbitrary<[string, T]> { 
  return fc.tuple(identifier(), arbitrary) 
}

function entries<T>(arbitrary: fc.Arbitrary<T>, constraints?: entries.Constraints): fc.Arbitrary<[string, T][]>
function entries<T>(arbitrary: fc.Arbitrary<T>, constraints: entries.Constraints = entries.defaults) { 
  return fc.array(entry(arbitrary), constraints)
}
 
namespace entries {
  export interface Constraints extends fc.ArrayConstraints {}
  export const defaults = {} satisfies entries.Constraints
}

export function dictionaryKeysTuple<T>(arbitrary: fc.Arbitrary<T>, constraints?: keysOf.Constraints): fc.Arbitrary<[Record<string, fc.JsonValue>, string[]]> {
  return entries(arbitrary, constraints).map(Object.fromEntries).map((d) => [d, globalThis.Object.keys(d)])
}


export function arrayEntries<T>(arbitrary: fc.Arbitrary<T>, constraints?: arrayEntries.Constraints): fc.Arbitrary<[index: number, element: T]>
export function arrayEntries<T>(arbitrary: fc.Arbitrary<T>, constraints: arrayEntries.Constraints = arrayEntries.defaults) {
  return fc.array(arbitrary, constraints).map((xs) => xs.map((x, ix) => [ix, xs] as const))
}

export namespace arrayEntries {
  export interface Constraints extends fc.ArrayConstraints {}
  export const defaults = {} satisfies arrayEntries.Constraints
}

export function arrayPath<T>(arbitrary: fc.Arbitrary<T>, constraints?: arrayEntries.Constraints): fc.Arbitrary<[index: number, ...element: T[]]>
export function arrayPath<T>(arbitrary: fc.Arbitrary<T>, constraints: arrayEntries.Constraints = arrayEntries.defaults) {
  return fc.array(arbitrary, constraints).map((xs) => xs.map((x, ix) => [ix, ...xs] as const))
}
/// ARBITRARIES
//////////////////



vi.describe(`️〖️⛳️️〗‹‹‹ @traversable/data/object`, () => {
  vi.test(
    `〖️⛳️〗‹ ❲object.omit❳`, 
    () => {
      fc.assert(
        fc.property(
          dictionaryKeysTuple(fc.jsonValue(), { maxLength: 10 }), 
          ([d, ks]) => {
            const omit_01 = object.omit(d, ...ks)
            const pick_01 = object.pick(d, ...ks)
            void ks.forEach((k) => vi.assert.isFalse(k in omit_01))
            void ks.forEach((k) => vi.assert.isTrue(k in pick_01))
            void ks.forEach((k) => vi.assert.isTrue(xor(k in omit_01, k in pick_01)))
          }
        ),
      )
    }
  )
})

vi.describe(`〖️🚑〗‹‹‹ @traversable/data/object`, () => {
  vi.it(`〖️🚑〗‹ ❲object.filterKeys.defer❳`, () => {
    const hasLessThanNChars = (maxLength: number) => (s: string) => s.length < maxLength

    const startsWith = <P extends string>(prefix: P) => 
      (s: string): s is `${P}${string}` => s.startsWith(prefix)

    vi.assert.deepStrictEqual(
      object.filterKeys(
        { searchSlice1: "one", searchSlice2: "two", other1: "three", other2: "four" }, 
        startsWith("search")
      ), 
      { searchSlice1: "one", searchSlice2: "two" }
    )

    vi.assert.deepStrictEqual(
      fn.pipe(
        { searchSlice1: "one", searchSlice2: "two", other1: "three", other2: "four" },
        object.filterKeys.defer(startsWith("search")),
      ),
      { searchSlice1: "one", searchSlice2: "two" }
    )

    vi.assertType<{
      searchSlice1: "one",
      searchSlice2: "two",
    }>(
      fn.pipe(
        { searchSlice1: "one", searchSlice2: "two", other1: "three", other2: "four" } as const,
        object.filterKeys.defer(startsWith("search")),
      )
    )

    vi.assert.deepStrictEqual(
      object.filterKeys(
        { searchSlice1: "one", searchSlice2: "two", other1: "three", other2: "four" }, 
        hasLessThanNChars(10),
      ),
      { other1: "three", other2: "four" }
    )

    vi.assert.deepStrictEqual(
      object.filterKeys(
        { searchSlice1: "one", searchSlice2: "two", other1: "three", other2: "four" },
        hasLessThanNChars(10)
      ),
      { other1: "three", other2: "four" }
    )

    vi.assertType<{
      searchSlice1?: "one"
      searchSlice2?: "two"
      other1?: "three"
      other2?: "four"
    }>(
      fn.pipe(
        { searchSlice1: "one", searchSlice2: "two", other1: "three", other2: "four" },
        object.filterKeys.defer(hasLessThanNChars(10)),
      )
    )
  })

  vi.it(`〖️🚑〗‹ ❲object.filter❳`, () => {
    const isString = (u: unknown): u is string => typeof u === "string"
    const isStringOrNumber = (u: unknown): u is string | number =>
      typeof u === "string" || typeof u === "number"
    const containsAHyphen = (s: undefined | null | boolean | number | bigint | string): s is `${string}-${string}` =>
      `${s}`.includes("-")

    const stringOrNumber = (x: string | number): string | number => x
    const abc = stringOrNumber("abc")
    const zero = stringOrNumber(0)

    const strings = object.let({ abc: "one", def: "two", ghi: "three" })
    const input_1 = object.let({
      abc: 123,
      def: "hey-jude",
      ghi: Math.random() > 0.5 ? ("" as string) : 123,
      jkl: "-" as string,
    })

    vi.assert.deepStrictEqual(object.filter(strings, containsAHyphen), {})
    vi.expectTypeOf(object.filter(strings, containsAHyphen)).toEqualTypeOf<{}>

    vi.assert.deepStrictEqual(object.filter(input_1, containsAHyphen), { def: "hey-jude", jkl: "-" })
    vi.expectTypeOf(object.filter(input_1, containsAHyphen)).toEqualTypeOf<{
      def: "hey-jude"
      ghi?: `${string}-${string}`
      jkl?: `${string}-${string}`
    }>

    vi.assert.deepStrictEqual(object.filter(input_1, isStringOrNumber), input_1)
    vi.expectTypeOf(object.filter(input_1, isStringOrNumber)).toEqualTypeOf<{
      abc: 123
      def: "hey-jude"
      ghi: string | 123
      jkl: string
    }>

    const input_2 = object.let({ s1: abc, n1: zero, s2: "definitely a string", n2: 9000, b: false })

    vi.assert.deepStrictEqual(object.filter.defer(isString)(input_2), { s2: "definitely a string", s1: "abc" })

    vi.expectTypeOf(object.filter.defer(isString)(input_2)).toEqualTypeOf<{
      s1?: string
      n1?: string
      s2: "definitely a string"
    }>
  })

  vi.it(`〖️🚑〗‹ ❲object.omit❳: omits the thing`, () => {
    const input = object.let({
      abc: 123,
      def: 456,
      ghi: 789,
    })
    vi.assert.isTrue(globalThis.Object.is(object.omit.defer()(input), input))
  })

  vi.it(`〖️🚑〗‹ ❲object.omit❳: preserves reference when object is unchanged`, () => {
    const input = object.let({
      abc: 123,
      def: 456,
      ghi: 789,
    })
    vi.assert.deepEqual(object.omit.defer(`abc`, `ghi`)(input), { def: 456 })
    vi.assert.deepEqual(object.omit.defer(`abc`)(input), { def: 456, ghi: 789 })
    vi.assert.deepEqual(object.omit.defer(`abc`, `def`, `ghi`)(input), {})
  })

  vi.it(`〖️🚑〗‹ ❲object.snake❳`, () => {
    const input = object.const({
      //  ^?
      prop: 1,
      "123": 2,
      TenAnimalsISlamInANet: 3,
      IAmSam: 9,
      FBIVan: 4,
      XYZ: 5,
      "": 7,
    })

    const expected = object.let({
      prop: 1,
      123: 2,
      ten_animals_i_slam_in_a_net: 3,
      i_am_sam: 9,
      f_b_i_van: 4,
      x_y_z: 5,
      "": 7,
    })

    vi.expectTypeOf(object.snake(input)).toEqualTypeOf<typeof expected>()
  })

  vi.it(`〖️🚑〗‹ ❲object.camel❳`, () => {
    const input = {
      //  ^?
      prop: 1,
      "123": 2,
      "456": 3,
      ten_animals_i_slam_in_a_net: 4,
      fbi_van: 5,
      xyz: 6,
      "": 7,
    }
    const expected = object.let({
      //  ^?
      prop: 1,
      "123": 2,
      "456": 3,
      tenAnimalsISlamInANet: 4,
      fbiVan: 5,
      xyz: 6,
      "": 7,
    })
    const actual = object.camel(input)

    vi.assert.deepStrictEqual(actual, expected)
  })

    vi.it(`〖️🚑〗‹ ❲object.serialize❳: stringifies non-circular json values`, () => {
      vi.assert.equal( 
        object.serialize(
          { "a-": { b: { c: { d: 1, e: false, f: null, }, g: undefined, h: [ { i: "hey", j: "whaaaat" }, {}, ], }, } },
        ), `
{
  "a-": {
    b: {
      c: {
        d: 1,
        e: false,
        f: null
      },
      g: undefined,
      h: [
        {
          i: "hey",
          j: "whaaaat"
        },
        {}
      ]
    }
  }
}
  `.trim())
    })

    vi.it(`〖️🚑〗‹ ❲object.serialize❳: handles circular values`, () => {
      let output = {
        foo: true,
        bar: [[1, 2, 3]],
        baz: { foo: true },
        qaz: undefined as unknown,
      }
  
      output.qaz = [output]
  
      vi.expect(() => object.serialize(output)).not.toThrow()
      vi.assert.equal(
        object.serialize(output), 
        `
  {
  foo: true,
  bar: [
    [
      1,
      2,
      3
    ]
  ],
  baz: {
    foo: true
  },
  qaz: [
    [Circular object]
  ]
}
    `.trim()
      )
    })
  
    vi.it(`〖️🚑〗‹ ❲object.serialize❳: supports minification`, () => {
      vi.assert.equal(
        object.serialize({ "a-": { b: { c: { d: 1, e: false, f: null, }, g: undefined, h: [ { i: "hey", j: "whaaaat" }, {}, ], }, } }, { mode: "minify" }), 
        `{"a-":{b:{c:{d:1,e:false,f:null},g:undefined,h:[{i:"hey",j:"whaaaat"},{}]}}}`,
      )
    })

  vi.it(`〖️🚑〗‹ ❲object.titlecase.values❳`, () => {
    vi.assert.deepEqual(object.titlecase.values({}), {})
    vi.assert.deepEqual(object.titlecase.values({}, { delimiter: "-", separator: "-" }), {})
    vi.assert.deepEqual(
      object.titlecase.values({ hey: "jude", dont: "be-afraid" }),
      { hey: "Jude", dont: "Be-afraid" }
    )
    vi.assert.deepEqual(
      object.titlecase.values(
        { hey: "jude", dont: "be-afraid" }, 
        { delimiter: "-" }
      ),
      { hey: "Jude", dont: "Be Afraid" }
    )
    vi.assert.deepEqual(
      object.titlecase.values(
        { hey: "jude", dont: "be-afraid-take-a-sad-song" }, 
        { delimiter: "-", separator: "." }
      ),
      { hey: "Jude", dont: "Be.Afraid.Take.A.Sad.Song" }
    )

    vi.assert.deepEqual(
      object.capitalize.values(object.kebab.values({
        oneWay: "oneWay",
        roundTrip: "roundTrip",
        multiCity: "multiCity",
      })), {
        oneWay: "One-way",
        roundTrip: "Round-trip",
        multiCity: "Multi-city",
      }
    )
  })

  // test.prop([fc.dictionary(fc.string(), fc.jsonValue())], {})(`〖️🚑〗 object.flatten`, (record) => {
  //   // const ex_01 = { a: { b: { c: { d: [1] } } } }
  //   console.log(object.flatten({ a: { b: { c: [{ d: 1, e: 2, f: { g: [3, 4, 5], h: [7, { i: 9000 } ], j: [{ k: 10 }]}}]}}}))
  //   // object.flatten(ex_01)
  //   vi.assert.isTrue(object.flatten(object.flatten({ a: { b: { c: [{ d: 1, e: 2, f: { g: [3, 4, 5], h: [7, { i: 9000 } ], j: [{ k: 10 }]}}]}}})))
  // })

})
