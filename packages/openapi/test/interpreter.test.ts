import { fc, is, test, tree } from "@traversable/core"
import * as vi from "vitest"

import { fn } from "@traversable/data"
import { openapi } from "@traversable/openapi"

const [hooks] = openapi.Interpreter.define({
  /////////////////////////////////
  /// root hooks
  banner: "/** testing testing one, two, three... */",
  canonical: (out, ctx) => out,
  identifier: (out, ctx) => out,
  imports: "/** this is where import statements will appear */",
  /////////////////////////////////
  /// universal hooks
  afterAll: (out, ctx) => out,
  afterEach: (out, ctx) => out,
  beforeAll: (out, ctx) => out,
  /////////////////////////////////
  /// scalars
  integer: "number",
  null: "null",
  number: "number",
  boolean: "boolean",
  string: "string",
  /////////////////////////////////
  /// non-scalar terminal nodes
  anyArray: "[]",
  anyObject: "object",
  emptyObject: "{}",
  /////////////////////////////////
  /// combinators
  allOf: {
    afterAll: (out, ctx) => out,
    afterEach: (out, key, ctx) => [key, out],
    beforeAll: (out, ctx) => out,
    beforeEach: (out, index, ctx) => [out, index],
    join: (out, ctx) => out.join(" & "),
  },
  anyOf: {
    afterAll: (out, ctx) => out,
    afterEach: (out, key, ctx) => [key, out],
    beforeAll: (out, ctx) => out,
    beforeEach: (out, index, ctx) => [out, index],
    join: (out, ctx) => out.join(" | "),
  },
  oneOf: {
    beforeAll(out, ctx) { return out },
    afterAll(out, ctx) { return out },
    afterEach(out, key, ctx) { return [key, out] },
    beforeEach(out, index, ctx) { return [out, index] },
    join(out, ctx) { return out.join(" | ") },
  },
})

vi.describe("〖⛳️〗‹‹‹ ❲@traversable/openapi/interpreter❳", () => {
  vi.test("〖⛳️〗› ❲Interpreter.inline❳", () => {
    const interpret = openapi.Interpreter.inline({
      moduleName: "TestName", 
      schemaName: "SchemaName",
      hooks, 
    })

    vi.assert.equal(interpret({ type: "null" } as never).out, "null")
    vi.assert.equal(interpret({ type: "number" }).out, "number")
    vi.assert.equal(interpret({ type: "integer" }).out, "number")
    vi.assert.equal(interpret({ type: "boolean" }).out, "boolean")
    vi.assert.equal(interpret({ type: "boolean" }).out, "boolean")
    vi.assert.equal(interpret({ type: "string" }).out, "string")
    vi.assert.equal(interpret({ type: "array", items: { type: "string" } }).out, "string")

    vi.assert.equal(
     openapi.Interpreter.inline({ 
        moduleName: "TestingHookOverrides",
        schemaName: "ResolvesExamples",
        hooks: {
          ...hooks,
          string: (ctx) => ctx.example ?? "",
        }, 
      })({ type: "string", example: "\"hi, i'm a string!\"", }).out,
      "\"hi, i'm a string!\"",
    )
  })
})
