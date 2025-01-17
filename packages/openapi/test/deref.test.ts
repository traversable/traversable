import { is, tree } from "@traversable/core"
import { Result, fn } from "@traversable/data"
import { deref } from "@traversable/openapi"
import * as vi from "vitest"

const doc_01 = {
  paths: {},
  components: {
    schemas: {
      abc: {
        type: "object",
        properties: {
          def: { $ref: "#/components/schemas/jkl" },
          ghi: { $ref: "#/components/schemas/pqr"},
        }
      },
      jkl: { $ref: "#/components/schemas/mno" },
      mno: { $ref: "#/components/schemas/abc/properties/def" },
      pqr: { type: "object", properties: { stu: { type: "integer" } } },
      vwx: { 
        type: "array", 
        items: { 
          type: "object", 
          properties: { 
            y: { $ref: "#/components/schemas/abc/properties/def" }, 
            z: { $ref: "#/components/schemas/vwx/items" } 
          } 
        } 
      },
    }
  }
} as const

vi.describe("〖⛳️〗‹‹‹ ❲@traversable/openapi/deref❳", () => {
  vi.test("〖⛳️〗‹ ❲deref❳: handles circular references", () => {
    vi.assert.throws(
      () => deref("#/components/schemas/abc/properties/def")(doc_01),
      /circular reference/,
    )
    vi.assert.throws(
      () => deref("#/components/schemas/vwx/items/properties/y")(doc_01),
      /circular reference/,
    )
  })

  vi.test("〖⛳️〗‹ ❲deref❳: returns `undefined` if predicate fails", () => {
    vi.assert.equal(
      deref("#/components/schemas/abc/properties/ghi", tree.has("type", is.literally("nonsense")))(doc_01),
      void 0
    )
  })

  vi.test("〖⛳️〗‹ ❲deref❳: dereferences unnested value", () => {
    vi.assert.equal(
      deref("#/components/schemas/pqr")(doc_01),
      doc_01.components.schemas.pqr,
    )
  })

  vi.test("〖⛳️〗‹ ❲deref❳: dereferences unnested value", () => {
    vi.assert.equal(
      deref("#/components/schemas/pqr")(doc_01),
      doc_01.components.schemas.pqr,
    )
  })

  vi.test("〖⛳️〗‹ ❲deref❳: dereferences nested value", () => {
    vi.assert.equal(
      deref("#/components/schemas/vwx/items/properties/z")(doc_01),
      doc_01.components.schemas.vwx.items,
    )
  })
})
