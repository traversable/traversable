import * as vi from "vitest"
import { Weight } from "@traversable/openapi"

type Doc<T> = {
  components?: {
    schemas?: { [x: string]: T }
  }
  paths: { [x: string]: { [x: string]: {} } }
}

vi.describe(`〖⛳️〗‹‹‹ ❲@traversable/openapi❳`, () => {
	vi.it(`〖⛳️〗› ❲openapi.Weight.fromSchema❳`, () => {
  const doc = {
    components: { 
      schemas: {
        "array_schema": { "type": "array", "items": { "type": "null" } },
        "string_schema": { "type": "string" },
        "number_schema": { "type": "number" },
        "boolean_schema": { "type": "boolean" },
        "object_schema": { "type": "object", "properties": {} },
        "nested_ref_schema": { "$ref": "#/components/schemas/array_schema" },
      }
    },
    paths: {
      "/api/v2/groups/businesses": {
        "get": {
          "responses": {
            "200": {
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "3": { "type": "string" },
                      "0": { "type": "boolean" },
                      "7": {
                        "anyOf": [ 
                          { "$ref": "#/components/schemas/array_schema" },
                          { "$ref": "#/components/schemas/string_schema" },
                        ],
                      },
                      "4": {
                        "oneOf": [ 
                          { "$ref": "#/components/schemas/boolean_schema" },
                          { "$ref": "#/components/schemas/string_schema" },
                        ],
                      },
                      "8": {
                        "oneOf": [ 
                          { "$ref": "#/components/schemas/boolean_schema" },
                          { "$ref": "#/components/schemas/nested_ref_schema" },
                        ],
                      },
                      "9": { "$ref": "#/components/schemas/nested_ref_schema" },
                      "10": { "$ref": "#/components/schemas/array_schema" },
                      "11": { "type": "array", "items": { "type": "boolean" } },
                      "6": { "type": "object", "properties": {} },
                      // "5": { "type": ["string", "null"] },
                      "5": { "anyOf": [ { "type": "string" }, { "type": "null" } ] },
                      "1": { "type": "integer" },
                      "2": { "type": "number" },
                      "12": { "oneOf": [ { "type": "string" }, { "type": "array", "items": { "type": "number" } } ] },
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  } as const
  
      const ex_01 = doc.paths["/api/v2/groups/businesses"].get.responses[200].content["application/json"].schema
      const ex_02 = globalThis.Object.entries(ex_01.properties)
      const orderEntries = Weight.orderEntriesBy(doc, Weight.byType)
      const sorted = [...ex_02].sort(orderEntries).map((xs) => globalThis.Number.parseInt(xs[0]))
  
      vi.assert.deepEqual(sorted, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])

  })
})
