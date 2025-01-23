import type { integer } from "@traversable/registry"
import * as vi from "vitest"

import { fc, t, test } from "@traversable/core"
import { Arbitrary } from "./util.js"

const arbitrary = Arbitrary.letrecShort().tree.map((_) => [_, t.fromSeed(_)] satisfies [any, any])

vi.describe(`〖⛳️〗‹‹‹ ❲@traversable/core/ast❳`, () => {
  test.prop([arbitrary], { 
    endOnFailure: false,
    numRuns: 10_000,
  })(
    `〖⛳️〗› ❲ast: constructors❳`, (tagTree) => {
      vi.assert.isTrue(true)
    }
  )

  vi.it(`〖⛳️〗› ❲ast: constructors❳: constructors are isomorphic`, () => {
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
    vi.assertType<Ex_01>(t.typeof(ex_01))
    vi.assertType<Ex_02>(t.typeof(ex_02))
  })
})

vi.describe("〖🧙〗‹‹‹ ❲@traversable/core/ast❳", () => {
  vi.it("〖🧙〗› ❲ast.short❳", () => {
    const null_ = t.short(null)
    vi.assertType<t.null>(null_)
    const bool = t.short("boolean")
    vi.assertType<t.boolean>(bool)
    const sym = t.short("symbol")
    vi.assertType<t.symbol>(sym)
    const int = t.short("integer")
    vi.assertType<t.integer>(int)
    const num = t.short("number")
    vi.assertType<t.number>(num)
    const abc = t.short("'abc'")
    vi.assertType<t.const<"abc">>(abc)
    const nulls = t.short("[]", null)
    const nullDict = t.short("{}", null)
    vi.assertType<t.array<t.null>>(nulls)
    vi.assertType<t.record<t.null>>(nullDict)
    const bools = t.short("boolean[]")
    const boolDict = t.short("boolean{}")
    vi.assertType<t.array<t.boolean>>(bools)
    vi.assertType<t.record<t.boolean>>(boolDict)
    const ints = t.short("integer[]")
    const intDict = t.short("integer{}")
    vi.assertType<t.array<t.integer>>(ints)
    vi.assertType<t.record<t.integer>>(intDict)
    const nums = t.short("number[]")
    const numDict = t.short("number{}")
    vi.assertType<t.array<t.number>>(nums)
    vi.assertType<t.record<t.number>>(numDict)
    const strs = t.short("string[]")
    const strDict = t.short("string{}")
    vi.assertType<t.array<t.string>>(strs)
    vi.assertType<t.record<t.string>>(strDict)
    const syms = t.short("symbol[]")
    const symDict = t.short("symbol{}")
    vi.assertType<t.array<t.symbol>>(syms)
    vi.assertType<t.record<t.symbol>>(symDict)
    const sbn = t.short(["boolean", "string", "number"])
    vi.assertType<t.tuple<[t.boolean, t.string, t.number]>>(sbn)
    const object_01 = t.short({ a: "boolean[]", b: { c: ["string{}"] } })
    vi.assertType<t.object<{ a: t.array<t.boolean>, b: t.object<{ c: t.tuple<[t.record<t.string>]> }> }>>(object_01)
    const intersection_01 = t.short("&", { a: "boolean" }, { b: "string[]" })
    vi.assertType<t.allOf<[t.object<{ a: t.boolean }>, t.object<{ b: t.array<t.string> }>]>>(intersection_01)
    const union_01 = t.short("|", { a: "string" }, { b: null })
    vi.assertType<t.anyOf<[ t.object<{ a: t.string }>, t.object<{ b: t.null }>]>>(union_01)
    const array_01 = t.short("[]", { a: { b: "string[]" } })
    vi.assertType<t.array<t.object<{ a: t.object<{ b: t.array<t.string> }> }>>>(array_01)
    const nested_01 = t.short({ a: "number", "b?": "boolean", "c?": { "d?": "number[]" } })
    vi.assertType<t.object<{ 
      a: t.number, 
      b: t.optional<t.boolean>, 
      c: t.optional<t.object<{ d: t.optional<t.array<t.number>> }>> 
    }>>(nested_01)
    const nested_02 = t.short("&", {
      a: "string[]",
      b: [ "[]", "number" ],
      c: [ "{}", "boolean[]" ],
      "d?": [ "&", { "x?": "number" }, { "y?": "number" }, { "z?": "number" } ],
      e: [ "|", { xs: ["|", null, "number[]"] }, { ys: ["|", null, "number[]"] }, { zs: ["|", null, "number[]"] } ],
    })
    t.short("|", null, "number[]")
    t.short({ xs: ["|", null, "number[]"] })
    vi.assertType<
      t.allOf<[
        t.object<{
        d: t.optional<t.allOf<[ t.object<{ x: t.optional<t.number> }>, t.object<{ y: t.optional<t.number> }>, t.object<{ z: t.optional<t.number> }> ]>>
        a: t.array<t.string>
        b: t.array<t.number>
        c: t.record<t.array<t.boolean>>
        e: 
          & t.anyOf<[
              t.object<{ xs: t.anyOf<[t.null, t.array<t.number>]> }>
            , t.object<{ ys: t.anyOf<[t.null, t.array<t.number>]> }>
            , t.object<{ zs: t.anyOf<[t.null, t.array<t.number>]> }> 
          ]> 
        }>
      ]>
    >(nested_02)
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
      <{ a: boolean[], b: { c: [Record<string, string>] } }>
      (t.typeof(t.short( { a: "boolean[]", b: { c: ["string{}"] } })))
    vi.assertType
      <{ a: boolean } & { b: string[] }>
      (t.typeof(t.short( "&", { a: "boolean" }, { b: "string[]" } )))
    vi.assertType
      <{ a: string } | { b: null }>
      (t.typeof(t.short( "|", { a: "string" }, { b: null } )))
    vi.assertType
      <{ a: { b: string[] } }[]>
      (t.typeof(t.short("[]", { a: { b: "string[]" } })))
    vi.assertType
      <{ a: number, b?: boolean, c?: { d?: number[] } }> 
      (t.typeof(t.short( { a: "number", "b?": "boolean", "c?": { "d?": "number[]" } })))
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
