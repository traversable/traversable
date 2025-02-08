import { show, Format, Json } from "@traversable/core"
import { object } from "@traversable/data"
import * as vi from "vitest"

vi.describe("〖️⛳️〗‹‹‹ ❲@traversable/algebra/Format❳", () => {
  const multilineCommentOptions = {
    leftGutter: ' * ',
    wrapWith: [' * ', ''],
  } satisfies Format.Options
  const multilineComment = (json: Json.any) => Format.multiline(json, multilineCommentOptions)
  vi.it("〖️⛳️〗› ❲Format.multiline❳", () => {
    vi.expect(multilineComment(void 0)).toMatchInlineSnapshot(`" * undefined"`)
    vi.expect(multilineComment(null)).toMatchInlineSnapshot(`" * null"`)
    vi.expect(multilineComment(false)).toMatchInlineSnapshot(`" * false"`)
    vi.expect(multilineComment(0)).toMatchInlineSnapshot(`" * 0"`)
    vi.expect(multilineComment(0.01)).toMatchInlineSnapshot(`" * 0.01"`)
    vi.expect(multilineComment('')).toMatchInlineSnapshot(`" * """`)
    vi.expect(multilineComment([])).toMatchInlineSnapshot(`" * []"`)
    vi.expect(multilineComment({})).toMatchInlineSnapshot(`" * {}"`)
    vi.expect(multilineComment([0])).toMatchInlineSnapshot(`" * [ 0 ]"`)
    vi.expect(multilineComment({ 0: 0 })).toMatchInlineSnapshot(`" * { "0": 0 }"`)
    vi.expect(multilineComment([[1], [2]])).toMatchInlineSnapshot(`" * [ [ 1 ], [ 2 ] ]"`)
    vi.expect(multilineComment({ a: 1 })).toMatchInlineSnapshot(`" * { a: 1 }"`)
    vi
      .expect(multilineComment([1, [2, [3]]]))
      .toMatchInlineSnapshot(`" * [ 1, [ 2, [ 3 ] ] ]"`)
    // vi
    //   .expect(Format.multiline([1, [2, [3]]], { ...multilineCommentOptions, indent: 1, leftMargin: 2, bracketsSeparator: '' }))
    //   .toMatchInlineSnapshot(`"   * [1, [2, [3]]]"`)
    // vi
    //   .expect(multilineComment([1, [2, [3]]], { indent: 6, leftMargin: 4, leftPadding: 2 }))
    //   .toMatchInlineSnapshot(`"     *   [ 1, [ 2, [ 3 ] ] ]"`)
    // vi
    //   .expect(multilineComment([[1], [[2, 2]], [[[3, 3, 3]]]]))
    //   .toMatchInlineSnapshot(`" * [ [ 1 ], [ [ 2, 2 ] ], [ [ [ 3, 3, 3 ] ] ] ]"`)
    // vi
    //   .expect(multilineComment([[1], [[2, 2]], [[[3, 3, 3]]]], { leftMargin: 4 }))
    //   .toMatchInlineSnapshot(`"     * [ [ 1 ], [ [ 2, 2 ] ], [ [ [ 3, 3, 3 ] ] ] ]"`)
    // vi
    //   .expect(multilineComment([[1], [[2, 2]], [[[3, 3, 3]]]], { leftPadding: 4 }))
    //   .toMatchInlineSnapshot(`" *     [ [ 1 ], [ [ 2, 2 ] ], [ [ [ 3, 3, 3 ] ] ] ]"`)
    // vi
    //   .expect(multilineComment([[1], [[2, 2]], [[[3, 3, 3]]]], { leftMargin: 2, leftPadding: 4 }))
    //   .toMatchInlineSnapshot(`"   *     [ [ 1 ], [ [ 2, 2 ] ], [ [ [ 3, 3, 3 ] ] ] ]"`)
    // vi
    //   .expect(multilineComment({ a: 1, b: [{}, { c: { d: 2 }, e: 3 }], f: 4 }))
    //   .toMatchInlineSnapshot(`" * { a: 1, b: [ {}, { c: { d: 2 }, e: 3 } ], f: 4 }"`)
    // vi
    //   .expect(multilineComment({ a: 1, b: [{}, { c: { d: 2 }, e: 3 }], f: 4 }, { leftMargin: 2 }))
    //   .toMatchInlineSnapshot(`"   * { a: 1, b: [ {}, { c: { d: 2 }, e: 3 } ], f: 4 }"`)
    // vi
    //   .expect(multilineComment({ a: 1, b: [{}, { c: { d: 2 }, e: 3 }], f: 4 }, { leftPadding: 2 }))
    //   .toMatchInlineSnapshot(`" *   { a: 1, b: [ {}, { c: { d: 2 }, e: 3 } ], f: 4 }"`)
    // vi
    //   .expect(multilineComment({ a: 1, b: [{}, { c: { d: 2 }, e: 3 }], f: 4 }, { leftPadding: 4, leftMargin: 2 }))
    //   .toMatchInlineSnapshot(`"   *     { a: 1, b: [ {}, { c: { d: 2 }, e: 3 } ], f: 4 }"`)

    // vi
    //   .expect(
    //     Format.multiline(
    //       { a: 1, b: [{}, { c: { d: 2 }, e: 3 }], f: 4 }, 
    //       { ...multilineCommentOptions, wrapWith: ["/**\n * @example\n", "\n */"], leftMargin: 0 }
    //     )
    //   )
    //   .toMatchInlineSnapshot(`
    //     "/**
    //      * @example
    //      * { a: 1, b: [ {}, { c: { d: 2 }, e: 3 } ], f: 4 }
    //      */"
    //   `)

    vi
      .expect(
        show.serialize({ a: 1, b: [{}, { c: { d: 2 }, e: 3 }], f: 4 }, "readable"),
        // Format.multiline(
        //   { a: 1, b: [{}, { c: { d: 2 }, e: 3 }], f: 4 }, 
        //   { 
        //     maxWidth: 20, 
        //     // leftGutter: ' * ',
        //     indent: 2, 
        //     whitespaceUnit: ' ',
        //     // wrapWith: ["/**\n * @example\n", "\n */"], 
        //     bracesSeparator: '  '
        //   }
        // )
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
            indent: -1, 
            maxWidth: 10, 
            leftMargin: 0,
            bracesSeparator: '',
            keyValueSeparator: '',
          },
        )
      )
      .toMatchInlineSnapshot(`
        "{
        a:1,
        b:[
        {},
        {
        c:{d:2},
        e:3
        }
        ],
        f:4
        }"
      `)

    vi.expect(Format.multiline( { DEF: { GHI: { JKL: 456 } } }, { indent: 2, whitespaceUnit: "\t" }))
    .toMatchInlineSnapshot(`"{ DEF: { GHI: { JKL: 456 } } }"`)
  })

})
