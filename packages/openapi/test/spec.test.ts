import * as vi from "vitest"

import { OpenAPI, Schema } from "@traversable/openapi"

const doc = OpenAPI.new({
  components: {
    schemas: {
      "D12": {
        "allOf": [ 
          { "oneOf": [ { "type": "null" }, { "nullable": true, "type": "null" } ] },
          { "nullable": true, "type": "null" }
        ]
      },
      "/paths/~1wcd~1{PCRem417UX}~1Bjc33c0Z4XW8~1vIXo/get/responses/228/content/multipart~1form-data/schema": {
        "type": "object",
        "additionalProperties": {
          "items": { "nullable": true, "type": "null" },
          "type": "array"
        }
      },
    }
  },
  paths: {
    "/wcd/{PCRem417UX}/Bjc33c0Z4XW8/vIXo": {
      "get": {
        "responses": {
          "228": {
            "description": "tristique sapien leo at posuere erat non",
            "content": {
              "application/x-www-form-urlencoded": { "schema": { "$ref": "#/components/schemas/paths/~1wcd~1{PCRem417UX}~1Bjc33c0Z4XW8~1vIXo/get/responses/228/content/application~1x-www-form-urlencoded/schema" } },
              "multipart/form-data": { "schema": { "$ref": "#/components/schemas/paths/~1wcd~1{PCRem417UX}~1Bjc33c0Z4XW8~1vIXo/get/responses/228/content/multipart~1form-data/schema" } },
              "application/octet-stream": { "schema": { "$ref": "#/components/schemas/paths/~1wcd~1{PCRem417UX}~1Bjc33c0Z4XW8~1vIXo/get/responses/228/content/application~1octet-stream/schema" } }
            }
          },
          "517": {
            "description": "vulputate felis",
            "content": {
              "image/gif": { "schema": { "$ref": "#/components/schemas/paths/~1wcd~1{PCRem417UX}~1Bjc33c0Z4XW8~1vIXo/get/responses/517/content/image~1gif/schema" } },
              "text/csv": { "schema": { "$ref": "#/components/schemas/paths/~1wcd~1{PCRem417UX}~1Bjc33c0Z4XW8~1vIXo/get/responses/517/content/text~1csv/schema" } }
            }
          }
        },
        "parameters": [
          { "name": "PCRem417UX", "in": "path", "required": true, "schema": { "$ref": "#/components/schemas/paths/~1wcd~1{PCRem417UX}~1Bjc33c0Z4XW8~1vIXo/get/parameters/0/schema" }, "style": "label" }, { "in": "cookie", "name": "h$", "style": "form", "required": false, "schema": { "$ref": "#/components/schemas/paths/~1wcd~1{PCRem417UX}~1Bjc33c0Z4XW8~1vIXo/get/parameters/1/schema" } }, { "in": "header", "name": "D$_8v", "style": "simple", "schema": { "$ref": "#/components/schemas/paths/~1wcd~1{PCRem417UX}~1Bjc33c0Z4XW8~1vIXo/get/parameters/2/schema" } }, { "in": "query", "name": "____$8_tI$Q", "schema": { "$ref": "#/components/schemas/paths/~1wcd~1{PCRem417UX}~1Bjc33c0Z4XW8~1vIXo/get/parameters/3/schema" }, "required": false, "style": "pipeDelimited", "explode": true }, { "in": "cookie", "name": "_", "style": "form", "required": true, "schema": { "$ref": "#/components/schemas/paths/~1wcd~1{PCRem417UX}~1Bjc33c0Z4XW8~1vIXo/get/parameters/4/schema" }, "deprecated": true }, 
          { "in": "query", "name": "$_rR", "schema": { "$ref": "#/components/schemas/paths/~1wcd~1{PCRem417UX}~1Bjc33c0Z4XW8~1vIXo/get/parameters/5/schema" }, "required": true, "style": "spaceDelimited", "explode": false, "deprecated": true },
          { "in": "cookie", "name": "$", "style": "form", "schema": { "$ref": "#/components/schemas/paths/~1wcd~1{PCRem417UX}~1Bjc33c0Z4XW8~1vIXo/get/parameters/6/schema" }, "deprecated": true },
          { "in": "query", "name": "$C8", "schema": { "$ref": "#/components/schemas/paths/~1wcd~1{PCRem417UX}~1Bjc33c0Z4XW8~1vIXo/get/parameters/7/schema" }, "style": "form", "explode": false, "deprecated": false },
          { "in": "cookie", "name": "_V__$Klm$$b", "schema": { "$ref": "#/components/schemas/paths/~1wcd~1{PCRem417UX}~1Bjc33c0Z4XW8~1vIXo/get/parameters/8/schema" }, "deprecated": false } 
        ],
        "requestBody": {
          "required": false,
          "content": {
            "image/gif": { "schema": { "$ref": "#/components/schemas/paths/~1wcd~1{PCRem417UX}~1Bjc33c0Z4XW8~1vIXo/post/requestBody/content/image~1gif/schema" } },
            "application/octet-stream": { "schema": { "$ref": "#/components/schemas/paths/~1wcd~1{PCRem417UX}~1Bjc33c0Z4XW8~1vIXo/post/requestBody/content/application~1octet-stream/schema" } },
            "image/jpeg": { "schema": { "$ref": "#/components/schemas/paths/~1wcd~1{PCRem417UX}~1Bjc33c0Z4XW8~1vIXo/post/requestBody/content/image~1jpeg/schema" } },
            "text/html": { "schema": { "$ref": "#/components/schemas/paths/~1wcd~1{PCRem417UX}~1Bjc33c0Z4XW8~1vIXo/post/requestBody/content/text~1html/schema" } }
          },
        }
      },
      "put": {
        "responses": {
          "149": {
            "description": "nunc suspendisse in risus adipiscing congue purus faucibus et faucibus augue",
            "content": {
              "application/octet-stream": { "schema": { "$ref": "#/components/schemas/paths/~1wcd~1{PCRem417UX}~1Bjc33c0Z4XW8~1vIXo/put/responses/149/content/application~1octet-stream/schema" } },
              "image/gif": { "schema": { "$ref": "#/components/schemas/paths/~1wcd~1{PCRem417UX}~1Bjc33c0Z4XW8~1vIXo/put/responses/149/content/image~1gif/schema" } },
              "application/javascript": { "schema": { "$ref": "#/components/schemas/paths/~1wcd~1{PCRem417UX}~1Bjc33c0Z4XW8~1vIXo/put/responses/149/content/application~1javascript/schema" } }
            }
          },
          "300": {
            "description": "faucibus pellentesque libero nulla cursus vitae sed ut eleifend sollicitudin vitae",
            "content": {
              "application/javascript": { "schema": { "$ref": "#/components/schemas/paths/~1wcd~1{PCRem417UX}~1Bjc33c0Z4XW8~1vIXo/put/responses/300/content/application~1javascript/schema" } }
            }
          },
          "344": {
            "description": "euismod congue non eu cras egestas vel ligula euismod",
            "content": {
              "application/json": { "schema": { "$ref": "#/components/schemas/paths/~1wcd~1{PCRem417UX}~1Bjc33c0Z4XW8~1vIXo/put/responses/344/content/application~1json/schema" } }
            }
          },
        }
      }
    }
  }
})

