import { Format, Json, show } from "@traversable/core"
import { object } from "@traversable/data"
import * as vi from "vitest"

vi.describe("〖️⛳️〗‹‹‹ ❲@traversable/algebra/Format❳", () => {
  vi.it("〖️⛳️〗› ❲Format.multiline❳", () => {
    vi.expect(Format.multiline(undefined, { leftGutter: ' * ' })).toMatchInlineSnapshot(`" * undefined"`)
    vi.expect(Format.multiline(null, { leftGutter: ' * ' })).toMatchInlineSnapshot(`" * null"`)
    vi.expect(Format.multiline(false, { leftGutter: ' * ' })).toMatchInlineSnapshot(`" * false"`)
    vi.expect(Format.multiline(0, { leftGutter: ' * ' })).toMatchInlineSnapshot(`" * 0"`)
    vi.expect(Format.multiline(0.01, { leftGutter: ' * ' })).toMatchInlineSnapshot(`" * 0.01"`)
    vi.expect(Format.multiline('', { leftGutter: ' * ' })).toMatchInlineSnapshot(`" * """`)
    vi.expect(Format.multiline([], { leftGutter: ' * ' })).toMatchInlineSnapshot(`" * []"`)
    vi.expect(Format.multiline({}, { leftGutter: ' * ' })).toMatchInlineSnapshot(`" * {}"`)
    vi.expect(Format.multiline([0], { leftGutter: ' * ' })).toMatchInlineSnapshot(`" * [ 0 ]"`)
    vi.expect(Format.multiline({ 0: 0 }, { leftGutter: ' * ' })).toMatchInlineSnapshot(`" * { "0": 0 }"`)
    vi.expect(Format.multiline([[1], [2]], { leftGutter: ' * ' })).toMatchInlineSnapshot(`" * [ [ 1 ], [ 2 ] ]"`)
    vi.expect(Format.multiline({ a: 1 }, { leftGutter: ' * ' })).toMatchInlineSnapshot(`" * { a: 1 }"`)
    vi
      .expect(Format.multiline([1, [2, [3]]]))
      .toMatchInlineSnapshot(`"[ 1, [ 2, [ 3 ] ] ]"`)
    vi
      .expect(Format.multiline([1, [2, [3]]], { indent: 1, leftMargin: 2, bracketsSeparator: '' }))
      .toMatchInlineSnapshot(`"  [1, [2, [3]]]"`)
    vi
      .expect(Format.multiline([1, [2, [3]]], { indent: 6, leftMargin: 4, leftPadding: 2, leftGutter: ' * ' }))
      .toMatchInlineSnapshot(`"     *   [ 1, [ 2, [ 3 ] ] ]"`)
    vi
      .expect(Format.multiline([[1], [[2, 2]], [[[3, 3, 3]]]], { leftGutter: ' * ' }))
      .toMatchInlineSnapshot(`" * [ [ 1 ], [ [ 2, 2 ] ], [ [ [ 3, 3, 3 ] ] ] ]"`)
    vi
      .expect(Format.multiline([[1], [[2, 2]], [[[3, 3, 3]]]], { leftMargin: 4, leftGutter: ' * ' }))
      .toMatchInlineSnapshot(`"     * [ [ 1 ], [ [ 2, 2 ] ], [ [ [ 3, 3, 3 ] ] ] ]"`)
    vi
      .expect(Format.multiline([[1], [[2, 2]], [[[3, 3, 3]]]], { leftPadding: 4, leftGutter: ' * ' }))
      .toMatchInlineSnapshot(`" *     [ [ 1 ], [ [ 2, 2 ] ], [ [ [ 3, 3, 3 ] ] ] ]"`)
    vi
      .expect(Format.multiline([[1], [[2, 2]], [[[3, 3, 3]]]], { leftMargin: 2, leftPadding: 4, leftGutter: ' * ' }))
      .toMatchInlineSnapshot(`"   *     [ [ 1 ], [ [ 2, 2 ] ], [ [ [ 3, 3, 3 ] ] ] ]"`)
    vi
      .expect(Format.multiline({ a: 1, b: [{}, { c: { d: 2 }, e: 3 }], f: 4 }, { leftGutter: ' * ' }))
      .toMatchInlineSnapshot(`" * { a: 1, b: [ {}, { c: { d: 2 }, e: 3 } ], f: 4 }"`)
    vi
      .expect(Format.multiline({ a: 1, b: [{}, { c: { d: 2 }, e: 3 }], f: 4 }, { leftMargin: 2, leftGutter: ' * ' }))
      .toMatchInlineSnapshot(`"   * { a: 1, b: [ {}, { c: { d: 2 }, e: 3 } ], f: 4 }"`)
    vi
      .expect(Format.multiline({ a: 1, b: [{}, { c: { d: 2 }, e: 3 }], f: 4 }, { leftPadding: 2, leftGutter: ' * ' }))
      .toMatchInlineSnapshot(`" *   { a: 1, b: [ {}, { c: { d: 2 }, e: 3 } ], f: 4 }"`)
    vi
      .expect(Format.multiline({ a: 1, b: [{}, { c: { d: 2 }, e: 3 }], f: 4 }, { leftPadding: 4, leftMargin: 2, leftGutter: ' * ' }))
      .toMatchInlineSnapshot(`"   *     { a: 1, b: [ {}, { c: { d: 2 }, e: 3 } ], f: 4 }"`)

    vi
      .expect(
        Format.multiline(
          { a: 1, b: [{}, { c: { d: 2 }, e: 3 }], f: 4 }, 
          { wrapWith: ["/**\n * @example\n", "\n */"], leftMargin: 0, leftGutter: ' * ' }
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
        show.serialize({ a: 1, b: [{}, { c: { d: 2 }, e: 3 }], f: 4 }, "readable"),
        Format.multiline( //   { a: 1, b: [{}, { c: { d: 2 }, e: 3 }], f: 4 }, 
          { 
            maxWidth: 20, 
            indent: 2, 
            whitespaceUnit: '_',
          }
        )
      )
      .toMatchInlineSnapshot(`
        "{
          a: 1,
          b: [
            {},
            {
              c: {
                d: 2
              },
              e: 3
            }
          ],
          f: 4
        }"
      `)

    vi
      .expect(
        Format.multiline(
          { a: 1, b: [{}, { c: { d: 2 }, e: 3 }], f: 4 }, { 
            indent: 4, 
            maxWidth: 20, 
            leftMargin: 0,
            leftGutter: ' * ',
            leftPadding: 0,
            bracesSeparator: '',
            bracketsSeparator: '',
            keyValueSeparator: '',
          },
        )
      )
      .toMatchInlineSnapshot(`
        " * {
         *     a:1,
         *     b:[
         *         {},
         *         {
         *             c:{
         *                 d:2
         *             },
         *             e:3
         *         }
         *     ],
         *     f:4
         * }"
      `)

    vi.expect(Format.multiline( { DEF: { GHI: { JKL: 456 } } }, { indent: 2, leftGutter: ' * ', whitespaceUnit: "\t" }))
    .toMatchInlineSnapshot(`" * { DEF: { GHI: { JKL: 456 } } }"`)
  })

})
