import { test } from "@fast-check/vitest"
import { openapi } from "@traversable/openapi"

import * as vi from "vitest"

const [interpreter, _refs] = openapi.Interpreter.define({
  null: '{ "type": "null" }',
  boolean: '{ "type": "boolean" }',
  integer: '{ "type": "integer" }',
  number: '{ "type": "number" }',
  string: '{ "type": "string" }',
  const: { after(_) { return '{ "const": ' + _ + ' }' } },
  allOf: { afterAll(_) { return '{ "allOf": [' + _ + '] }' } },
  oneOf: { afterAll(_) { return '{ "oneOf": [' + _ + '] }' } },
  anyOf: { afterAll(_) { return '{ "anyOf": [' + _ + '] }' } },
  array: { after(_) { return '{ "type": "array", "items": ' + _ + '}' } },
  tuple: { afterAll(_) { return '{ "type": "array", "items": [' + _ + '] }' } },
  record: { after(_) { return '{ "type": "object", "additionalProperties":' + _ + '}' } },
  object: {
    afterEach: (v, k) => [k + ": ", v],
    afterAll(s, ctx) {
      const req = 
        !ctx.required ? "" 
        : ', "required": [' + ctx.required.map((_) => '"' + _ + '"') + ']'
      const additional = 
        !ctx.additionalProperties ? "" 
        : ', "additionalProperties":' + ctx.additionalProperties
      return '{ "type": "object", "properties": {' + s + '}' + req + additional + '}'
    },
    join(xs) { return xs.join(",\n") },
  },
})

const interpret = openapi.Interpreter.inline({
  moduleName: "Inverse", 
  schemaName: "InverseSchemaName",
  hooks: interpreter, 
})

vi.describe("〖⛳️〗‹‹‹ ❲@traversable/openapi/algebra❳", () => {
  test.prop([openapi.Schema.any()], {
    verbose: 2,
    endOnFailure: true,
    examples: [
      [{ "oneOf": [{ "const":{} },{ "oneOf": [ {"minLength":undefined, "maxLength":undefined,"type":"string"}]}]}],
      [{ "items": [{ "const":{} }], "type":"array" }],
      [{"type":"object","additionalProperties":{"const":null}}],
    ]
  })(
    "〖⛳️〗‹ ❲algebra.forget❳: roundtrip is lossless",
    (schema) => {
      const free = JSON.parse(interpret(schema).out)
      const forget = openapi.forget(free)
      vi.assert.deepEqual(
        free,
        forget,
      )
    }
  )
})