vi.describe.only("〖⛳️〗‹‹‹ ❲@traversable/openapi/OpenAPI❳", () => {
  vi.test("〖⛳️〗‹ ❲OpenAPI.map❳", () => {
    let count = 0

    vi.expect(OpenAPI.map(doc, () => (count++) + "")).toMatchInlineSnapshot(`
      {
        "components": {
          "schemas": {
            "/paths/~1wcd~1{PCRem417UX}~1Bjc33c0Z4XW8~1vIXo/get/responses/228/content/multipart~1form-data/schema": "1",
            "D12": "0",
          },
        },
        "info": {
          "title": "",
          "version": "0.0.0",
        },
        "openapi": "3.1.0",
        "paths": {
          "/wcd/{PCRem417UX}/Bjc33c0Z4XW8/vIXo": {
            "get": {
              "parameters": [
                {
                  "in": "path",
                  "name": "PCRem417UX",
                  "required": true,
                  "schema": "2",
                  "style": "label",
                },
                {
                  "in": "cookie",
                  "name": "h$",
                  "required": false,
                  "schema": "3",
                  "style": "form",
                },
                {
                  "in": "header",
                  "name": "D$_8v",
                  "schema": "4",
                  "style": "simple",
                },
                {
                  "explode": true,
                  "in": "query",
                  "name": "____$8_tI$Q",
                  "required": false,
                  "schema": "5",
                  "style": "pipeDelimited",
                },
                {
                  "deprecated": true,
                  "in": "cookie",
                  "name": "_",
                  "required": true,
                  "schema": "6",
                  "style": "form",
                },
                {
                  "deprecated": true,
                  "explode": false,
                  "in": "query",
                  "name": "$_rR",
                  "required": true,
                  "schema": "7",
                  "style": "spaceDelimited",
                },
                {
                  "deprecated": true,
                  "in": "cookie",
                  "name": "$",
                  "schema": "8",
                  "style": "form",
                },
                {
                  "deprecated": false,
                  "explode": false,
                  "in": "query",
                  "name": "$C8",
                  "schema": "9",
                  "style": "form",
                },
                {
                  "deprecated": false,
                  "in": "cookie",
                  "name": "_V__$Klm$$b",
                  "schema": "10",
                },
              ],
              "requestBody": {
                "content": {
                  "application/octet-stream": {
                    "schema": "12",
                  },
                  "image/gif": {
                    "schema": "11",
                  },
                  "image/jpeg": {
                    "schema": "13",
                  },
                  "text/html": {
                    "schema": "14",
                  },
                },
                "required": false,
              },
              "responses": {
                "228": {
                  "content": {
                    "application/octet-stream": {
                      "schema": "17",
                    },
                    "application/x-www-form-urlencoded": {
                      "schema": "15",
                    },
                    "multipart/form-data": {
                      "schema": "16",
                    },
                  },
                  "description": "tristique sapien leo at posuere erat non",
                },
                "517": {
                  "content": {
                    "image/gif": {
                      "schema": "18",
                    },
                    "text/csv": {
                      "schema": "19",
                    },
                  },
                  "description": "vulputate felis",
                },
              },
            },
            "put": {
              "responses": {
                "149": {
                  "content": {
                    "application/javascript": {
                      "schema": "22",
                    },
                    "application/octet-stream": {
                      "schema": "20",
                    },
                    "image/gif": {
                      "schema": "21",
                    },
                  },
                  "description": "nunc suspendisse in risus adipiscing congue purus faucibus et faucibus augue",
                },
                "300": {
                  "content": {
                    "application/javascript": {
                      "schema": "23",
                    },
                  },
                  "description": "faucibus pellentesque libero nulla cursus vitae sed ut eleifend sollicitudin vitae",
                },
                "344": {
                  "content": {
                    "application/json": {
                      "schema": "24",
                    },
                  },
                  "description": "euismod congue non eu cras egestas vel ligula euismod",
                },
              },
            },
          },
        },
      }
    `)
  })
})
