import * as vi from "vitest"

import { t, test } from "@traversable/core"
import type { integer } from "@traversable/registry"

import { Arbitrary } from "./util.js"

const arbitrary = Arbitrary.letrecShort().tree.map((_) => [_, t.fromSeed(_)] satisfies [any, any])

vi.describe(`〖⛳️〗‹‹‹ ❲@traversable/core/ast❳`, () => {
  test.prop([arbitrary], {
    endOnFailure: false,
    // numRuns: 10_000,
  })(
    `〖⛳️〗› ❲ast: constructors❳`, (tagTree) => {
      vi.assert.isTrue(true)
    }
  )

  vi.it(`〖⛳️〗› ❲ast: constructors❳: constructors are isomorphic`, () => {
    const ex_01 = t.short({ a: "boolean", b: "number[]", c: "string{}" })
    const ex_02 = t.object({ a: t.boolean(), b: t.array(t.number()), c: t.record(t.string()) })
    vi.assert.deepEqual(ex_01.def.a.def, ex_02.def.a.def)
    vi.assert.equal(ex_01.def.a._tag, ex_02.def.a._tag)
    vi.assert.deepEqual(ex_01.def.b.def, ex_02.def.b.def)
    vi.assert.equal(ex_01.def.b._tag, ex_02.def.b._tag)
    vi.assert.deepEqual(ex_01.def.c.def, ex_02.def.c.def)
    vi.assert.equal(ex_01.def.c._tag, ex_02.def.c._tag)
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

vi.describe("〖⛳️〗‹‹‹ ❲@traversable/core/ast❳", () => {
  const $ = JSON.stringify
  const seed = {
    null: t.null(),
    bool: t.boolean(),
    int_: t.integer(),
    num_: t.number(),
    str_: t.string(),
    const_01: t.const(null),
    const_02: t.const(false),
    const_03: t.const(0),
    const_04: t.const(""),
    const_05: t.const([]),
    const_06: t.const({}),
    optional_01: t.optional(t.null()),
    optional_02: t.optional(t.boolean()),
    optional_03: t.optional(t.integer()),
    optional_05: t.optional(t.number()),
    optional_06: t.optional(t.string()),
    optional_07: t.optional(t.const(null)),
    array_01: t.array(t.null()),
    array_02: t.array(t.boolean()),
    array_03: t.array(t.integer()),
    array_04: t.array(t.number()),
    array_05: t.array(t.string()),
    record_01: t.record(t.null()),
    record_02: t.record(t.boolean()),
    record_03: t.record(t.integer()),
    record_04: t.record(t.number()),
    record_05: t.record(t.string()),
    tuple_00: t.tuple(),
    tuple_01: t.tuple(t.null()),
    tuple_02: t.tuple(t.boolean()),
    tuple_03: t.tuple(t.integer()),
    tuple_04: t.tuple(t.number()),
    tuple_05: t.tuple(t.string()),
    tuple_06: t.tuple(t.null(), t.optional(t.null())),
    tuple_07: t.tuple(t.boolean(), t.optional(t.boolean())),
    tuple_08: t.tuple(t.integer(), t.optional(t.integer())),
    tuple_09: t.tuple(t.number(), t.optional(t.number())),
    tuple_10: t.tuple(t.string(), t.optional(t.string())),
    tuple_11: t.tuple(t.string(), t.optional(t.string())),
    object_00: t.object({}),
    object_01: t.object({ a: t.null() }),
    object_02: t.object({ a: t.boolean() }),
    object_03: t.object({ a: t.integer() }),
    object_04: t.object({ a: t.number() }),
    object_05: t.object({ a: t.string() }),
    object_06: t.object({ a: t.null(), b: t.optional(t.null()) }),
    object_07: t.object({ a: t.boolean(), b: t.optional(t.boolean()) }),
    object_08: t.object({ a: t.integer(), b: t.optional(t.integer()) }),
    object_09: t.object({ a: t.number(), b: t.optional(t.number()) }),
    object_10: t.object({ a: t.string(), b: t.optional(t.string()) }),
    allOf_01: t.allOf(),
    allOf_02: t.allOf(t.object({})),
    allOf_03: t.allOf(t.object({ a: t.null() })),
    allOf_04: t.allOf(t.object({ a: t.optional(t.const(100)) }), t.object({ b: t.array(t.string()) })),
    anyOf_01: t.anyOf(),
    anyOf_02: t.anyOf(t.object({})),
    anyOf_03: t.anyOf(t.object({ a: t.null() })),
    anyOf_04: t.anyOf(t.object({ a: t.optional(t.const(100)) }), t.object({ b: t.array(t.string()) })),
  } as const

  vi.it("〖⛳️〗› ❲ast: `ast.toJsonSchema` adapter❳", () => {
    vi.expect($(seed.null.toJsonSchema)).toMatchInlineSnapshot(`"{"type":"null","enum":[null]}"`)
    vi.expect($(seed.bool.toJsonSchema)).toMatchInlineSnapshot(`"{"type":"boolean"}"`)
    vi.expect($(seed.int_.toJsonSchema)).toMatchInlineSnapshot(`"{"type":"integer"}"`)
    vi.expect($(seed.num_.toJsonSchema)).toMatchInlineSnapshot(`"{"type":"number"}"`)
    vi.expect($(seed.str_.toJsonSchema)).toMatchInlineSnapshot(`"{"type":"string"}"`)
    vi.expect($(seed.const_01.toJsonSchema)).toMatchInlineSnapshot(`"{"const":null}"`)
    vi.expect($(seed.const_02.toJsonSchema)).toMatchInlineSnapshot(`"{"const":false}"`)
    vi.expect($(seed.const_03.toJsonSchema)).toMatchInlineSnapshot(`"{"const":0}"`)
    vi.expect($(seed.const_04.toJsonSchema)).toMatchInlineSnapshot(`"{"const":""}"`)
    vi.expect($(seed.const_06.toJsonSchema)).toMatchInlineSnapshot(`"{"const":{}}"`)
    vi.expect($(seed.optional_01.toJsonSchema)).toMatchInlineSnapshot(`"{"type":"null","enum":[null]}"`)
    vi.expect($(seed.optional_02.toJsonSchema)).toMatchInlineSnapshot(`"{"type":"boolean"}"`)
    vi.expect($(seed.optional_03.toJsonSchema)).toMatchInlineSnapshot(`"{"type":"integer"}"`)
    vi.expect($(seed.optional_05.toJsonSchema)).toMatchInlineSnapshot(`"{"type":"number"}"`)
    vi.expect($(seed.optional_06.toJsonSchema)).toMatchInlineSnapshot(`"{"type":"string"}"`)
    vi.expect($(seed.optional_07.toJsonSchema)).toMatchInlineSnapshot(`"{"const":null}"`)
    vi.expect($(seed.array_01.toJsonSchema)).toMatchInlineSnapshot(`"{"type":"array","items":{"type":"null","enum":[null]}}"`)
    vi.expect($(seed.array_02.toJsonSchema)).toMatchInlineSnapshot(`"{"type":"array","items":{"type":"boolean"}}"`)
    vi.expect($(seed.array_03.toJsonSchema)).toMatchInlineSnapshot(`"{"type":"array","items":{"type":"integer"}}"`)
    vi.expect($(seed.array_04.toJsonSchema)).toMatchInlineSnapshot(`"{"type":"array","items":{"type":"number"}}"`)
    vi.expect($(seed.array_05.toJsonSchema)).toMatchInlineSnapshot(`"{"type":"array","items":{"type":"string"}}"`)
    vi.expect($(seed.record_01.toJsonSchema)).toMatchInlineSnapshot(`"{"type":"object","additionalProperties":{"type":"null","enum":[null]}}"`)
    vi.expect($(seed.record_02.toJsonSchema)).toMatchInlineSnapshot(`"{"type":"object","additionalProperties":{"type":"boolean"}}"`)
    vi.expect($(seed.record_03.toJsonSchema)).toMatchInlineSnapshot(`"{"type":"object","additionalProperties":{"type":"integer"}}"`)
    vi.expect($(seed.record_04.toJsonSchema)).toMatchInlineSnapshot(`"{"type":"object","additionalProperties":{"type":"number"}}"`)
    vi.expect($(seed.record_05.toJsonSchema)).toMatchInlineSnapshot(`"{"type":"object","additionalProperties":{"type":"string"}}"`)
    vi.expect($(seed.tuple_00.toJsonSchema)).toMatchInlineSnapshot(`"{"type":"array","items":[],"minItems":0,"maxItems":0}"`)
    vi.expect($(seed.tuple_01.toJsonSchema)).toMatchInlineSnapshot(`"{"type":"array","items":[{"type":"null","enum":[null]}],"minItems":1,"maxItems":1}"`)
    vi.expect($(seed.tuple_02.toJsonSchema)).toMatchInlineSnapshot(`"{"type":"array","items":[{"type":"boolean"}],"minItems":1,"maxItems":1}"`)
    vi.expect($(seed.tuple_03.toJsonSchema)).toMatchInlineSnapshot(`"{"type":"array","items":[{"type":"integer"}],"minItems":1,"maxItems":1}"`)
    vi.expect($(seed.tuple_04.toJsonSchema)).toMatchInlineSnapshot(`"{"type":"array","items":[{"type":"number"}],"minItems":1,"maxItems":1}"`)
    vi.expect($(seed.tuple_05.toJsonSchema)).toMatchInlineSnapshot(`"{"type":"array","items":[{"type":"string"}],"minItems":1,"maxItems":1}"`)
    vi.expect($(seed.tuple_06.toJsonSchema)).toMatchInlineSnapshot(`"{"type":"array","items":[{"type":"null","enum":[null]},{"type":"null","enum":[null]}],"minItems":2,"maxItems":2}"`)
    vi.expect($(seed.tuple_07.toJsonSchema)).toMatchInlineSnapshot(`"{"type":"array","items":[{"type":"boolean"},{"type":"boolean"}],"minItems":2,"maxItems":2}"`)
    vi.expect($(seed.tuple_08.toJsonSchema)).toMatchInlineSnapshot(`"{"type":"array","items":[{"type":"integer"},{"type":"integer"}],"minItems":2,"maxItems":2}"`)
    vi.expect($(seed.tuple_09.toJsonSchema)).toMatchInlineSnapshot(`"{"type":"array","items":[{"type":"number"},{"type":"number"}],"minItems":2,"maxItems":2}"`)
    vi.expect($(seed.tuple_10.toJsonSchema)).toMatchInlineSnapshot(`"{"type":"array","items":[{"type":"string"},{"type":"string"}],"minItems":2,"maxItems":2}"`)
    vi.expect($(seed.tuple_11.toJsonSchema)).toMatchInlineSnapshot(`"{"type":"array","items":[{"type":"string"},{"type":"string"}],"minItems":2,"maxItems":2}"`)
    vi.expect($(seed.object_00.toJsonSchema)).toMatchInlineSnapshot(`"{"type":"object","required":[],"properties":{}}"`)
    vi.expect($(seed.object_01.toJsonSchema)).toMatchInlineSnapshot(`"{"type":"object","required":["a"],"properties":{"a":{"type":"null","enum":[null]}}}"`)
    vi.expect($(seed.object_02.toJsonSchema)).toMatchInlineSnapshot(`"{"type":"object","required":["a"],"properties":{"a":{"type":"boolean"}}}"`)
    vi.expect($(seed.object_03.toJsonSchema)).toMatchInlineSnapshot(`"{"type":"object","required":["a"],"properties":{"a":{"type":"integer"}}}"`)
    vi.expect($(seed.object_04.toJsonSchema)).toMatchInlineSnapshot(`"{"type":"object","required":["a"],"properties":{"a":{"type":"number"}}}"`)
    vi.expect($(seed.object_05.toJsonSchema)).toMatchInlineSnapshot(`"{"type":"object","required":["a"],"properties":{"a":{"type":"string"}}}"`)
    vi.expect($(seed.object_06.toJsonSchema)).toMatchInlineSnapshot(`"{"type":"object","required":["a"],"properties":{"a":{"type":"null","enum":[null]},"b":{"type":"null","enum":[null]}}}"`)
    vi.expect($(seed.object_07.toJsonSchema)).toMatchInlineSnapshot(`"{"type":"object","required":["a"],"properties":{"a":{"type":"boolean"},"b":{"type":"boolean"}}}"`)
    vi.expect($(seed.object_08.toJsonSchema)).toMatchInlineSnapshot(`"{"type":"object","required":["a"],"properties":{"a":{"type":"integer"},"b":{"type":"integer"}}}"`)
    vi.expect($(seed.object_09.toJsonSchema)).toMatchInlineSnapshot(`"{"type":"object","required":["a"],"properties":{"a":{"type":"number"},"b":{"type":"number"}}}"`)
    vi.expect($(seed.object_10.toJsonSchema)).toMatchInlineSnapshot(`"{"type":"object","required":["a"],"properties":{"a":{"type":"string"},"b":{"type":"string"}}}"`)
    vi.expect($(seed.allOf_01.toJsonSchema)).toMatchInlineSnapshot(`"{"allOf":[]}"`)
    vi.expect($(seed.allOf_02.toJsonSchema)).toMatchInlineSnapshot(`"{"allOf":[{"type":"object","required":[],"properties":{}}]}"`)
    vi.expect($(seed.allOf_03.toJsonSchema)).toMatchInlineSnapshot(`"{"allOf":[{"type":"object","required":["a"],"properties":{"a":{"type":"null","enum":[null]}}}]}"`)
    vi.expect($(seed.allOf_04.toJsonSchema)).toMatchInlineSnapshot(`"{"allOf":[{"type":"object","required":[],"properties":{"a":{"const":100}}},{"type":"object","required":["b"],"properties":{"b":{"type":"array","items":{"type":"string"}}}}]}"`)
    vi.expect($(seed.anyOf_01.toJsonSchema)).toMatchInlineSnapshot(`"{"anyOf":[]}"`)
    vi.expect($(seed.anyOf_02.toJsonSchema)).toMatchInlineSnapshot(`"{"anyOf":[{"type":"object","required":[],"properties":{}}]}"`)
    vi.expect($(seed.anyOf_03.toJsonSchema)).toMatchInlineSnapshot(`"{"anyOf":[{"type":"object","required":["a"],"properties":{"a":{"type":"null","enum":[null]}}}]}"`)
    vi.expect($(seed.anyOf_04.toJsonSchema)).toMatchInlineSnapshot(`"{"anyOf":[{"type":"object","required":[],"properties":{"a":{"const":100}}},{"type":"object","required":["b"],"properties":{"b":{"type":"array","items":{"type":"string"}}}}]}"`)
    vi.assertType<{ type: "null", enum: [null] }>(seed.null.toJsonSchema)
    ///
    vi.assertType<{ type: "boolean" }>(seed.bool.toJsonSchema)
    vi.assertType<{ type: "integer" }>(seed.int_.toJsonSchema)
    vi.assertType<{ type: "number" }>(seed.num_.toJsonSchema)
    vi.assertType<{ type: "string" }>(seed.str_.toJsonSchema)
    vi.assertType<{ const: null }>(seed.const_01.toJsonSchema)
    vi.assertType<{ const: false }>(seed.const_02.toJsonSchema)
    vi.assertType<{ const: 0 }>(seed.const_03.toJsonSchema)
    vi.assertType<{ const: "" }>(seed.const_04.toJsonSchema)
    vi.assertType<{ const: readonly [] }>(seed.const_05.toJsonSchema)
    vi.assertType<{ const: readonly [] }>(seed.const_05.toJsonSchema)
    vi.assertType<{ const: {} }>(seed.const_06.toJsonSchema)
    vi.assertType<{ type: "null", enum: [null] }>(seed.optional_01.toJsonSchema)
    vi.assertType<{ type: "boolean" }>(seed.optional_02.toJsonSchema)
    vi.assertType<{ type: "integer" }>(seed.optional_03.toJsonSchema)
    vi.assertType<{ type: "number" }>(seed.optional_05.toJsonSchema)
    vi.assertType<{ type: "string" }>(seed.optional_06.toJsonSchema)
    vi.assertType<{ const: null }>(seed.optional_07.toJsonSchema)
    vi.assertType<{ type: "array", items: { type: "null", enum: [null] } }>(seed.array_01.toJsonSchema)
    vi.assertType<{ type: "array", items: { type: "boolean" } }>(seed.array_02.toJsonSchema)
    vi.assertType<{ type: "array", items: { type: "integer" } }>(seed.array_03.toJsonSchema)
    vi.assertType<{ type: "array", items: { type: "number" } }>(seed.array_04.toJsonSchema)
    vi.assertType<{ type: "array", items: { type: "string" } }>(seed.array_05.toJsonSchema)
    vi.assertType<{ type: "object", additionalProperties: { type: "null", enum: [null] } }>(seed.record_01.toJsonSchema)
    vi.assertType<{ type: "object", additionalProperties: { type: "boolean" } }>(seed.record_02.toJsonSchema)
    vi.assertType<{ type: "object", additionalProperties: { type: "integer" } }>(seed.record_03.toJsonSchema)
    vi.assertType<{ type: "object", additionalProperties: { type: "number" } }>(seed.record_04.toJsonSchema)
    vi.assertType<{ type: "object", additionalProperties: { type: "string" } }>(seed.record_05.toJsonSchema)
    vi.assertType<{ type: "array", items: [] }>(seed.tuple_00.toJsonSchema)
    vi.assertType<{ type: "array", items: [{ type: "null", enum: [null] }] }>(seed.tuple_01.toJsonSchema)
    vi.assertType<{ type: "array", items: [{ type: "boolean" }] }>(seed.tuple_02.toJsonSchema)
    vi.assertType<{ type: "array", items: [{ type: "integer" }] }>(seed.tuple_03.toJsonSchema)
    vi.assertType<{ type: "array", items: [{ type: "number" }] }>(seed.tuple_04.toJsonSchema)
    vi.assertType<{ type: "array", items: [{ type: "string" }] }>(seed.tuple_05.toJsonSchema)
    vi.assertType<{ type: "array", items: [{ type: "null", enum: [null] }, { type: "null", enum: [null] }] }>(seed.tuple_06.toJsonSchema)
    vi.assertType<{ type: "array", items: [{ type: "boolean" }, { type: "boolean" }] }>(seed.tuple_07.toJsonSchema)
    vi.assertType<{ type: "array", items: [{ type: "integer" }, { type: "integer" }] }>(seed.tuple_08.toJsonSchema)
    vi.assertType<{ type: "array", items: [{ type: "number", }, { type: "number" }] }>(seed.tuple_09.toJsonSchema)
    vi.assertType<{ type: "array", items: [{ type: "string" }, { type: "string" }] }>(seed.tuple_10.toJsonSchema)
    vi.assertType<{ type: "array", items: [{ type: "string" }, { type: "string" }] }>(seed.tuple_11.toJsonSchema)
    vi.assertType<{ type: "object", required: [], properties: {} }>(seed.object_00.toJsonSchema)
    vi.assertType<{ type: "object", required: "a"[], properties: { a: { type: "null", enum: [null] } } }>(seed.object_01.toJsonSchema)
    vi.assertType<{ type: "object", required: "a"[], properties: { a: { type: "boolean" } } }>(seed.object_02.toJsonSchema)
    vi.assertType<{ type: "object", required: "a"[], properties: { a: { type: "integer" } } }>(seed.object_03.toJsonSchema)
    vi.assertType<{ type: "object", required: "a"[], properties: { a: { type: "number" } } }>(seed.object_04.toJsonSchema)
    vi.assertType<{ type: "object", required: "a"[], properties: { a: { type: "string" } } }>(seed.object_05.toJsonSchema)
    vi.assertType<{ type: "object", required: "a"[], properties: { a: { type: "null", enum: [null] }, b: { type: "null", enum: [null] } } }>(seed.object_06.toJsonSchema)
    vi.assertType<{ type: "object", required: "a"[], properties: { a: { type: "boolean" }, b: { type: "boolean" } } }>(seed.object_07.toJsonSchema)
    vi.assertType<{ type: "object", required: "a"[], properties: { a: { type: "integer" }, b: { type: "integer" } } }>(seed.object_08.toJsonSchema)
    vi.assertType<{ type: "object", required: "a"[], properties: { a: { type: "number" }, b: { type: "number" } } }>(seed.object_09.toJsonSchema)
    vi.assertType<{ type: "object", required: "a"[], properties: { a: { type: "string" }, b: { type: "string" } } }>(seed.object_10.toJsonSchema)
    vi.assertType<{ allOf: [] }>(seed.allOf_01.toJsonSchema)
    vi.assertType<{ allOf: [{ type: "object", required: [], properties: {} }] }>(seed.allOf_02.toJsonSchema)
    vi.assertType<{ allOf: [{ type: "object", required: "a"[], properties: { a: { type: "null", enum: [null] } } }] }>(seed.allOf_03.toJsonSchema)
    vi.assertType<{ allOf: [ { type: "object", required: [], properties: { a: { const: 100 } } }, { type: "object", required: "b"[], properties: { b: { type: "array", items: { type: "string" } } } } ] }>(seed.allOf_04.toJsonSchema)
    vi.assertType<{ anyOf: [] }>(seed.anyOf_01.toJsonSchema)
    vi.assertType<{ anyOf: [{ type: "object", required: [], properties: {} }] }>(seed.anyOf_02.toJsonSchema)
    vi.assertType<{ anyOf: [{ type: "object", required: "a"[], properties: { a: { type: "null", enum: [null] } } }] }>(seed.anyOf_03.toJsonSchema)
    vi.assertType<{ anyOf: [ { type: "object", required: [], properties: { a: { const: 100 } } }, { type: "object", required: "b"[], properties: { b: { type: "array", items: { type: "string" } } } } ], }>(seed.anyOf_04.toJsonSchema)
  })
})
