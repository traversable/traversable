import type { integer } from "@traversable/registry"
import * as vi from "vitest"

import { t, test } from "@traversable/core"
import { Arbitrary } from "./util.js"

vi.describe(`〖⛳️〗‹‹‹ ❲@traversable/core/ast❳`, () => {
  test.prop([Arbitrary.node], { endOnFailure: false })(
    `〖⛳️〗› ❲ast: constructors❳`, (node) => {
      // console.log("tagTree", tagTree)
      // console.log("astNode", node)
      // console.log("fromSeed(tagTree)", fromSeed(tagTree))
      // console.log("t.fromSeed(short)", show.serialize(t.fromSeed(short), "leuven"))
      // console.log("fromSeed(seed)", fromSeed(seed))
      vi.assert.isTrue(true)
    }
  )

  vi.it.only(`〖⛳️〗› ❲ast: constructors❳: isomorphism of constructors`, () => {
    const ex_01 = t.short({ a: "boolean", b: "number[]", c: "string{}" })
    const ex_02 = t.object({ a: t.boolean(), b: t.array(t.number()), c: t.record(t.string()) })
    vi.assert.deepEqual(ex_01._def.a._def, ex_02._def.a._def)
    vi.assert.equal(ex_01._def.a._tag, ex_02._def.a._tag)
    vi.assert.deepEqual(ex_01._def.b._def, ex_02._def.b._def)
    vi.assert.equal(ex_01._def.b._tag, ex_02._def.b._tag)
    vi.assert.deepEqual(ex_01._def.c._def, ex_02._def.c._def)
    vi.assert.equal(ex_01._def.c._tag, ex_02._def.c._tag)
    ///
    type Ex_01 = t.typeof<typeof ex_01>
    type Ex_02 = t.typeof<typeof ex_02>
    type Ex_03 = t.typeof<t.Schema<Ex_01>>
    type Ex_04 = t.typeof<t.Schema<Ex_02>>
    vi.assertType<Ex_01>(t.typeof(ex_01))
    vi.assertType<Ex_02>(t.typeof(ex_01))
    vi.assertType<Ex_03>(t.typeof(ex_02))
    vi.assertType<Ex_04>(t.typeof(ex_02))
  })
})

// vi.it(`〖⛳️〗› ❲ast: fromShorthand❳`, () => {
//   console.log("null", t.short(null)())
//   console.log("boolean", t.short("boolean")())
//   console.log("boolean[]", t.short("boolean[]")())
//   console.log("boolean{}", t.short("boolean{}")())
//   console.log("number", t.short("number")())
//   console.log("number[]", t.short("number[]")())
//   console.log("number{}", t.short("number{}")())
//   console.log("integer", t.short("integer")())
//   console.log("integer[]", t.short("integer[]")())
//   console.log("integer{}", t.short("integer{}")())
//   console.log("string", t.short("string")())
//   console.log("string[]", t.short("string[]")())
//   console.log("string{}", t.short("string{}")())
//   console.log("tuple", t.short(["number", "string", "boolean"])())
//   console.log("object", t.short({ a: "number", b: "string", c: "boolean" })())
//   console.log("object", t.short({ a: "number", b: "string", c: "boolean" })())
//   console.log("record", t.short("{}", "string")())
//   t.fromSeed()
// console.log("string[]", t.short("string[]")())
// console.log("string{}", t.short("string{}")())
// console.log("string", t.short("&", {})())
// console.log("string[]", t.short("string[]")())
// console.log("string{}", t.short("string{}")())
// })

