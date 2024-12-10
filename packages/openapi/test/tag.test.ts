import * as vi from "vitest"

import { test } from "@traversable/core"
import { schema, tag, untag, } from "@traversable/openapi"
import { symbol } from "@traversable/registry"

vi.describe("〖⛳️〗‹‹‹ ❲@traversable/openapi/tag❳", () => {
  vi.it("〖⛳️〗‹ ❲openapi.tag❳: examples", () => {
    const ex_01 = tag({ 
      type: "object", 
      properties: { 
        abc: { type: "string" }
      } 
    })

    vi.assert.deepEqual(
      ex_01, { 
        type: "object", 
        [symbol.tag]: symbol.object,
        properties: { 
          abc: { type: "string", [symbol.tag]: symbol.string }
        } 
      }
    )
  })

  vi.it("〖⛳️〗‹ ❲openapi.untag❳: examples", () => {
    const ex_02 = untag({ 
      type: "object", 
      [symbol.tag]: symbol.object,
      properties: { 
        abc: { type: "string", [symbol.tag]: symbol.string }
      } 
    })
    
    vi.assert.deepEqual(
      ex_02, { 
        type: "object", 
        properties: { 
          abc: { type: "string" }
        } 
      }
    )
  })

  test.prop([schema.tree().tree], {
    verbose: 2,
    errorWithCause: true
  })(
    "〖⛳️〗‹ ❲lossless roundtrip❳: openapi.tag --> openapi.untag", 
    (s) => {
      const tagged = tag(s)
      const untagged = untag(tagged)
      vi.assert.deepEqual(s, untagged)
    }
  )
})
