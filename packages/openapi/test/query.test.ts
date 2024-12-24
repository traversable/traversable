import { JsonPointer, and, fc, is, show, test, tree } from "@traversable/core"
import { Option, fn, object } from "@traversable/data"
import { openapi } from "@traversable/openapi"
import * as vi from "vitest"

const hasSchema = tree.has("schema", is.any.object)
const Array_isArray = globalThis.Array.isArray
const isObjectNode = and(
  tree.has("type", is.literally("object")),
  tree.has("properties", is.any.object),
)

const ex_01 = {
  "components": { "schemas": {} },
  "paths": {
    "/api/v2/items/{id}/item_options": {
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
  },
}

const ex_07 = {
  components: {
    schemas: {},
  },
  paths: {
    "/v1/users": {
      get: {
        "application/json": {
          [200]: {
            response: {
              schema: { type: "object", properties: { abc: { type: "number" } } }
            },
            requestBody: {
              schema: { type: "array" }
            },
            parameters: [
              {
                name: "param_01",
                in: "query",
                schema: { type: "string" },
              },
              {
                name: "param_02",
                in: "header",
                schema: { type: "number" },
              }
            ]
          },
          [404]: {
            response: {
              schema: { type: "object", properties: { def: { type: "number" } } }
            }
          },
        },
        "text/html": {
          [201]: {
            response: {
              schema: { type: "object", properties: { ghi: { type: "number" } } }
            },
            requestBody: {
              schema: { type: "array" }
            },
            parameters: [
              {
                name: "param_03",
                in: "query",
                schema: { type: "string" },
              },
              {
                name: "param_04",
                in: "header",
                schema: { type: "number" },
              }
            ]
          },
          [404]: {
            response: {
              schema: { type: "object", properties: { jkl: { type: "number" } } }
            }
          },
        }
      },
      post: {
        "application/json": {
          [204]: {
            response: {
              schema: { type: "object", properties: { mno: { type: "boolean" } } }
            },
            requestBody: {
              schema: { type: "array" }
            },
            parameters: [
              {
                name: "param_05",
                in: "query",
                schema: { type: "string" },
              },
              {
                name: "param_06",
                in: "header",
                schema: { type: "number" },
              }
            ]
          },
          [404]: {
            response: {
              schema: { type: "object", properties: { pqr: { type: "number" } } }
            }
          },
        },
        "text/html": {
          [201]: {
            response: {
              schema: { type: "object", properties: { stu: { type: "number" } } }
            },
            requestBody: {
              schema: { type: "array" }
            },
            parameters: [
              {
                name: "param_07",
                in: "query",
                schema: { type: "string" },
              },
              {
                name: "param_08",
                in: "header",
                schema: { type: "number" },
              }
            ]
          },
          [404]: {
            response: {
              schema: { type: "object", properties: { vwx: { type: "number" } } }
            }
          },
        }
      }
    },
    "/v1/users/{id}": {
      parameters: [
        {
          "name": "id",
          "in": "path",
          "schema": "integer"
        }
      ],
      get: {
        "application/json": {
          [301]: {
            response: {
              schema: { type: "object", properties: { abc: { type: "number" } } }
            },
            requestBody: {
              schema: { type: "array" }
            },
            parameters: [
              {
                name: "param_01",
                in: "query",
                schema: { type: "string" },
              },
              {
                name: "param_02",
                in: "header",
                schema: { type: "number" },
              }
            ]
          },
        },
      },
      post: {
        "application/json": {
          [204]: {
            response: {
              schema: { type: "object", properties: { mno: { type: "boolean" } } }
            },
            requestBody: {
              schema: { type: "array" }
            },
            parameters: [
              {
                name: "param_05",
                in: "query",
                schema: { type: "string" },
              },
              {
                name: "param_06",
                in: "header",
                schema: { type: "number" },
              }
            ]
          },
          [404]: {
            response: {
              schema: { type: "object", properties: { pqr: { type: "number" } } }
            }
          },
        },
        "text/html": {
          [201]: {
            response: {
              schema: { type: "object", properties: { stu: { type: "number" } } }
            },
            requestBody: {
              schema: { type: "array" }
            },
            parameters: [
              {
                name: "param_07",
                in: "query",
                schema: { type: "string" },
              },
              {
                name: "param_08",
                in: "header",
                schema: { type: "number" },
              }
            ]
          },
          [404]: {
            response: {
              schema: { type: "object", properties: { vwx: { type: "number" } } }
            }
          },
        }
      }
    }
  },
}

vi.describe("〖⛳️〗‹‹‹ ❲@traversable/openapi/query❳", () => {
  vi.test("〖⛳️〗‹ ❲openapi.find❳", () => {
    vi.assert.deepEqual(
      openapi.find(hasSchema)({
        paths: { schema: { type: "boolean" } },
        components: {
          schemas: {
            a: { schema: { type: "string" } },
            b: { c: [{ schema: { type: "number" } }] }
          }
        },
      }),
      [
        ["paths"],
        ["components", "schemas", "a"],
        ["components", "schemas", "b", "c", 0],
      ]
    )
  })

    vi.assert.deepEqual(
      openapi.find(tree.has("schema", is.any.object))({ 
        schema: { 
          schema: [
            { schema: "non-object, should not appear among query results" },
            { 
              schema: { 
                schema: { isObject: "should appear among query results" }
              } 
            }
          ] 
        } 
      }),
      [
        [],
        ["schema", "schema", 1],
        ["schema", "schema", 1, "schema"],
      ]
    )

    vi.assert.deepEqual(
      openapi.find(hasSchema, isObjectNode)(ex_01), [
        [
          "paths", "/api/v2/items/{id}/item_options", "get", "responses", "200", 
          "content", "application/json"
        ],
        [
          "paths", "/api/v2/items/{id}/item_options", "get", "responses", "200", 
          "content", "application/json", "schema", "allOf", 0
        ],
        [
          "paths", "/api/v2/items/{id}/item_options", "get", "responses", "200", 
          "content", "application/json", "schema", "allOf", 0, "properties", "meta",
        ],
        [
          "paths", "/api/v2/items/{id}/item_options", "get", "responses", "200", 
          "content", "application/json", "schema", "allOf", 1
        ],
        [
          "paths", "/api/v2/items/{id}/item_options", "get", "responses", "200", "content", "application/json", 
          "schema", "allOf", 1, "properties", "data", "items"
        ],
        [
          "paths", "/api/v2/items/{id}/item_options", "get", "responses", "200", "content", "application/json", 
          "schema", "allOf", 1, "properties", "data", "items", "properties", "id"
        ],
        [
          "paths", "/api/v2/items/{id}/item_options", "get", "responses", "200", "content", "application/json", 
          "schema", "allOf", 1, "properties", "data", "items", "properties", "account_manager",
        ],
        [
          "paths", "/api/v2/items/{id}/item_options", "get", "responses", "200", "content", "application/json", 
          "schema", "allOf", 1, "properties", "data", "items", "properties", "checklist", "items",
        ],
      ],
    )

  vi.test("〖⛳️〗‹ ❲openapi.filter❳", () => {
    vi.assert.deepEqual(
      openapi.filter({ hasSchema })({ 
        schema: { 
          schema: [
            { 
              schema: { 
                schema: {} 
              } 
            }
          ] 
        } 
      }),
      { 
        hasSchema: [
          [], 
          ["schema", "schema", 0], 
          ["schema", "schema", 0, "schema"],
        ] 
      }
    )

    vi.assert.deepEqual(
      openapi.filter({ hasSchema })({
        paths: { schema: { type: "boolean" } },
        components: {
          schemas: {
            a: { schema: { type: "string" } },
            b: { c: [{ schema: { type: "number" } }] }
          }
        },
      }),
      {
        "hasSchema": [
          ["paths"],
          ["components", "schemas", "a"], 
          ["components", "schemas", "b", "c", 0],
        ]
      }
    )

    vi.assert.deepEqual(
      openapi.filter({ hasSchema, isObjectNode })(ex_01),
      {
        hasSchema: [['paths', '/api/v2/items/{id}/item_options', 'get', 'responses', '200', 'content', 'application/json']],
        isObjectNode: [
          [
            'paths', '/api/v2/items/{id}/item_options', 'get', 'responses', '200', 'content', 'application/json', 'schema', 
            'allOf', 0 
          ],
          [
            'paths', '/api/v2/items/{id}/item_options', 'get', 'responses', '200', 'content', 'application/json', 'schema', 
            'allOf', 0, 'properties', 'meta'
          ],
          [
            'paths', '/api/v2/items/{id}/item_options', 'get', 'responses', '200', 'content', 'application/json', 'schema', 
            'allOf', 1 
          ],
          [
            'paths', '/api/v2/items/{id}/item_options', 'get', 'responses', '200', 'content', 'application/json', 'schema', 
            'allOf', 1, 'properties', 'data', 'items' ],
          [
            'paths', '/api/v2/items/{id}/item_options', 'get', 'responses', '200', 'content', 'application/json', 'schema',
            'allOf', 1, 'properties', 'data', 'items', 'properties', 'id'
          ],
          [
            'paths', '/api/v2/items/{id}/item_options', 'get', 'responses', '200', 'content', 'application/json', 'schema',
            'allOf', 1, 'properties', 'data', 'items', 'properties', 'account_manager'
          ],
          [
            'paths', '/api/v2/items/{id}/item_options', 'get', 'responses', '200', 'content', 'application/json', 'schema',
            'allOf', 1, 'properties', 'data', 'items', 'properties', 'checklist', 'items'
          ]
        ]
      }
    )
  })

  test.prop([fc.nat(), fc.jsonValue().filter(is.nonnullable)], { verbose: 2 })(
    "〖🌍〗‹ ❲openapi.query «» openapi.filter❳", 
    (n, json) => vi.assert.deepEqual(
      openapi.query({ 
        nOrMoreElements: (x): x is unknown[] => Array_isArray(x) && x.length > n,
        nOrFewerElements: (x): x is unknown[] => Array_isArray(x) && x.length < n,
      })(json),
      openapi.filter({ 
        nOrMoreElements: (x): x is unknown[] => Array.isArray(x) && x.length > n,
        nOrFewerElements: (x): x is unknown[] => Array.isArray(x) && x.length < n,
      })(json),
    )
  )

  test.prop([fc.nat(), fc.jsonValue().filter(is.nonnullable)], {})(
    "〖🌍〗‹ ❲openapi.query «» openapi.find❳", 
    (n, json) => vi.assert.deepEqual(
      openapi.query([
        (x): x is unknown[] => Array_isArray(x) && x.length > n,
        (x): x is unknown[] => Array_isArray(x) && x.length < n,
      ])(json),
      openapi.find(
        (x): x is unknown[] => Array_isArray(x) && x.length > n,
        (x): x is unknown[] => Array_isArray(x) && x.length < n,
      )(json),
    )
  )

})

vi.describe("〖⛳️〗‹‹‹ ❲@traversable/openapi❳", () => {
  vi.test("〖⛳️〗‹ ❲openapi.accessors❳", () => {
    const ex_04 = { abc: { def: { properties: { abc: 123, def: 456, ghi: { jkl: 789 } } } } }
    let accessors = openapi.accessors(tree.has("properties", is.any.object))(ex_04)
    void (accessors["/abc/def"].properties = { xyz: 789 })

    vi.assert.deepEqual(
      ex_04, 
      { abc: { def: { properties: { xyz: 789 } as unknown }}}
    )
  })

  vi.test("〖⛳️〗‹ ❲openapi.accessors❳", () => {
    const ex_05 = { 
      a: { 
        b: {
          c: { d: 1 }, 
          e: { f: 2 }, 
          g: { h: 3 } 
        }, 
        i: { j: 4 }, 
        k: { l: 5 } 
      }, 
      m: { n: 6, o: 7 }, 
      p: { q: 8, r: 9 } 
    }

    let accessors = openapi.accessors(is.any.object)(ex_05)

    vi.assert.deepEqual(
      accessors, 
      {
        ["/"]: ex_05,
        '/a': ex_05.a,
        '/a/b': ex_05.a.b,
        '/a/b/c': ex_05.a.b.c,
        '/a/b/e': ex_05.a.b.e,
        '/a/b/g': ex_05.a.b.g,
        '/a/i': ex_05.a.i,
        '/a/k': ex_05.a.k,
        '/m': ex_05.m,
        '/p': ex_05.p,
      }
    )
  })

  vi.test("〖⛳️〗‹ ❲openapi.accessors❳: handles nested fields", () => {
    const ex_06 = { 
      a: { 
        a: {
          a: { a: 1 }, 
          b: { a: 2 }, 
          c: { a: 3 } 
        }, 
        b: { a: 4 }, 
        c: { a: 5 } 
      }, 
      b: { a: 6, b: 7 }, 
      c: { a: 8, b: 9 } 
    }

    let accessors = openapi.accessors(is.any.object)(ex_06)

    vi.assert.deepEqual(
      accessors, 
      {
        ["/"]: ex_06,
        ["/a"]: ex_06.a,
        ["/a/a"]: ex_06.a.a,
        ["/a/a/a"]: ex_06.a.a.a,
        ["/a/a/b"]: ex_06.a.a.b,
        ["/a/a/c"]: ex_06.a.a.c,
        ["/a/b"]: ex_06.a.b,
        ["/a/c"]: ex_06.a.c,
        ["/b"]: ex_06.b,
        ["/c"]: ex_06.c,
      }
    )
  })

  vi.test("〖⛳️〗‹ ❲openapi.accessors❳: lossless round trip", () => {

    ///////////////
    /// ARRANGE ///
    ///////////////
    
    // We'll be mutating `ex_07`, so here we make a copy of it.
    // That way, we have something to compare it to when we're done rebuilding it
    const ex_08 = globalThis.structuredClone(ex_07)

    // A few helpers to simulate the real use case that we have, which is
    // "moving" schemas from their various levels of nesting throughout the OpenAPI document,
    // into a top-level declaration with the other schemas
    const qualifier = "#/components/schemas"
    const qualify = (key: string) => qualifier + key
    const dequalify = (key: string) => key.startsWith(qualifier) ? key.substring(qualifier.length) : key
    const Qualifier = {
      to: qualify,
      from: dequalify,
    }

    const getDocumentSchemas = openapi.accessors(tree.has("schema", tree.has("type", is.string)))
    let accessors = getDocumentSchemas(ex_07)

    ///////////////
    ///   ACT   ///
    ///////////////

    
    /** 
     * #### {@link refs `refs`}  
     * 
     * Spec: 
     * 
     * - Each key in `refs` must be fully qualified
     * - Each key in `refs` must be JSON-pointer-escaped
     * - Each key in `refs` must resolve to a schema found in `ex_07`
     */
    let refs: { [x: string]: unknown } = {}

    for (const k in accessors) {
      // Clone the element so the new value doesn't point to a pointer -- otherwise
      // the mutation will propogate, and we lose the original value:
      void (refs[Qualifier.to(k)] = globalThis.structuredClone(accessors[k]))
    }

    // Rip out all the nested schemas from `ex_07`:
    void globalThis.Object
      .entries(accessors)
      .forEach(
        fn.flow(
          ([pathname, accessor]) => [Qualifier.to(pathname), accessor] satisfies [string, unknown],
          ([pathname, accessor]) => {
            void (accessor.schema = { $ref: pathname })
          }
        )
      )

    // Rebuild `ex_07` by following the references we just ripped out:
    for (const k in accessors) {
      const accessor = accessors[k]
      const refPath = qualify(k)
      const ref: { schema: unknown } = refs[refPath] as never
      // const accessed = tree.get(ex_07 as never, ...unqualifiedPath)
      // const referenced = tree.get(refs, ...unqualifiedPath)
      accessor.schema = ref.schema
    }
   
    //////////////////
    ///   ASSERT   ///
    //////////////////
    // None of what we just did should be lossy:
    vi.assert.deepEqual(ex_07, ex_08)
  })

  vi.test("〖⛳️〗‹ ❲openapi.query.normalize❳", () => {
    vi.expect(openapi.normalize()(ex_07)).toMatchInlineSnapshot(`
      {
        "components": {
          "schemas": {
            "/paths/~1v1~1users/get/application~1json/200/parameters/0/schema": {
              "type": "string",
            },
            "/paths/~1v1~1users/get/application~1json/200/parameters/1/schema": {
              "type": "number",
            },
            "/paths/~1v1~1users/get/application~1json/200/requestBody/schema": {
              "type": "array",
            },
            "/paths/~1v1~1users/get/application~1json/200/response/schema": {
              "properties": {
                "abc": {
                  "type": "number",
                },
              },
              "type": "object",
            },
            "/paths/~1v1~1users/get/application~1json/404/response/schema": {
              "properties": {
                "def": {
                  "type": "number",
                },
              },
              "type": "object",
            },
            "/paths/~1v1~1users/get/text~1html/201/parameters/0/schema": {
              "type": "string",
            },
            "/paths/~1v1~1users/get/text~1html/201/parameters/1/schema": {
              "type": "number",
            },
            "/paths/~1v1~1users/get/text~1html/201/requestBody/schema": {
              "type": "array",
            },
            "/paths/~1v1~1users/get/text~1html/201/response/schema": {
              "properties": {
                "ghi": {
                  "type": "number",
                },
              },
              "type": "object",
            },
            "/paths/~1v1~1users/get/text~1html/404/response/schema": {
              "properties": {
                "jkl": {
                  "type": "number",
                },
              },
              "type": "object",
            },
            "/paths/~1v1~1users/post/application~1json/204/parameters/0/schema": {
              "type": "string",
            },
            "/paths/~1v1~1users/post/application~1json/204/parameters/1/schema": {
              "type": "number",
            },
            "/paths/~1v1~1users/post/application~1json/204/requestBody/schema": {
              "type": "array",
            },
            "/paths/~1v1~1users/post/application~1json/204/response/schema": {
              "properties": {
                "mno": {
                  "type": "boolean",
                },
              },
              "type": "object",
            },
            "/paths/~1v1~1users/post/application~1json/404/response/schema": {
              "properties": {
                "pqr": {
                  "type": "number",
                },
              },
              "type": "object",
            },
            "/paths/~1v1~1users/post/text~1html/201/parameters/0/schema": {
              "type": "string",
            },
            "/paths/~1v1~1users/post/text~1html/201/parameters/1/schema": {
              "type": "number",
            },
            "/paths/~1v1~1users/post/text~1html/201/requestBody/schema": {
              "type": "array",
            },
            "/paths/~1v1~1users/post/text~1html/201/response/schema": {
              "properties": {
                "stu": {
                  "type": "number",
                },
              },
              "type": "object",
            },
            "/paths/~1v1~1users/post/text~1html/404/response/schema": {
              "properties": {
                "vwx": {
                  "type": "number",
                },
              },
              "type": "object",
            },
            "/paths/~1v1~1users~1{id}/get/application~1json/301/parameters/0/schema": {
              "type": "string",
            },
            "/paths/~1v1~1users~1{id}/get/application~1json/301/parameters/1/schema": {
              "type": "number",
            },
            "/paths/~1v1~1users~1{id}/get/application~1json/301/requestBody/schema": {
              "type": "array",
            },
            "/paths/~1v1~1users~1{id}/get/application~1json/301/response/schema": {
              "properties": {
                "abc": {
                  "type": "number",
                },
              },
              "type": "object",
            },
            "/paths/~1v1~1users~1{id}/post/application~1json/204/parameters/0/schema": {
              "type": "string",
            },
            "/paths/~1v1~1users~1{id}/post/application~1json/204/parameters/1/schema": {
              "type": "number",
            },
            "/paths/~1v1~1users~1{id}/post/application~1json/204/requestBody/schema": {
              "type": "array",
            },
            "/paths/~1v1~1users~1{id}/post/application~1json/204/response/schema": {
              "properties": {
                "mno": {
                  "type": "boolean",
                },
              },
              "type": "object",
            },
            "/paths/~1v1~1users~1{id}/post/application~1json/404/response/schema": {
              "properties": {
                "pqr": {
                  "type": "number",
                },
              },
              "type": "object",
            },
            "/paths/~1v1~1users~1{id}/post/text~1html/201/parameters/0/schema": {
              "type": "string",
            },
            "/paths/~1v1~1users~1{id}/post/text~1html/201/parameters/1/schema": {
              "type": "number",
            },
            "/paths/~1v1~1users~1{id}/post/text~1html/201/requestBody/schema": {
              "type": "array",
            },
            "/paths/~1v1~1users~1{id}/post/text~1html/201/response/schema": {
              "properties": {
                "stu": {
                  "type": "number",
                },
              },
              "type": "object",
            },
            "/paths/~1v1~1users~1{id}/post/text~1html/404/response/schema": {
              "properties": {
                "vwx": {
                  "type": "number",
                },
              },
              "type": "object",
            },
          },
        },
        "paths": {
          "/v1/users": {
            "get": {
              "application/json": {
                "200": {
                  "parameters": [
                    {
                      "in": "query",
                      "name": "param_01",
                      "schema": {
                        "$ref": "#/components/schemas/paths/~1v1~1users/get/application~1json/200/parameters/0/schema",
                      },
                    },
                    {
                      "in": "header",
                      "name": "param_02",
                      "schema": {
                        "$ref": "#/components/schemas/paths/~1v1~1users/get/application~1json/200/parameters/1/schema",
                      },
                    },
                  ],
                  "requestBody": {
                    "schema": {
                      "$ref": "#/components/schemas/paths/~1v1~1users/get/application~1json/200/requestBody/schema",
                    },
                  },
                  "response": {
                    "schema": {
                      "$ref": "#/components/schemas/paths/~1v1~1users/get/application~1json/200/response/schema",
                    },
                  },
                },
                "404": {
                  "response": {
                    "schema": {
                      "$ref": "#/components/schemas/paths/~1v1~1users/get/application~1json/404/response/schema",
                    },
                  },
                },
              },
              "text/html": {
                "201": {
                  "parameters": [
                    {
                      "in": "query",
                      "name": "param_03",
                      "schema": {
                        "$ref": "#/components/schemas/paths/~1v1~1users/get/text~1html/201/parameters/0/schema",
                      },
                    },
                    {
                      "in": "header",
                      "name": "param_04",
                      "schema": {
                        "$ref": "#/components/schemas/paths/~1v1~1users/get/text~1html/201/parameters/1/schema",
                      },
                    },
                  ],
                  "requestBody": {
                    "schema": {
                      "$ref": "#/components/schemas/paths/~1v1~1users/get/text~1html/201/requestBody/schema",
                    },
                  },
                  "response": {
                    "schema": {
                      "$ref": "#/components/schemas/paths/~1v1~1users/get/text~1html/201/response/schema",
                    },
                  },
                },
                "404": {
                  "response": {
                    "schema": {
                      "$ref": "#/components/schemas/paths/~1v1~1users/get/text~1html/404/response/schema",
                    },
                  },
                },
              },
            },
            "post": {
              "application/json": {
                "204": {
                  "parameters": [
                    {
                      "in": "query",
                      "name": "param_05",
                      "schema": {
                        "$ref": "#/components/schemas/paths/~1v1~1users/post/application~1json/204/parameters/0/schema",
                      },
                    },
                    {
                      "in": "header",
                      "name": "param_06",
                      "schema": {
                        "$ref": "#/components/schemas/paths/~1v1~1users/post/application~1json/204/parameters/1/schema",
                      },
                    },
                  ],
                  "requestBody": {
                    "schema": {
                      "$ref": "#/components/schemas/paths/~1v1~1users/post/application~1json/204/requestBody/schema",
                    },
                  },
                  "response": {
                    "schema": {
                      "$ref": "#/components/schemas/paths/~1v1~1users/post/application~1json/204/response/schema",
                    },
                  },
                },
                "404": {
                  "response": {
                    "schema": {
                      "$ref": "#/components/schemas/paths/~1v1~1users/post/application~1json/404/response/schema",
                    },
                  },
                },
              },
              "text/html": {
                "201": {
                  "parameters": [
                    {
                      "in": "query",
                      "name": "param_07",
                      "schema": {
                        "$ref": "#/components/schemas/paths/~1v1~1users/post/text~1html/201/parameters/0/schema",
                      },
                    },
                    {
                      "in": "header",
                      "name": "param_08",
                      "schema": {
                        "$ref": "#/components/schemas/paths/~1v1~1users/post/text~1html/201/parameters/1/schema",
                      },
                    },
                  ],
                  "requestBody": {
                    "schema": {
                      "$ref": "#/components/schemas/paths/~1v1~1users/post/text~1html/201/requestBody/schema",
                    },
                  },
                  "response": {
                    "schema": {
                      "$ref": "#/components/schemas/paths/~1v1~1users/post/text~1html/201/response/schema",
                    },
                  },
                },
                "404": {
                  "response": {
                    "schema": {
                      "$ref": "#/components/schemas/paths/~1v1~1users/post/text~1html/404/response/schema",
                    },
                  },
                },
              },
            },
          },
          "/v1/users/{id}": {
            "get": {
              "application/json": {
                "301": {
                  "parameters": [
                    {
                      "in": "query",
                      "name": "param_01",
                      "schema": {
                        "$ref": "#/components/schemas/paths/~1v1~1users~1{id}/get/application~1json/301/parameters/0/schema",
                      },
                    },
                    {
                      "in": "header",
                      "name": "param_02",
                      "schema": {
                        "$ref": "#/components/schemas/paths/~1v1~1users~1{id}/get/application~1json/301/parameters/1/schema",
                      },
                    },
                  ],
                  "requestBody": {
                    "schema": {
                      "$ref": "#/components/schemas/paths/~1v1~1users~1{id}/get/application~1json/301/requestBody/schema",
                    },
                  },
                  "response": {
                    "schema": {
                      "$ref": "#/components/schemas/paths/~1v1~1users~1{id}/get/application~1json/301/response/schema",
                    },
                  },
                },
              },
            },
            "parameters": [
              {
                "in": "path",
                "name": "id",
                "schema": "integer",
              },
            ],
            "post": {
              "application/json": {
                "204": {
                  "parameters": [
                    {
                      "in": "query",
                      "name": "param_05",
                      "schema": {
                        "$ref": "#/components/schemas/paths/~1v1~1users~1{id}/post/application~1json/204/parameters/0/schema",
                      },
                    },
                    {
                      "in": "header",
                      "name": "param_06",
                      "schema": {
                        "$ref": "#/components/schemas/paths/~1v1~1users~1{id}/post/application~1json/204/parameters/1/schema",
                      },
                    },
                  ],
                  "requestBody": {
                    "schema": {
                      "$ref": "#/components/schemas/paths/~1v1~1users~1{id}/post/application~1json/204/requestBody/schema",
                    },
                  },
                  "response": {
                    "schema": {
                      "$ref": "#/components/schemas/paths/~1v1~1users~1{id}/post/application~1json/204/response/schema",
                    },
                  },
                },
                "404": {
                  "response": {
                    "schema": {
                      "$ref": "#/components/schemas/paths/~1v1~1users~1{id}/post/application~1json/404/response/schema",
                    },
                  },
                },
              },
              "text/html": {
                "201": {
                  "parameters": [
                    {
                      "in": "query",
                      "name": "param_07",
                      "schema": {
                        "$ref": "#/components/schemas/paths/~1v1~1users~1{id}/post/text~1html/201/parameters/0/schema",
                      },
                    },
                    {
                      "in": "header",
                      "name": "param_08",
                      "schema": {
                        "$ref": "#/components/schemas/paths/~1v1~1users~1{id}/post/text~1html/201/parameters/1/schema",
                      },
                    },
                  ],
                  "requestBody": {
                    "schema": {
                      "$ref": "#/components/schemas/paths/~1v1~1users~1{id}/post/text~1html/201/requestBody/schema",
                    },
                  },
                  "response": {
                    "schema": {
                      "$ref": "#/components/schemas/paths/~1v1~1users~1{id}/post/text~1html/201/response/schema",
                    },
                  },
                },
                "404": {
                  "response": {
                    "schema": {
                      "$ref": "#/components/schemas/paths/~1v1~1users~1{id}/post/text~1html/404/response/schema",
                    },
                  },
                },
              },
            },
          },
        },
      }
    `)

  })
})
