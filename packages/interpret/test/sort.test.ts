import * as vi from "vitest"

import { show } from "@traversable/core"
import { type Compare, order } from "@traversable/data"
import { type Ext, sort } from "@traversable/interpret"
import { Weight } from "@traversable/openapi"

const zzz = {
  "type": "object",
  "properties": {
    "3": { "type": "string" },
    "7": {
      "anyOf": [ 
        { "type": "array", "items": { "type": "null" } },
        { "type": "string" },
      ],
    },
    "4": {
      "oneOf": [ 
        { "type": "boolean" },
        { "type": "string" },
      ],
    },
    "8": {
      "oneOf": [ 
        { "type": "boolean" },
        { "type": "array", "items": { "type": "null" } },
      ],
    },
    "9": { "type": "array", "items": { "type": "null" } },
    "10": { "type": "array", "items": { "type": "null" } },
    "11": { "type": "array", "items": { "type": "boolean" } },
    "6": { "type": "object", "properties": {} },
    "5": { "anyOf": [ { "type": "string" }, { "type": "null" } ] },
    "1": { "type": "integer" },
    "2": { "type": "number" },
    "0": { "type": "boolean" },
    "12": { "oneOf": [ { "type": "string" }, { "type": "array", "items": { "type": "number" } } ] },
  }
} as const

vi.describe("〖️⛳️〗‹‹‹ ❲@traversable/interpret/sort❳", () => {
  vi.it("〖️⛳️〗› ❲sort.deep❳", () => {
    const Ord: Compare<Ext> = (l, r) => order.number(Weight.fromSchema({})(l as never), Weight.fromSchema({})(r as never));
    const sortFn = sort.deep(Ord)
    const input_00 = {
      type: "object", 
      properties: {
        Z: { type: "string" }, 
        V: { type: "object", properties: { vv_2: { type: "string" }, vv_1: { type: "null" } }},
        W: { type: "object", properties: { ww_1: { type: "null" }, ww_2: { type: "null" } }},
        Y: { type: "object", properties: {} },
        U: { type: "array", items: { type: "null" } },
        X: { 
          type: "object", 
          properties: { 
            xx_1: { 
              type: "tuple", 
              items: [{ type: "string" }]
            } 
          } 
        }, 
      }
    } as const

    const expected_01: [string, unknown][] = [
      ["Z", { type: "string" }],
      ["Y", { type: "object", properties: {} }],
      ["X", { type: "object", properties: { xx_1: { type: "tuple", items: [{ type: "string" }] } } }],
      ["W", { type: "object", properties: { ww_1: { type: "null" }, ww_2: { type: "null" } } }],
      ["V", { type: "object", properties: { vv_1: { type: "null" }, vv_2: { type: "string" } } }],
      ["U", { type: "array", items: { type: "null" } }],
    ]


    const actual_00 = sortFn(input_00)
    const actual_01 = Object.entries(actual_00.properties)
    const input_01 = Object.entries(input_00)

    vi.assert.notDeepEqual(input_01, expected_01)
    vi.assert.deepEqual(actual_01, expected_01)


    const actual_02 = Object.entries(actual_00.properties.V.properties)
    const input_02 = Object.entries(input_00.properties.V.properties)
    const expected_02 = [
      ["vv_1", { type: "null" }],
      ["vv_2", { type: "string" }],
    ]

    vi.assert.notDeepEqual(actual_02, input_02)
    vi.assert.deepEqual(actual_02, expected_02)
  })
})
