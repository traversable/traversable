import { Format } from "@traversable/core"
import { object } from "@traversable/data"
import * as vi from "vitest"

vi.describe("〖️⛳️〗‹‹‹ ❲@traversable/algebra/Format❳", () => {
  vi.it("〖️⛳️〗› ❲Format.multiline❳", () => {
    vi.expect(Format.multiline(void 0)).toMatchInlineSnapshot(`" * undefined"`)
    vi.expect(Format.multiline(null)).toMatchInlineSnapshot(`" * null"`)
    vi.expect(Format.multiline(false)).toMatchInlineSnapshot(`" * false"`)
    vi.expect(Format.multiline(0)).toMatchInlineSnapshot(`" * 0"`)
    vi.expect(Format.multiline(0.01)).toMatchInlineSnapshot(`" * 0.01"`)
    vi.expect(Format.multiline('')).toMatchInlineSnapshot(`" * """`)
    vi.expect(Format.multiline([])).toMatchInlineSnapshot(`" * []"`)
    vi.expect(Format.multiline({})).toMatchInlineSnapshot(`" * {}"`)
    vi.expect(Format.multiline([0])).toMatchInlineSnapshot(`" * [ 0 ]"`)
    vi.expect(Format.multiline({ 0: 0 })).toMatchInlineSnapshot(`" * { "0": 0 }"`)
    vi.expect(Format.multiline([[1], [2]])).toMatchInlineSnapshot(`" * [ [ 1 ], [ 2 ] ]"`)
    vi.expect(Format.multiline({ a: 1 })).toMatchInlineSnapshot(`" * { a: 1 }"`)
    vi
      .expect(Format.multiline([1, [2, [3]]]))
      .toMatchInlineSnapshot(`" * [ 1, [ 2, [ 3 ] ] ]"`)
    vi
      .expect(Format.multiline([1, [2, [3]]], { indent: 1, leftOffset: 2, bracketsSeparator: '' }))
      .toMatchInlineSnapshot(`"   * [1, [2, [3]]]"`)
    vi
      .expect(Format.multiline([1, [2, [3]]], { indent: 6, leftOffset: 4, rightOffset: 2 }))
      .toMatchInlineSnapshot(`"     *   [ 1, [ 2, [ 3 ] ] ]"`)
    vi
      .expect(Format.multiline([[1], [[2, 2]], [[[3, 3, 3]]]]))
      .toMatchInlineSnapshot(`" * [ [ 1 ], [ [ 2, 2 ] ], [ [ [ 3, 3, 3 ] ] ] ]"`)
    vi
      .expect(Format.multiline([[1], [[2, 2]], [[[3, 3, 3]]]], { leftOffset: 4 }))
      .toMatchInlineSnapshot(`"     * [ [ 1 ], [ [ 2, 2 ] ], [ [ [ 3, 3, 3 ] ] ] ]"`)
    vi
      .expect(Format.multiline([[1], [[2, 2]], [[[3, 3, 3]]]], { rightOffset: 4 }))
      .toMatchInlineSnapshot(`" *     [ [ 1 ], [ [ 2, 2 ] ], [ [ [ 3, 3, 3 ] ] ] ]"`)
    vi
      .expect(Format.multiline([[1], [[2, 2]], [[[3, 3, 3]]]], { leftOffset: 2, rightOffset: 4 }))
      .toMatchInlineSnapshot(`"   *     [ [ 1 ], [ [ 2, 2 ] ], [ [ [ 3, 3, 3 ] ] ] ]"`)
    vi
      .expect(Format.multiline({ a: 1, b: [{}, { c: { d: 2 }, e: 3 }], f: 4 }))
      .toMatchInlineSnapshot(`" * { a: 1, b: [ {}, { c: { d: 2 }, e: 3 } ], f: 4 }"`)
    vi
      .expect(Format.multiline({ a: 1, b: [{}, { c: { d: 2 }, e: 3 }], f: 4 }, { leftOffset: 2 }))
      .toMatchInlineSnapshot(`"   * { a: 1, b: [ {}, { c: { d: 2 }, e: 3 } ], f: 4 }"`)
    vi
      .expect(Format.multiline({ a: 1, b: [{}, { c: { d: 2 }, e: 3 }], f: 4 }, { rightOffset: 2 }))
      .toMatchInlineSnapshot(`" *   { a: 1, b: [ {}, { c: { d: 2 }, e: 3 } ], f: 4 }"`)
    vi
      .expect(Format.multiline({ a: 1, b: [{}, { c: { d: 2 }, e: 3 }], f: 4 }, { rightOffset: 4, leftOffset: 2 }))
      .toMatchInlineSnapshot(`"   *     { a: 1, b: [ {}, { c: { d: 2 }, e: 3 } ], f: 4 }"`)

    vi
      .expect(
        Format.multiline(
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
        Format.multiline(
          { a: 1, b: [{}, { c: { d: 2 }, e: 3 }], f: 4 }, 
          { 
            maxWidth: 40, 
            indent: 1, 
            wrapWith: ["/**\n * @example\n", "\n */"], 
            bracesSeparator: '  '
          }
        )
      )
      .toMatchInlineSnapshot(`
        "/**
         * @example
         * {
         *  a: 1,
         *  b: [ {}, {  c: {  d: 2  }, e: 3  } ],
         *  f: 4
         * }
         */"
      `)

    vi
      .expect(
        Format.multiline(
          { a: 1, b: [{}, { c: { d: 2 }, e: 3 }], f: 4 }, { 
            indent: -1, 
            maxWidth: 10, 
            leftOffset: 0,
            bracesSeparator: '',
            keyValueSeparator: '',
          },
        )
      )
      .toMatchInlineSnapshot(`
        " * {
         * a:1,
         * b:[
         * {},
         * {
         * c:{d:2},
         * e:3
         * }
         * ],
         * f:4
         * }"
      `)

    vi.expect(Format.multiline( { DEF: { GHI: { JKL: 456 } } }, { indent: 2, whitespaceUnit: "\t" }))
    .toMatchInlineSnapshot(`" * { DEF: { GHI: { JKL: 456 } } }"`)
  })

})
