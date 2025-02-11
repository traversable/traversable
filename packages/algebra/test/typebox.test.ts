import * as T from "@sinclair/typebox"
import * as vi from "vitest"

import { typebox } from "@traversable/algebra"

vi.describe("〖️⛳️〗‹‹‹ ❲@traversable/algebra/typebox❳", () => {
  vi.it("〖️⛳️〗› ❲typebox.toString❳", () => {
    vi.expect(typebox.toString(T.Never()))
      .toMatchInlineSnapshot(`"T.Never()"`)

    vi.expect(typebox.toString(T.Unknown()))
      .toMatchInlineSnapshot(`"T.Unknown()"`)

    vi.expect(typebox.toString(T.Any()))
      .toMatchInlineSnapshot(`"T.Any()"`)

    vi.expect(typebox.toString(T.Undefined()))
      .toMatchInlineSnapshot(`"T.Undefined()"`)

    vi.expect(typebox.toString(T.Null()))
      .toMatchInlineSnapshot(`"T.Null()"`)

    vi.expect(typebox.toString( T.Symbol()))
      .toMatchInlineSnapshot(`"T.Symbol()"`)

    vi.expect(typebox.toString(T.Boolean()))
      .toMatchInlineSnapshot(`"T.Boolean()"`)

    vi.expect(typebox.toString(T.Integer()))
      .toMatchInlineSnapshot(`"T.Integer()"`)

    vi.expect(typebox.toString(T.Number()))
      .toMatchInlineSnapshot(`"T.Number()"`)

    vi.expect(typebox.toString(T.String()))
      .toMatchInlineSnapshot(`"T.String()"`)

    vi.expect(typebox.toString(T.Literal(false)))
      .toMatchInlineSnapshot(`"T.Literal(false)"`)

    vi.expect(typebox.toString(T.Literal(0)))
      .toMatchInlineSnapshot(`"T.Literal(0)"`)

    vi.expect(typebox.toString(T.Literal("")))
      .toMatchInlineSnapshot(`"T.Literal("")"`)

    vi.expect(typebox.toString(T.Array(T.Boolean())))
      .toMatchInlineSnapshot(`"T.Array(T.Boolean())"`)

    vi.expect(typebox.toString(T.Record(T.String(), T.Boolean()) ))
      .toMatchInlineSnapshot(`"T.Record(T.String(), T.Boolean())"`)

    vi.expect(typebox.toString(T.Tuple([])))
      .toMatchInlineSnapshot(`"T.Tuple([])"`)

    vi.expect(typebox.toString(T.Optional(T.Null())))
      .toMatchInlineSnapshot(`"T.Optional(T.Null())"`)

    vi.expect(typebox.toString(T.Readonly(T.Null())))
      .toMatchInlineSnapshot(`"T.Readonly(T.Null())"`)

    vi.expect(typebox.toString(T.Union([T.Number(), T.BigInt()])))
      .toMatchInlineSnapshot(`"T.Union([T.Number(), T.Bigint()])"`)

    vi.expect(typebox.toString(T.Union([T.Number(), T.BigInt()])))
      .toMatchInlineSnapshot(`"T.Union([T.Number(), T.Bigint()])"`)

    vi.expect(typebox.toString(T.Intersect([T.Number(), T.String()])))
      .toMatchInlineSnapshot(`"T.Intersect(T.Number(), T.String())"`)

    vi.expect(typebox.toString(T.Object({ x: T.Optional(T.Integer()), y: T.Readonly(T.Union([T.Number(), T.BigInt()])) })))
      .toMatchInlineSnapshot(`"T.Object({ x: T.Optional(T.Integer()), y: T.Readonly(T.Union([T.Number(), T.Bigint()])) })"`)

    vi.expect(typebox.toString(T.Object({ x: T.Optional(T.Integer()), y: T.Readonly(T.Union([T.Number(), T.BigInt()])) })))
      .toMatchInlineSnapshot(`"T.Object({ x: T.Optional(T.Integer()), y: T.Readonly(T.Union([T.Number(), T.Bigint()])) })"`)

    vi.expect(typebox.toString(T.Object({ x: T.Optional(T.Integer()), y: T.Readonly(T.Union([T.Number(), T.BigInt()])) })))
      .toMatchInlineSnapshot(`"T.Object({ x: T.Optional(T.Integer()), y: T.Readonly(T.Union([T.Number(), T.Bigint()])) })"`)

    // Notable exceptions:
    vi.expect(typebox.toString(T.Union([T.Number()])))
      .toMatchInlineSnapshot(`"T.Number()"`)

    vi.expect(typebox.toString(T.Union([])))
      .toMatchInlineSnapshot(`"T.Never()"`)
  })
})
