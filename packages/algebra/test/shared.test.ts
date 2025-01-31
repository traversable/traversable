import * as vi from "vitest"
import { multiline } from "@traversable/algebra"

vi.describe("〖️⛳️〗‹‹‹ ❲@traversable/algebra/multiline❳", () => {
  vi.it("〖️⛳️〗› ❲multiline❳", () => {
    vi.expect(multiline(void 0)).toMatchInlineSnapshot(`" * undefined"`)
    vi.expect(multiline(null)).toMatchInlineSnapshot(`" * null"`)
    vi.expect(multiline(false)).toMatchInlineSnapshot(`" * false"`)
    vi.expect(multiline(0)).toMatchInlineSnapshot(`" * 0"`)
    vi.expect(multiline(0.01)).toMatchInlineSnapshot(`" * 0.01"`)
    vi.expect(multiline('')).toMatchInlineSnapshot(`" * """`)
    vi.expect(multiline([])).toMatchInlineSnapshot(`" * []"`)
    vi.expect(multiline({})).toMatchInlineSnapshot(`" * {}"`)
    vi.expect(multiline([0])).toMatchInlineSnapshot(`" * [ 0 ]"`)
    vi.expect(multiline({ 0: 0 })).toMatchInlineSnapshot(`" * { "0": 0 }"`)
    vi.expect(multiline([[1], [2]])).toMatchInlineSnapshot(`" * [ [ 1 ], [ 2 ] ]"`)
    vi.expect(multiline({ a: 1 })).toMatchInlineSnapshot(`" * { a: 1 }"`)
    vi
      .expect(multiline([1, [2, [3]]], { indent: 4 }))
      .toMatchInlineSnapshot(`" * [ 1, [ 2, [ 3 ] ] ]"`)
    vi
      .expect(multiline([1, [2, [3]]], { indent: 4, leftOffset: 8 }))
      .toMatchInlineSnapshot(`"         * [ 1, [ 2, [ 3 ] ] ]"`)
    vi
      .expect(multiline([1, [2, [3]]], { indent: 6, leftOffset: 4, rightOffset: 2 }))
      .toMatchInlineSnapshot(`"     *   [ 1, [ 2, [ 3 ] ] ]"`)
    vi
      .expect(multiline([[1], [[2, 2]], [[[3, 3, 3]]]]))
      .toMatchInlineSnapshot(`" * [ [ 1 ], [ [ 2, 2 ] ], [ [ [ 3, 3, 3 ] ] ] ]"`)
    vi
      .expect(multiline([[1], [[2, 2]], [[[3, 3, 3]]]], { leftOffset: 4 }))
      .toMatchInlineSnapshot(`"     * [ [ 1 ], [ [ 2, 2 ] ], [ [ [ 3, 3, 3 ] ] ] ]"`)
    vi
      .expect(multiline([[1], [[2, 2]], [[[3, 3, 3]]]], { rightOffset: 4 }))
      .toMatchInlineSnapshot(`" *     [ [ 1 ], [ [ 2, 2 ] ], [ [ [ 3, 3, 3 ] ] ] ]"`)
    vi
      .expect(multiline([[1], [[2, 2]], [[[3, 3, 3]]]], { leftOffset: 2, rightOffset: 4 }))
      .toMatchInlineSnapshot(`"   *     [ [ 1 ], [ [ 2, 2 ] ], [ [ [ 3, 3, 3 ] ] ] ]"`)
    vi
      .expect(multiline({ a: 1, b: [{}, { c: { d: 2 }, e: 3 }], f: 4 }))
      .toMatchInlineSnapshot(`" * { a: 1, b: [ {}, { c: { d: 2 }, e: 3 } ], f: 4 }"`)
    vi
      .expect(multiline({ a: 1, b: [{}, { c: { d: 2 }, e: 3 }], f: 4 }, { leftOffset: 2 }))
      .toMatchInlineSnapshot(`"   * { a: 1, b: [ {}, { c: { d: 2 }, e: 3 } ], f: 4 }"`)
    vi
      .expect(multiline({ a: 1, b: [{}, { c: { d: 2 }, e: 3 }], f: 4 }, { rightOffset: 2 }))
      .toMatchInlineSnapshot(`" *   { a: 1, b: [ {}, { c: { d: 2 }, e: 3 } ], f: 4 }"`)
    vi
      .expect(multiline({ a: 1, b: [{}, { c: { d: 2 }, e: 3 }], f: 4 }, { rightOffset: 4, leftOffset: 2 }))
      .toMatchInlineSnapshot(`"   *     { a: 1, b: [ {}, { c: { d: 2 }, e: 3 } ], f: 4 }"`)

    vi
      .expect(
        multiline(
          { a: 1, b: [{}, { c: { d: 2 }, e: 3 }], f: 4 }, 
          { wrapWith: ["/**\n * @example\n", "\n */"], leftOffset: 0 }
        )
      )
      .toMatchInlineSnapshot(`
        "/**
         * @example
         * { a: 1, b: [ {}, { c: { d: 2 }, e: 3 } ], f: 4 }
         */"
      `)

    vi
      .expect(
        multiline(
          { a: 1, b: [{}, { c: { d: 2 }, e: 3 }], f: 4 }, 
          { 
            maxWidth: 40, 
            indent: 2, 
            wrapWith: ["/**\n * @example\n", "\n */"], 
            leftOffset: 0,
            bracesSeparator: '  '
          }
        )
      )
      .toMatchInlineSnapshot(`
        "/**
         * @example
         * {
         *   a: 1,
         *   b: [ {}, {  c: {  d: 2  }, e: 3  } ],
         *   f: 4
         * }
         */"
      `)

    vi
      .expect(
        multiline(
          { a: 1, b: [{}, { c: { d: 2 }, e: 3 }], f: 4 }, 
          { indent: -1, maxWidth: 10, wrapWith: ["/**\n * @example\n", "\n */"], leftOffset: 0 },
        )
      )
      .toMatchInlineSnapshot(`
        "/**
         * @example
         * {
         * a: 1,
         * b: [
         * {},
         * {
         * c: { d: 2 },
         * e: 3
         * }
         * ],
         * f: 4
         * }
         */"
      `)
  })
})
