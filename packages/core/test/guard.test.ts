import * as vi from "vitest"

import { fc, t, test } from "@traversable/core"

vi.describe(`〖⛳️〗‹‹‹ ❲@traversable/core/guard❳`, () => {
  vi.it(`〖⛳️〗› ❲guard: t.const❳: primitive values`, () => {
    vi.assert.isTrue(t.const("xyz").is("xyz"))
    vi.assert.isTrue(t.const(1).is(1))
    vi.assert.isTrue(t.const(0).is(0))
  })

  vi.it(`〖⛳️〗› ❲guard: t.const❳: composite values`, () => {
    const array: unknown[] = []
    const object = {}
    vi.assert.isTrue(t.const(array).is(array))
    vi.assert.isTrue(t.const(object).is(object))
    vi.assert.isFalse(t.const({}).is({}))
    vi.assert.isFalse(t.const([]).is([]))
    vi.assert.isFalse(t.const({}).is({}))
  })

  vi.it(`〖⛳️〗› ❲guard: t.const❳: Options.eq`, () => {
    const SameLengthSchema 
      = <T extends readonly unknown[]>(xs: [...T]) => 
        t.const(xs, { eq: (l, r) => l.length === r.length })

    vi.assert.isTrue(SameLengthSchema([]).is([]))
    vi.assert.isTrue(SameLengthSchema([1]).is([1]))
    vi.assert.isTrue(SameLengthSchema([100, 200, 300]).is([1, 2, 3]))
    vi.assert.isFalse(SameLengthSchema([]).is([1]))
    vi.assert.isFalse(SameLengthSchema([1]).is([]))
  })

  vi.it(`〖⛳️〗› ❲guard: t.object❳`, () => {
    const schema_01 = t.object({ type: t.const("null") })
    const schema_02 = t.short({ type: '"null"' })
    const schema_03 = t.object({})

    vi.assert.isTrue(schema_01.is({ type: "null" }))
    vi.assert.isFalse(schema_01.is({ type: null }))
    vi.assert.isFalse(schema_02.is({ type: null }))
    vi.assert.isFalse(schema_02.is({ type: '"null"' }))

    vi.assert.isTrue(schema_03.is({}))
    // currently excess properties do not cause a failure
    vi.assert.isTrue(schema_03.is({ a: 1 }))
  })

  vi.it(`〖⛳️〗› ❲guard: t.short (const)❳`, () => {
    vi.assert.isTrue(t.short("''").is(""))
    vi.assert.isTrue(t.short("'xyz'").is("xyz"))
    vi.assert.isTrue(t.short("[]", null).is([]))
    vi.assert.isTrue(t.short("[]", null).is([null]))
    vi.assert.isTrue(t.short("[]", null).is([null, null]))

    vi.assert.isFalse(t.short("'xyz'").is(""))
    vi.assert.isFalse(t.short("''").is("xyz"))

    vi.expect(() => t.short("xyz" as never)).toThrowError("Unrecognized string literal")
    vi.assert.isFalse(t.short("''").is([]))

    vi.assert.isTrue(
      t
        .short({ a: "number", b: { c: "string", d: { e: "boolean" } } })
        .is({ a: 1, b: { c: "hey", d: { e: true } } })
    )

    vi.assert.isFalse(
      t
        .short({ a: "number", b: { c: "string", d: { e: "boolean" } } })
        .is({ a: 1, b: { c: "hey", d: { e: 1 } } })
    )

    vi.assert.isFalse(
      t
        .short({ a: "number", b: { c: "string", d: { e: "boolean" } } })
        .is({ a: 1, b: { c: false, d: { e: "hey" } } })
    )
  })
})

vi.describe("integration", () => {
  const enum_ = t.object({ enum: t.array(t.any()) })
  const null_ = t.short({ type: '"null"' })
  const boolean = t.object({ type: t.const("boolean") })
  const integer = t.object({ type: t.const("integer") })
  const number = t.object({ type: t.const("number") })
  const string = t.object({ type: t.const("string") })
  const allOf = t.object({ allOf: t.array(t.any()) })
  const anyOf = t.object({ anyOf: t.array(t.any()) })
  const oneOf = t.object({ oneOf: t.array(t.any()) })
  const array = t.object({ type: t.const("array") })
  const object = t.object({ type: t.const("object") })

  const is = {
    enum: enum_.is,
    null: null_.is,
    boolean: boolean.is,
    integer: integer.is,
    number: number.is,
    string: string.is,
    scalar: t.anyOf(null_, boolean, integer, number, string).is,
    composite: t.anyOf(array, object).is, 
    combinator: t.anyOf(allOf, anyOf, oneOf).is,
    any: t.anyOf(enum_, null_, boolean, integer, number, string, allOf, anyOf, oneOf, array, object).is,
  }

  vi.test("JsonSchema", () => {
    const ok = {
      null: { type: "null" },
      boolean: { type: "boolean" },
      integer: { type: "integer" },
      number: { type: "number" },
      string: { type: "string" },
      enum_01: { enum: [] },
      enum_02: { enum: [1, 2] },
      array: { type: "array" },
      object: { type: "object" },
    } as const

    vi.assert.isTrue(is.null({ type: "null" }))
    vi.assert.isFalse(is.null({ type: null }))

    vi.assert.isTrue(is.boolean({ type: "boolean" }))
    vi.assert.isFalse(is.boolean({}))
    vi.assert.isFalse(is.boolean({ type: false }))

    vi.assert.isTrue(is.integer({ type: "integer" }))
    vi.assert.isFalse(is.integer({}))
    vi.assert.isFalse(is.integer({ type: 0 }))

    vi.assert.isTrue(is.number({ type: "number" }))
    vi.assert.isFalse(is.number({}))
    vi.assert.isFalse(is.number({ type: 0.011235813 }))

    vi.assert.isTrue(is.string({ type: "string" }))
    vi.assert.isFalse(is.string({}))
    vi.assert.isFalse(is.string({ type: "" }))

    vi.assert.isTrue(is.enum({ enum: [] }))
    vi.assert.isTrue(is.enum({ enum: [1, 2] }))
    vi.assert.isFalse(is.enum({}))
    vi.assert.isFalse(is.enum({ enum: {} }))

    vi.assert.isTrue(is.any({ enum: [] }))
    vi.assert.isTrue(is.enum({ enum: [1, 2] }))
    vi.assert.isFalse(is.enum({}))
    vi.assert.isFalse(is.enum({ enum: {} }))

    vi.assert.isTrue(Object.values(ok).every(is.any))
  })


})