vi.describe("〖🧙〗‹‹‹ ❲@traversable/core/ast❳", () => {
  vi.it("〖🧙〗› ❲ast.short❳", () => {
    vi.assertType<t.null>(t.short(null))
    // vi.assertType<t.const<"abc">>(t.short("'abc'"))
    vi.assertType<t.boolean>(t.short("boolean"))
    vi.assertType<t.symbol>(t.short("symbol"))
    vi.assertType<t.integer>(t.short("integer"))
    vi.assertType<t.number>(t.short("number"))
    vi.assertType<t.array<t.boolean>>(t.short("boolean[]"))
    vi.assertType<t.record<t.boolean>>(t.short("boolean{}"))
    vi.assertType<t.array<t.symbol>>(t.short("symbol[]"))
    vi.assertType<t.record<t.symbol>>(t.short("symbol{}"))
    vi.assertType<t.array<t.integer>>(t.short("integer[]"))
    vi.assertType<t.record<t.integer>>(t.short("integer{}"))
    vi.assertType<t.array<t.number>>(t.short("number[]"))
    vi.assertType<t.record<t.number>>(t.short("number{}"))
    vi.assertType<t.array<t.string>>(t.short("string[]"))
    vi.assertType<t.record<t.string>>(t.short("string{}"))
    vi.assertType(t.short("[]", null))
    vi.assertType(t.short("[]", null))
    vi.assertType(t.short("{}", null))
    vi.assertType(t.short(["boolean", "string", "number"]))
    vi.assertType(t.short(["boolean", "string", "number"]))

    vi.assertType
    <
      t.object<{
        a: t.array<t.boolean>,
        b: t.object<{
          c: t.tuple<[t.record<t.string>]>
        }>
      }>
    >
    (
      t.short({
        a: "boolean[]",
        b: {
          c: ["string{}"],
        },
      })
    )

    vi.assertType
    <
      t.allOf<[
        t.object<{ a: t.boolean }>,
        t.object<{ b: t.array<t.string> }>
      ]>
    >
    (
      t.short(
        "&",
        { a: "boolean" },
        { b: "string[]" },
      )
    )

    vi.assertType
    <
      t.anyOf<[
        t.object<{ a: t.string }>,
        t.object<{ b: t.null }>
      ]>
    >
    (
      t.short(
        "|",
        { a: "string" },
        { b: null },
      )
    )


    vi.assertType
    <
      t.array<
        t.object<{
          a: t.object<{
            b: t.array<t.string>
          }>
        }>
      >
    >
    (
      t.short(
        "[]",
        {
          a: {
            b: "string[]"
          }
        }
      )
    )

    vi.assertType
    <
      t.object<{
        b: t.optional<t.boolean>
        c: t.optional<t.object<{
          d: t.optional<t.array<t.number>>
        }>>
        a: t.number
      }>
    >(t.short({
        a: "number",
        "b?": "boolean",
        "c?": {
          "d?": "number[]"
        }
      })
    )

    vi.assertType<
      t.allOf<[
        t.object<{
        d: t.optional<t.allOf<[ t.object<{ x: t.optional<t.number> }>, t.object<{ y: t.optional<t.number> }>, t.object<{ z: t.optional<t.number> }> ]>>
        a: t.array<t.string>
        b: t.array<t.number>
        c: t.record<t.array<t.boolean>>
        e: 
          & t.anyOf<[
              t.object<{ xs: t.anyOf<[t.null, t.array<t.number>]> & { is: (u: unknown) => u is t.array<t.number> | t.null } }>
            , t.object<{ ys: t.anyOf<[t.null, t.array<t.number>]> & { is: (u: unknown) => u is t.array<t.number> | t.null } }>
            , t.object<{ zs: t.anyOf<[t.null, t.array<t.number>]> & { is: (u: unknown) => u is t.array<t.number> | t.null } }> 
          ]> 
          & { is: (u: unknown) => u is 
            | t.object<{ xs: t.anyOf<[t.null, t.array<t.number>]> & { is: (u: unknown) => u is t.array<t.number> | t.null } }> 
            | t.object<{ ys: t.anyOf<[t.null, t.array<t.number>]> & { is: (u: unknown) => u is t.array<t.number> | t.null } }> 
            | t.object<{ zs: t.anyOf<[t.null, t.array<t.number>]> & { is: (u: unknown) => u is t.array<t.number> | t.null } }> 
          }
        }>
      ]>
    >

    (t.short(
      "&",
      {
        a: "string[]",
        b: [ "[]", "number" ],
        c: [ "{}", "boolean[]" ],
        "d?": [ "&", { "x?": "number" }, { "y?": "number" }, { "z?": "number" } ],
        e: [ "|", { xs: ["|", null, "number[]"] }, { ys: ["|", null, "number[]"] }, { zs: ["|", null, "number[]"] } ],
      })

    )
  })

  vi.it("〖🧙〗› ❲ast.typeof❳", () => {
    vi.assertType<null>(t.typeof(t.short(null)))
    vi.assertType<"abc">(t.typeof(t.short("'abc'")))
    vi.assertType<boolean>(t.typeof(t.short("boolean")))
    vi.assertType<symbol>(t.typeof(t.short("symbol")))
    vi.assertType<integer>(t.typeof(t.short("integer")))
    vi.assertType<number>(t.typeof(t.short("number")))
    vi.assertType<string>(t.typeof(t.short("string")))
    vi.assertType<boolean[]>(t.typeof(t.short("boolean[]")))
    vi.assertType<symbol[]>(t.typeof(t.short("symbol[]")))
    vi.assertType<integer[]>(t.typeof(t.short("integer[]")))
    vi.assertType<number[]>(t.typeof(t.short("number[]")))
    vi.assertType<string[]>(t.typeof(t.short("string[]")))
    vi.assertType<Record<string, boolean>>(t.typeof(t.short("boolean{}")))
    vi.assertType<Record<string, symbol>>(t.typeof(t.short("symbol{}")))
    vi.assertType<Record<string, integer>>(t.typeof(t.short("integer{}")))
    vi.assertType<Record<string, number>>(t.typeof(t.short("number{}")))
    vi.assertType<Record<string, string>>(t.typeof(t.short("string{}")))
    vi.assertType<[boolean, string, number]>(t.typeof(t.short(["boolean", "string", "number"])))

    vi.assertType
    <
      {
        a: boolean[],
        b: {
          c: [Record<string, string>]
        }
      }
    >
    (t.typeof(t.short(
      {
        a: "boolean[]",
        b: {
          c: ["string{}"],
        }
      }))
    )

    vi.assertType
    <
      & { a: boolean }
      & { b: string[] }
    >
    (t.typeof(t.short(
      "&",
      { a: "boolean" },
      { b: "string[]" },
    )))

    vi.assertType
    <
      | { a: string }
      | { b: null }
    >
    (t.typeof(t.short(
      "|",
      { a: "string" },
      { b: null },
    )))

    vi.assertType<{ a: { b: string[] } }[]>(t.typeof(t.short("[]", { a: { b: "string[]" } })))

    vi.assertType
    <
      {
        a: number,
        b?: boolean,
        c?: {
          d?: number[]
        }
      }
    >
    (t.typeof(t.short(
      {
        a: "number",
        "b?": "boolean",
        "c?": {
          "d?": "number[]"
        }
      }
    )))

    vi.assertType
    <
      {
        a: string[]
        b: number[]
        c: Record<string, boolean[]>
        d?: 
          & { x?: number } 
          & { y?: number } 
          & { z?: number }
        e: 
          | { xs: null | number[] } 
          | { ys: null | number[] } 
          | { zs: null | number[] }
        f?: { g?: "hi" }
      }
    >
    (
      t.typeof(
        t.short(
          "&", 
          {
            a: "string[]",
            b: [ "[]", "number" ],
            c: [ "{}", "boolean[]" ],
            "d?": [ 
              "&", 
              { "x?": "number" }, 
              { "y?": "number" }, 
              { "z?": "number" }
            ],
            e: [
              "|", 
              { xs: ["|", null, "number[]"] }, 
              { ys: ["|", null, "number[]"] }, 
              { zs: ["|", null, "number[]"] }
            ],
            "f?": { "g?": "'hi'" }
          },
        )
      )
    )
  })
})
