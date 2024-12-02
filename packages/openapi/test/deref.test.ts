import { openapi } from '@traversable/openapi'
import * as vi from "vitest"
import { default as document } from "./sample.json"
import { Option } from '@traversable/data';

const refs = [
  { "$ref": "#/components/schemas/bookings_show_response_serializer" },
  { "$ref": "#/components/schemas/group_rate_quote_create_params" },
  { "$ref": "#/components/schemas/locations_index_response_serializer" },
  { "$ref": "#/components/schemas/properties_show_response_serializer" },
]

const ex_01 = {
  "components": {
    "schemas": {
      "definitions_hotel_option": {
        "type": "object",
        "properties": { "id": { "type": "number" } }
      },
      "collection_response": {
        "type": "object",
        "properties": {
          "meta": {
            "type": "object",
            "properties": {
              "limit": { "type": "integer" },
              "total": { "type": "integer" },
              "offset": { "type": "integer" }
            }
          }
        }
      },
      "special_booking_requests_hotel_options_index_response_serializer": {
        "type": "object",
        "additionalProperties": false,
        "required": [
          "id",
          "estimated_cost",
          "status",
          "account_manager_note",
          "account_manager",
          "checklist",
          "property"
        ],
        "properties": {
          "id": { "$ref": "#/components/schemas/definitions_hotel_option/properties/id" },
          "estimated_cost": {
            "nullable": true,
            "type": "number",
          },
          "status": {
            "type": "string",
            "enum": ["ready_for_review", "approved", "denied"],
          },
          "account_manager_note": {
            "nullable": true,
            "type": "string",
          },
          "account_manager": {
            "nullable": true,
            "type": "object",
            "properties": { "name": { "type": "string" } }
          },
          "checklist": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "label": { "type": "string" },
                "meets": { "type": "boolean" }
              }
            }
          },
        }
      },
    }
  },
  "paths": {
    "/api/v2/limited/special_booking_requests/{sbr_id}/hotel_options": {
      "get": {
        "responses": {
          "200": {
            "content": {
              "application/json": {
                "schema": {
                  "allOf": [
                    { "$ref": "#/components/schemas/collection_response" },
                    {
                      "type": "object",
                      "properties": {
                        "data": {
                          "type": "array",
                          "items": {
                            "$ref": "#/components/schemas/special_booking_requests_hotel_options_index_response_serializer"
                          }
                        }
                      }
                    }
                  ]
                }
              }
            }
          }
        }
      }
    }
  },
} as const

const expected = {
  "/api/v2/limited/special_booking_requests/{sbr_id}/hotel_options": {
    "get": {
      "responses": {
        "200": {
          "content": {
            "application/json": {
              "schema": {
                "allOf": [
                  {
                    "type": "object",
                    "properties": {
                      "meta": {
                        "type": "object",
                        "properties": {
                          "limit": { "type": "integer" },
                          "total": { "type": "integer" },
                          "offset": { "type": "integer" }
                        }
                      }
                    }
                  },
                  {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "type": "object",
                          "additionalProperties": false,
                          "required": [
                            "id",
                            "estimated_cost",
                            "status",
                            "account_manager_note",
                            "account_manager",
                            "checklist",
                            "property"
                          ],
                          "properties": {
                            "id": {
                              "type": "object",
                              "properties": { "id": { "type": "number" } }
                            },
                            "estimated_cost": {
                              "nullable": true,
                              "type": "number",
                            },
                            "status": {
                              "type": "string",
                              "enum": ["ready_for_review", "approved", "denied"],
                            },
                            "account_manager_note": {
                              "nullable": true,
                              "type": "string",
                            },
                            "account_manager": {
                              "nullable": true,
                              "type": "object",
                              "properties": { "name": { "type": "string" } }
                            },
                            "checklist": {
                              "type": "array",
                              "items": {
                                "type": "object",
                                "properties": {
                                  "label": { "type": "string" },
                                  "meets": { "type": "boolean" }
                                }
                              }
                            },
                          }
                        }
                      }
                    }
                  }
                ]
              }
            }
          }
        }
      }
    }
  }
}

vi.describe("〖⛳️〗‹‹‹ ❲@traversable/openapi/deref❳", () => {
  vi.it("〖⛳️〗‹ ❲openapi.dereference❳", () => {
    const ref = { "$ref": "#/components/schemas/user_show_serializer" } satisfies openapi.$ref
    vi.assert.isTrue(Option.isSome(openapi.dereference(document)(ref)))
  })

  vi.it.skip("〖⛳️〗‹ ❲openapi.fullyDereference❳", () => {
    const start = ["paths", "/api/v2/limited/special_booking_requests/{sbr_id}/hotel_options"]
    const ex_02 = openapi.fullyDereference(ex_01)(start)
    console.log("ex_02", JSON.stringify(ex_02, null, 2))
    vi.assert.deepEqual(ex_02, expected)
  })
})


const tmp = [
  {
    "get/responses/200/content/application~1json/schema/allOf/0": {
      "type": "object",
      "properties": {
        "meta": {
          "type": "object",
          "properties": {
            "limit": {
              "type": "integer"
            },
            "total": {
              "type": "integer"
            },
            "offset": {
              "type": "integer"
            }
          }
        }
      }
    },
    "get/responses/200/content/application~1json/schema/allOf/1/properties/data/items/properties/id": {
      "type": "number"
    },
    "get/responses/200/content/application~1json/schema/allOf/1/properties/data/items": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "id",
        "estimated_cost",
        "status",
        "account_manager_note",
        "account_manager",
        "checklist",
        "property"
      ],
      "properties": {
        "id": {
          "$ref": "#/REFS/components/schemas/definitions_hotel_option/properties/id"
        },
        "estimated_cost": {
          "nullable": true,
          "type": "number"
        },
        "status": {
          "type": "string",
          "enum": [
            "ready_for_review",
            "approved",
            "denied"
          ]
        },
        "account_manager_note": {
          "nullable": true,
          "type": "string"
        },
        "account_manager": {
          "nullable": true,
          "type": "object",
          "properties": {
            "name": {
              "type": "string"
            }
          }
        },
        "checklist": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "label": {
                "type": "string"
              },
              "meets": {
                "type": "boolean"
              }
            }
          }
        }
      }
    }
  },
  {
    "_tag": "@traversable/registry/URI::Option.Some",
    "value": {
      "get": {
        "responses": {
          "200": {
            "content": {
              "application/json": {
                "schema": {
                  "allOf": [
                    {
                      "$ref": "#/REFS/components/schemas/collection_response"
                    },
                    {
                      "type": "object",
                      "properties": {
                        "data": {
                          "type": "array",
                          "items": {
                            "$ref": "#/REFS/components/schemas/special_booking_requests_hotel_options_index_response_serializer"
                          }
                        }
                      }
                    }
                  ]
                }
              }
            }
          }
        }
      }
    }
  }
]
