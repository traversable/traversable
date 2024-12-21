import * as vi from "vitest"

import { type as T } from "@traversable/algebra"

const ex_01 = {
  type: "object",
  required: ["a"],
  properties: {
    a: {
      type: "object",
      required: ["b"],
      properties: {
        b: {
          type: "array",
          items: [
            { 
              type: "object", 
              required: ["c", "e"],
              properties: {
                d: { type: "integer" },
                e: {
                  type: "array",
                  items: [
                    {
                      type: "array",
                      items: [
                        {
                          type: "array",
                          items: [ 
                            { 
                              type: "object", 
                              required: ["f"],
                              properties: { 
                                f: { type: "string" }, 
                                g: { type: "boolean" } 
                              }
                            }
                          ]
                        }
                      ]
                    }
                  ]
                },
                c: { type: "number" },
                f: { type: "number" }
              }
            },
            { type: "object", properties: { g: { type: "number" } } }
          ]
        },
        h: { type: "number" },
      }
    }
  }
} as const

vi.describe("〖️⛳️〗‹‹‹ ❲@traversable/algebra/validator❳", () => {
  vi.it("〖️⛳️〗› ❲validator.derive❳: ‹sanity› (highly-suspect)", () => {
    vi.assert.equal(
      T.derive(ex_01),
      'type Anonymous = { a: { h?: number; b: [{ d?: number; e: [[[{ f: string; g?: boolean }]]]; c: number; f?: number }, { g?: number }] } }',
    )
  })
  
  vi.it("〖️⛳️〗› ❲validator.derive❳: ‹record› (example-based)", () => {
    vi.assert.equal(
      T.derive({ 
        type: "record", 
        additionalProperties: { type: "string" },
      }),
      'type Anonymous = Record<string, string>',
    )
    vi.assert.equal(
      T.derive({ 
        type: "record", 
        additionalProperties: { type: "record", additionalProperties: { type: "string" } },
      }),
      'type Anonymous = Record<string, Record<string, string>>',
    )
  })

  vi.it("〖️⛳️〗› ❲validator.derive❳: ‹tuple› (example-based) recursively sorted for shortest path to failure", () => {
    vi.assert.equal(
      T.derive({
        type: "tuple", 
        items: [
          { type: "string" }, 
          { type: "array", items: { type: "integer" } }, 
          { type: "boolean" },
        ],
      }),
      'type Anonymous = [boolean, string, number[]]',
    )
  })
})

