import * as vi from "vitest"

import { fc, show, test, tree } from "@traversable/core"
import { Option } from "@traversable/data"
import { openapi } from "@traversable/openapi"
import { symbol } from "@traversable/registry"


vi.describe("〖⛳️〗‹‹‹ ❲@traversable/openapi/arbitrary❳", () => {
  vi.test.skip("〖⛳️〗‹ ❲openapi.arbitrary❳: all generated refs resolve to their original value", () => {
    const ex_01 = {
      type: "object" as const,
      required: ["A"],
      properties: {
        A: { type: "string" as const },
        B: {
          type: "array" as const,
          items: {
            type: "object",
            required: [],
            properties: {
              C: {
                type: "array", 
                items: { 
                  type: "object", 
                  required: [], 
                  properties: { 
                    "D": { type: "boolean" },
                    "E": { type: "integer" },
                  } 
                } 
              },
              F: { type: "string" }
            },
          },
        },
        G: {
          allOf: [
            { type: "object", properties: { H: { type: "number" } } },
            { type: "object", properties: { I: { type: "array", items: [{ type: "string" }, { type: "integer" }] } } },
          ]
        }
      },
    } as const
    const ex_02 = openapi.tag(ex_01)
    const ex_03 = openapi.paths(ex_02)

    console.log(show.serialize(ex_03, "leuven"))

    vi.assert.deepEqual(
      ex_03,
      [
        ["A", "string"],
        ["B", symbol.array, "C", symbol.array, "D", "boolean"],
        ["B", symbol.array, "C", symbol.array, "E", "integer"],
        ["B", symbol.array, "F", "string"],
        ["G", symbol.intersection, 0, "H", "number"],
        ["G", symbol.intersection, 1, "I", symbol.array, 0, "string"],
        ["G", symbol.intersection, 1, "I", symbol.array, 1, "integer"],
      ]
    )
  })
})
