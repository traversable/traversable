import { test } from "@traversable/core"
import { Option } from "@traversable/data"
import { openapi } from "@traversable/openapi"

import * as vi from "vitest"

const inverseInterpreter = openapi.Interpreter.define({
  anyArray: "[]",
  anyObject: "object",
  emptyObject: "{}",
  null(_ctx) { return `{ "type": "null" }` },
  boolean(_ctx) { return `{ "type": "boolean" }` },
  integer(_ctx) { return `{ "type": "integer" }` },
  number(_ctx) { return `{ "type": "number" }` },
  string(_ctx) { return `{ "type": "string" }` },
  array: { after(xs, _ctx) { return `{ "type": "array", "items": ${xs} }` } },
  tuple: {
    afterAll(s, _ctx) { return `{ "type": "array", "items": ${s} }`},
    join(xs) { return xs.join(", ") }
  },
  object: {
    afterEach(x, k, _ctx) { return [`"${k}": `, x] },
    afterAll(x, ctx) { 
      const required = Option.isSome(ctx.required) ? `, "required": [${ctx.required.value.map((s) => '"' + s + '"')}]` : ""
      const additional = Option.isSome(ctx.additionalProperties) ? `, "additionalProperties": ${ctx.additionalProperties.value}` : ""
      return `{ "type": "object" ${required}, "properties": { ${x} } ${additional} }`
    },
    join(xs, _ctx) { return xs.join(",\n") },
  },
  allOf: {
    beforeAll(xs, _ctx) { return xs },
    beforeEach(x, ix, _ctx) { return [x, ix] },
    afterEach(x, k, _ctx) { return [x, k] },
    afterAll(xs, _ctx) { return `{ "allOf": [${xs}] }` },
    join(xs, _ctx) { return xs.join(", ") },
  },
  oneOf: {
    beforeAll(xs, _ctx) { return xs },
    beforeEach(x, ix, _ctx) { return [x, ix] },
    afterEach(x, k, _ctx) { return [x, k] },
    afterAll(xs, _ctx) { return `{ "oneOf": [${xs}] }` },
    join(xs, _ctx) { return xs.join(", ") },
  },
  anyOf: {
    beforeAll(xs, _ctx) { return xs },
    beforeEach(x, ix, _ctx) { return [x, ix] },
    afterEach(x, k, _ctx) { return [x, k] },
    afterAll(xs, _ctx) { return `{ "anyOf": [${xs}] }` },
    join(xs, _ctx) { return xs.join(", ") },
  },
})

const interpret = openapi.Interpreter.inline({
  moduleName: "Inverse", 
  schemaName: "InverseSchemaName",
  hooks: inverseInterpreter[0], 
})

vi.describe("〖⛳️〗‹‹‹ ❲@traversable/openapi/algebra❳", () => {
  test.prop([openapi.Schema.any()], {})(
    "〖⛳️〗‹ ❲algebra.thin❳: roundtrip with `invert` cata is lossless",
    (schema) => {
      const free = JSON.parse(interpret(schema).out)
      const forget = openapi.thin(schema)

      vi.assert.deepEqual(
        free,
        forget,
      )
    }
  )
})
