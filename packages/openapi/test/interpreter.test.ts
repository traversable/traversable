import { fc, test } from "@traversable/core"
import * as vi from "vitest"

import { Interpreter } from "@traversable/openapi"

const hooks = Interpreter.define({
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
    afterAll: (out, ctx) => out,
    afterEach: (out, key, ctx) => [key, out],
    beforeAll: (out, ctx) => out,
    beforeEach: (out, index, ctx) => [out, index],
    join: (out, ctx) => out.join(" | "),
  },
  /////////////////////////////////
  /// composites
  // array: (out, ctx) => out,
  // const: (out, ctx) => out,
  // enum: (out, ctx) => out,
  // export: (out, ctx) => out,
  // import: (out, ctx) => out,
  // object: (out, ctx) => out,
  // record: (out, ctx) => out,
  // ref: (out, ctx) => out,
  // tuple: (out, ctx) => out,
})


vi.describe.skip("〖⛳️〗‹‹‹ ❲@traversable/openapi/interpreter❳", () => {
  vi.test("〖⛳️〗› ❲Interpreter.inline❳", () => {
    const interpret = Interpreter.inline({
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
     Interpreter.inline({ 
        moduleName: "TestingHookOverrides",
        schemaName: "ResolvesExamples",
        hooks: {
          ...hooks,
          string: (ctx) => ctx.example._tag === "@traversable/registry/URI::Option.Some" 
            ? ctx.example.value 
            : "",
        }, 
      })({ type: "string", example: "\"hi, i'm a string!\"", }).out,
      "\"hi, i'm a string!\"",
    )
  })
})
