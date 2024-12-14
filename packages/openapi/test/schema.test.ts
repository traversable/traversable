import { core, fc, it, test, tree } from "@traversable/core"
import * as vi from "vitest"

import { openapi } from "@traversable/openapi"

vi.describe(`〖⛳️〗‹‹‹ ❲@traversable/core❳`, () => {
  /** 
   * It should never be possible to generate an invalid OpenAPI document.
   * If we ever do, that means there's either a bug in the generator logic, 
   * or we need to adjust our definition of what constitutes a valid OpenAPI doc
   */
  test.prop([openapi.Schema.any()], {})(
    "openapi.Schema.any", 
    (schema) => vi.assert.isTrue(openapi.Schema.is(schema))
  )

  vi.it(`〖⛳️〗› ❲Schema.is❳`, () => {
    /// well-formed schemas
    vi.assert.isTrue(openapi.Schema.is({ type: "null" }))
    vi.assert.isTrue(openapi.Schema.is({ type: "null", enum: [null] }))
    vi.assert.isTrue(openapi.Schema.is({ type: "null", enum: [null], nullable: true }))
    vi.assert.isTrue(openapi.Schema.is({ type: "null", enum: { 0: null } }))
    vi.assert.isTrue(openapi.Schema.is({ type: "null", enum: { 0: null }, nullable: true }))
    vi.assert.isTrue(openapi.Schema.is({ type: "boolean" }))
    vi.assert.isTrue(openapi.Schema.is({ type: "integer" }))
    vi.assert.isTrue(openapi.Schema.is({ type: "number" }))
    vi.assert.isTrue(openapi.Schema.is({ type: "string" }))
    vi.assert.isTrue(openapi.Schema.is({ type: "array", items: { type: "number" } }))
    vi.assert.isTrue(openapi.Schema.is({ type: "array", items: [{ type: "number" }] }))
    vi.assert.isTrue(openapi.Schema.is({ type: "object", properties: { a: { type: "boolean" }, b: { type: "integer" } } }))
    vi.assert.isTrue(openapi.Schema.is({ type: "object", additionalProperties: { type: "string" } }))
    vi.assert.isTrue(openapi.Schema.is({ 
      type: "object", 
      properties: { a: { type: "boolean" }, b: { type: "integer" } }, 
      additionalProperties: { type: "string" } 
    }))
    /// malformed
    vi.assert.isFalse(openapi.Schema.is({}))
    vi.assert.isFalse(openapi.Schema.is([]))
    vi.assert.isFalse(openapi.Schema.is({ type: "" }))
    vi.assert.isFalse(openapi.Schema.is(void 0))
    vi.assert.isFalse(openapi.Schema.is(null))
  })

  vi.it(`〖⛳️〗› ❲Schema.is.tuple❳`, () => {
    /// well-formed tuple schemas
    vi.assert.isTrue(openapi.Schema.isTuple({ type: "array", items: [] }))
    vi.assert.isTrue(openapi.Schema.isTuple({ type: "array", items: [{ type: "number" }] }))
    vi.assert.isTrue(openapi.Schema.isTuple({ type: "array", items: [{ type: "number" }, { type: "integer" }] }))
    /// well-formed, non-tuples
    vi.assert.isFalse(openapi.Schema.isTuple({ type: "array", items: {} }))
    vi.assert.isFalse(openapi.Schema.isTuple({ type: "array", items: { type: "number" } }))
    /// malformed
    vi.assert.isFalse(openapi.Schema.isTuple({}))
    vi.assert.isFalse(openapi.Schema.isTuple([]))
    vi.assert.isFalse(openapi.Schema.isTuple({ type: "array", items: "number" }))
  })
 
  vi.it(`〖⛳️〗› ❲Schema.is.array❳`, () => {
    /// well-formed array schemas
    vi.assert.isTrue(openapi.Schema.isArray({ type: "array", items: { type: "number" } }))
    vi.assert.isTrue(openapi.Schema.isArray({ type: "array", items: { type: "array", items: [] } }))
    /// well-formed, non-arrays
    vi.assert.isFalse(openapi.Schema.isArray({ type: "array", items: [] }))
    vi.assert.isFalse(openapi.Schema.isArray({ type: "array", items: [{ type: "number" }] }))
    /// malformed
    vi.assert.isFalse(openapi.Schema.isTuple({}))
    vi.assert.isFalse(openapi.Schema.isTuple([]))
    vi.assert.isFalse(openapi.Schema.isTuple({ type: "array", items: "number" }))
  })

  vi.it(`〖⛳️〗› ❲Schema.is.record❳`, () => {
    /// well-formed record schemas
    vi.assert.isTrue(openapi.Schema.isRecord({ type: "object", additionalProperties: { type: "number" } }))
    vi.assert.isTrue(openapi.Schema.isRecord({ type: "object", additionalProperties: { type: "object", properties: {} } }))
    vi.assert.isTrue(openapi.Schema.isRecord({ type: "object", additionalProperties: { type: "object", properties: { a: { type: "null" } } } }))
    vi.assert.isTrue(openapi.Schema.isRecord({ type: "object", additionalProperties: { type: "integer" } }))
    /// well-formed, non-records
    vi.assert.isFalse(openapi.Schema.isRecord({ type: "object", properties: {} }))
    /// malformed
    vi.assert.isFalse(openapi.Schema.isRecord({}))
    vi.assert.isFalse(openapi.Schema.isRecord([]))
    vi.assert.isFalse(openapi.Schema.isRecord({ type: "object" }))
    vi.assert.isFalse(openapi.Schema.isRecord({ type: "object", properties: [] }))
    vi.assert.isFalse(openapi.Schema.isRecord({ type: "object", additionalProperties: { a: { type: "number" }} }))
    vi.assert.isFalse(openapi.Schema.isRecord({ type: "object", additionalProperties: {} }))
    vi.assert.isFalse(openapi.Schema.isRecord({ type: "object", additional: [{ type: "number" }] }))
  })

  vi.it(`〖⛳️〗› ❲Schema.is.object❳`, () => {
    /// well-formed object schemas
    vi.assert.isTrue(openapi.Schema.isObject({ type: "object", properties: {} }))
    vi.assert.isTrue(openapi.Schema.isObject({ type: "object", properties: { a: { type: "number" } } }))
    vi.assert.isTrue(openapi.Schema.isObject({ type: "object", properties: {}, additionalProperties: { type: "integer" } }))
    /// well-formed, non-object
    vi.assert.isFalse(openapi.Schema.isObject({ type: "object", additionalProperties: { type: "integer" } }))
    /// malformed
    vi.assert.isFalse(openapi.Schema.isObject({}))
    vi.assert.isFalse(openapi.Schema.isObject([]))
    vi.assert.isFalse(openapi.Schema.isObject({ type: "object" }))
    vi.assert.isFalse(openapi.Schema.isObject({ type: "object", properties: { type: "number" } }))
    vi.assert.isFalse(openapi.Schema.isObject({ type: "object", properties: [] }))
    vi.assert.isFalse(openapi.Schema.isObject({ type: "object", additionalProperties: { a: { type: "number" }} }))
    vi.assert.isFalse(openapi.Schema.isObject({ type: "object", additionalProperties: {} }))
    vi.assert.isFalse(openapi.Schema.isObject({ type: "object", additional: [{ type: "number" }] }))
  })
})


vi.describe("@traversable/core", () => 
  test.prop([openapi.Schema.any()], {})(
    "openapi.Schema.any", 
    (schema) => vi.assert.isTrue(openapi.Schema.is(schema))
  )
)

