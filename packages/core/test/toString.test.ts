import * as vi from "vitest"

import { schema, t } from "@traversable/core"
import { symbol } from "@traversable/registry"


vi.describe("〖️⛳️〗‹‹‹ ❲@traversable/core/guard.toString❳", () => {
  vi.it("〖️⛳️〗› ❲t.toString❳", () => {
    vi.expect(schema.toString( t.null()) )
      .toMatchInlineSnapshot(`"t.null()"`)
    vi.expect(schema.toString( t.boolean()) )
      .toMatchInlineSnapshot(`"t.boolean()"`)
    vi.expect(schema.toString( t.integer()) )
      .toMatchInlineSnapshot(`"t.integer()"`)
    vi.expect(schema.toString( t.number()) )
      .toMatchInlineSnapshot(`"t.number()"`)
    vi.expect(schema.toString( t.string()) )
      .toMatchInlineSnapshot(`"t.string()"`)
    vi.expect(schema.toString( t.any()) )
      .toMatchInlineSnapshot(`"t.any()"`)
    vi.expect(schema.toString( t.array(t.any())) )
      .toMatchInlineSnapshot(`"t.array(t.any())"`)
    vi.expect(schema.toString( t.record(t.any()) ))
      .toMatchInlineSnapshot(`"t.record(t.any())"`)
    vi.expect(schema.toString( t.tuple()) )
      .toMatchInlineSnapshot(`"t.tuple()"`)
    vi.expect(schema.toString( t.tuple(t.any())) )
      .toMatchInlineSnapshot(`"t.tuple(t.any())"`)
    vi.expect(schema.toString( t.object({}) ))
      .toMatchInlineSnapshot(`"t.object({})"`)
    vi.expect(schema.toString( t.object({ a: t.number(), b: t.boolean() }) ))
      .toMatchInlineSnapshot(`"t.object({ a: t.number(), b: t.boolean() })"`)
    vi.expect(schema.toString( t.anyOf(t.number(), t.string())) )
      .toMatchInlineSnapshot(`"t.anyOf(t.number(), t.string())"`)
    vi.expect(schema.toString( t.oneOf(t.number(), t.string())) )
      .toMatchInlineSnapshot(`"t.oneOf(t.number(), t.string())"`)
    vi.expect(schema.toString( t.allOf(t.object({ a: t.number() }), t.object({ b: t.string() }))) )
      .toMatchInlineSnapshot(`"t.allOf(t.object({ a: t.number() }), t.object({ b: t.string() }))"`)
    vi.expect(schema.toString( t.oneOf(t.object({ a: t.number() }), t.object({ b: t.string() }))) )
      .toMatchInlineSnapshot(`"t.oneOf(t.object({ a: t.number() }), t.object({ b: t.string() }))"`)
    vi.expect(schema.toString( t.enum(0, true, "two")) )
      .toMatchInlineSnapshot(`"t.enum(0, true, "two")"`)
    vi.expect(schema.toString( t.const([false, "one", 2])) )
      .toMatchInlineSnapshot(`"t.const([false, "one", 2])"`)
    vi.expect(schema.toString( t.optional(t.string())) )
      .toMatchInlineSnapshot(`"t.optional(t.string())"`)
    vi.expect(schema.toString( t.allOf(t.allOf(t.string()), t.allOf(t.const(123)))) )
      .toMatchInlineSnapshot(`"t.allOf(t.allOf(t.string()), t.allOf(t.const(123)))"`)
    vi.expect(schema.toString( t.object({ x: t.optional(t.const('x')), y: t.optional(t.const('y')), z: t.const('z') })) )
      .toMatchInlineSnapshot(`"t.object({ x: t.optional(t.const("x")), y: t.optional(t.const("y")), z: t.const("z") })"`)
    vi.expect(
      schema.toString(
        t.anyOf(
          t.allOf(
            t.any(),
            t.object({
              x: t.optional(
                t.object({
                  y: t.string(),
                })
              ),
            }) // .catchall(z.string())
          ),
          t.string()
        )
      )
    ).toMatchInlineSnapshot(`"t.anyOf(t.allOf(t.any(), t.object({ x: t.optional(t.object({ y: t.string() })) })), t.string())"`)
  })

  vi.it("〖️⛳️〗› ❲t.toTypeString❳: interprets optional properties", () => {
    vi.expect(schema.toTypeString( t.null()) )
      .toMatchInlineSnapshot(`"null"`)
    vi.expect(schema.toTypeString( t.boolean()) )
      .toMatchInlineSnapshot(`"boolean"`)
    vi.expect(schema.toTypeString( t.integer()) )
      .toMatchInlineSnapshot(`"integer"`)
    vi.expect(schema.toTypeString( t.number()) )
      .toMatchInlineSnapshot(`"number"`)
    vi.expect(schema.toTypeString( t.string()) )
      .toMatchInlineSnapshot(`"string"`)
    vi.expect(schema.toTypeString( t.any()) )
      .toMatchInlineSnapshot(`"unknown"`)
    vi.expect(schema.toTypeString( t.array(t.null())) )
      .toMatchInlineSnapshot(`"Array<null>"`)
    vi.expect(schema.toTypeString( t.tuple()) )
      .toMatchInlineSnapshot(`"[]"`)
    vi.expect(schema.toTypeString( t.record(t.boolean()) ))
      .toMatchInlineSnapshot(`"Record<string, boolean>"`)
    vi.expect(schema.toTypeString( t.tuple(t.number())) )
      .toMatchInlineSnapshot(`"[number]"`)
    vi.expect(schema.toTypeString( t.object({ a: t.number(), b: t.boolean() }) ))
      .toMatchInlineSnapshot(`"{ a,number, b,boolean }"`)
    vi.expect(schema.toTypeString( t.anyOf(t.number(), t.string())) )
      .toMatchInlineSnapshot(`"number | string"`)
    vi.expect(schema.toTypeString( t.oneOf(t.number(), t.string())) )
      .toMatchInlineSnapshot(`"number | string"`)
    vi.expect(schema.toTypeString( t.allOf(t.object({ a: t.number() }), t.object({ b: t.string() }))) )
      .toMatchInlineSnapshot(`"{ a,number } & { b,string }"`)
    vi.expect(schema.toTypeString( t.oneOf(t.object({ a: t.number() }), t.object({ b: t.string() }))) )
      .toMatchInlineSnapshot(`"{ a,number } | { b,string }"`)
    vi.expect(schema.toTypeString( t.enum(0, true, "two")) )
      .toMatchInlineSnapshot(`"0 | true | two"`)
    vi.expect(schema.toTypeString( t.const([false, "one", 2])) )
      .toMatchInlineSnapshot(`"[false,"one",2]"`)
    vi.expect(schema.toTypeString( t.optional(t.string())) )
      .toMatchInlineSnapshot(`"string | undefined"`)
    vi.expect(schema.toTypeString( t.allOf(t.allOf(t.string()), t.allOf(t.const(123)))) )
      .toMatchInlineSnapshot(`"string & 123"`)
    vi.expect(schema.toTypeString( t.object({ x: t.optional(t.const('x')), y: t.optional(t.const('y')), z: t.const('z') })) )
      .toMatchInlineSnapshot(`"{ x,"x" | undefined, y,"y" | undefined, z,"z" }"`)

  })

})
