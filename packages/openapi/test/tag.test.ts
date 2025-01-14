import * as vi from "vitest"

import { test } from "@traversable/core"
import { Schema, tag, untag, } from "@traversable/openapi"
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
      ex_01, 
      { 
        type: "object", 
        [symbol.tag]: symbol.object,
        properties: {
          abc: {
            [symbol.tag]: symbol.string,
            type: "string",
          }
        } 
      } as never
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
      } as never
    )

    
  });

  test.prop([Schema.any()], {
    // verbose: 2,
    errorWithCause: true,
    // endOnFailure: true,
    examples: [
      [{
        items: {
          type: "number"
        },
        type: "array"
      }]
    ]
  })(
    "〖⛳️〗‹ ❲lossless roundtrip❳: openapi.tag --> openapi.untag", 
    (s) => {
      const tagged = tag(s)
      const untagged = untag(tagged)
      vi.assert.deepEqual(s, untagged)
    }
  )
})
