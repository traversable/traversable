import * as vi from "vitest"
import { openapi } from "@traversable/openapi"
import { and, fc, is, JsonPointer, show, test, tree } from "@traversable/core"
import { fn, object, Option } from "@traversable/data"

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

    // console.log("accessors", accessors)

    ///////////////
    ///   ACT   ///
    ///////////////

    // Here we create save all the nested schemas in an object called `refs`, where
    // each key in `refs` is a fully qualified, JsonPointer-escaped path that resolves
    // to a schema in `ex_07`

    let refs: { [x: string]: unknown } = {}
    for (const k in accessors) {
      // clone the element so the new value doesn't point to a pointer -- otherwise
      // the mutation will propogate, and we lose the original value
      void (refs[Qualifier.to(k)] = globalThis.structuredClone(accessors[k]))
    }

    // Here we rip out all the nested schemas from ex_07
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

    // Here we rebuild ex_07 by piecing it back together from the refs we previously ripped out
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

    // None of what we did should be lossy. Assert that there's no structural difference
    // between `ex_07` and `ex08`
    vi.assert.deepEqual(ex_07, ex_08)
  })

  // test.prop([fc.dictionary(fc.dictionary(fc.jsonValue(), { minKeys: 1 }))], {
  //   examples: [
  //     [
  //       { a: { b: { c: { d: 1 } }}}
  //     ]
  //   ]
  // })(
  //   "〖⛳️〗‹ ❲openapi.accessors❳: property -- lossless round trip", 
  //   (json) => {
  //     const clone = globalThis.structuredClone(json)
  //     const accessors = openapi.accessors((u, p) => p.length > 1 && is.recordOf(is.any.object)(u))(json)
  //     // console.log(show.serialize(json, "pretty"))
  //     // console.log("accessors", accessors) // show.serialize(accessors, "leuven") )
  //     let refs: { [x: string]: unknown } = {}

  //     // console.log("\n\n\n\n\n\nBEFORE", show.serialize(json, "leuven"))

  //     console.log("BEFORE ALL: json", show.serialize(json, "leuven"))
  //     console.log("BEFORE ALL: accessors", show.serialize(accessors, "leuven"))

  //     for (let k in accessors) {
  //       const path = JsonPointer.toPath(k)

  //       console.group("\n\nPATH")
  //       console.log("path before", path)
  //       // const last = path.pop()
  //       // if (!last) throw Error("NO LAST")
  //       // console.log("path after", path)
  //       // console.log("last", last)
  //       console.groupEnd()

  //       console.log("\n\n\n --- " , k, " --- ")
  //       const accessor = accessors[k]
  //       console.log("UNESCAPED",JsonPointer.toPath(k))
  //       console.log("\n\n\nJSON BEFORE", show.serialize(tree.get(json, ...JsonPointer.toPath(k)), "leuven"))
  //       console.log("accessors[k] BEFORE:", accessors[k])
  //       // clone the element so the new value doesn't point to a pointer -- otherwise
  //       // the mutation will propogate, and we lose the original
  //       void (refs[JsonPointer.escape(k)] = globalThis.structuredClone(accessors[k]))
  //       void (accessors[k][path[path.length - 1]] = { $ref: JsonPointer.escape(k) } )
  //       console.log("accessors[k] AFTER:", accessors[k])
  //       console.log("refs[k]", refs[k])
  //       console.log("object.pick(accessors, k)", object.pick(accessors, k))
  //       console.log("object.pick(json, k)", tree.get(json, ...JsonPointer.toPath(k)))
  //     }

  //     console.log("AFTER ALL: accessors", show.serialize(accessors, "leuven"))
  //     console.log("AFTER ALL: refs", show.serialize(refs, "leuven"))
  //     console.log("AFTER ALL: json", show.serialize(json, "leuven"))

  //     // console.log("refs", refs)
  //     // console.log("accessors", accessors)
  //     // console.log("json", show.serialize(json, "leuven"))

  //   vi.assert.isTrue(false)
  //   }
  // )

  //     // void globalThis.Object
  //     // .entries(accessors)
  //     // .forEach(
  //     //   // fn.flow(
  //     //     // ([pathname, accessor]) => [pathname, accessor] satisfies [string, unknown],
  //     //     ([pathname, accessor]) => {
  //     //       const key = globalThis.Object.keys(accessor)[0]
  //     //       if (key === undefined) throw Error("WRONG")
  //     //       console.log("key", key)
  //     //       accessor[key] = { $ref: pathname }
  //     //       // void (accessor.schema = { $ref: pathname })
  //     //     }
  //     //   // )
  //     // )

  //     // for (const k in json)
  //     // vi.assert.isFalse()

  //     // console.log("refs", refs)
  //     // console.log("accessors", accessors)
  //     // vi.assert.isTrue(true)

  vi.test("〖⛳️〗‹ ❲openapi.query.normalize❳", () => {
    const normal = openapi.normalize()(ex_07)
    console.log("norml", show.serialize(normal, "pretty"))

    vi.assert.deepEqual(
      normal, {
        paths: {
          "/v1/users": {
            get: {
              "application/json": {
                "200": {
                  response: { schema: { $ref: "/paths/~1v1~1users/get/application~1json/200/response" } },
                  requestBody: { schema: { $ref: "/paths/~1v1~1users/get/application~1json/200/requestBody" } },
                  parameters: [
                    { name: "param_01", in: "query", schema: { $ref: "/paths/~1v1~1users/get/application~1json/200/parameters/0" } }, 
                    { name: "param_02", in: "header", schema: { $ref: "/paths/~1v1~1users/get/application~1json/200/parameters/1" } },
                  ]
                },
                "404": { response: { schema: { $ref: "/paths/~1v1~1users/get/application~1json/404/response" } } }
              },
              "text/html": {
               "201": { 
                  response: { schema: { $ref: "/paths/~1v1~1users/get/text~1html/201/response" } },
                  requestBody: { schema: { $ref: "/paths/~1v1~1users/get/text~1html/201/requestBody" } },
                  parameters: [
                    { name: "param_03", in: "query", schema: { $ref: "/paths/~1v1~1users/get/text~1html/201/parameters/0" } },
                    { name: "param_04", in: "header", schema: { $ref: "/paths/~1v1~1users/get/text~1html/201/parameters/1" } }
                  ]
                },
                "404": { response: { schema: { $ref: "/paths/~1v1~1users/get/text~1html/404/response" } } }
              }
            },
            post: {
              "application/json": {
                "204": { 
                  response: { schema: { $ref: "/paths/~1v1~1users/post/application~1json/204/response" } },
                  requestBody: { schema: { $ref: "/paths/~1v1~1users/post/application~1json/204/requestBody" } },
                  parameters: [
                    { name: "param_05", in: "query", schema: { $ref: "/paths/~1v1~1users/post/application~1json/204/parameters/0" } },
                    { name: "param_06", in: "header", schema: { $ref: "/paths/~1v1~1users/post/application~1json/204/parameters/1" } }
                  ]
                },
                "404": { response: { schema: { $ref: "/paths/~1v1~1users/post/application~1json/404/response" } } }
              },
              "text/html": {
                "201": {
                  response: { schema: { $ref: "/paths/~1v1~1users/post/text~1html/201/response" } },
                  requestBody: { schema: { $ref: "/paths/~1v1~1users/post/text~1html/201/requestBody" } },
                  parameters: [
                    { name: "param_07", in: "query", schema: { $ref: "/paths/~1v1~1users/post/text~1html/201/parameters/0" } },
                    { name: "param_08", in: "header", schema: { $ref: "/paths/~1v1~1users/post/text~1html/201/parameters/1" } }
                  ]
                },
                "404": { response: { schema: { $ref: "/paths/~1v1~1users/post/text~1html/404/response" } } }
              }
            }
          },
          "/v1/users/{id}": {
            parameters: [ { name: "id", in: "path", schema: "integer" } ],
            get: {
              "application/json": {
              "301": {
                  response: { schema: { $ref: "/paths/~1v1~1users~1{id}/get/application~1json/301/response" } },
                  requestBody: { schema: { $ref: "/paths/~1v1~1users~1{id}/get/application~1json/301/requestBody" } },
                  parameters: [
                    { name: "param_01", in: "query", schema: { $ref: "/paths/~1v1~1users~1{id}/get/application~1json/301/parameters/0" } },
                    { name: "param_02", in: "header", schema: { $ref: "/paths/~1v1~1users~1{id}/get/application~1json/301/parameters/1" } }
                  ]
                }
              }
            },
            post: {
              "application/json": {
                "204": {
                  response: { schema: { $ref: "/paths/~1v1~1users~1{id}/post/application~1json/204/response" } },
                  requestBody: { schema: { $ref: "/paths/~1v1~1users~1{id}/post/application~1json/204/requestBody" } },
                  parameters: [
                    { name: "param_05", in: "query", schema: { $ref: "/paths/~1v1~1users~1{id}/post/application~1json/204/parameters/0" } },
                    { name: "param_06", in: "header", schema: { $ref: "/paths/~1v1~1users~1{id}/post/application~1json/204/parameters/1" } }
                  ]
                },
                "404": { response: { schema: { $ref: "/paths/~1v1~1users~1{id}/post/application~1json/404/response" } } }
              },
              "text/html": {
                "201": {
                  response: { schema: { $ref: "/paths/~1v1~1users~1{id}/post/text~1html/201/response" } },
                  requestBody: { schema: { $ref: "/paths/~1v1~1users~1{id}/post/text~1html/201/requestBody" } },
                  parameters: [
                    { name: "param_07", in: "query", schema: { $ref: "/paths/~1v1~1users~1{id}/post/text~1html/201/parameters/0" } },
                    { name: "param_08", in: "header", schema: { $ref: "/paths/~1v1~1users~1{id}/post/text~1html/201/parameters/1" } }
                  ]
                },
                "404": { response: { schema: { $ref: "/paths/~1v1~1users~1{id}/post/text~1html/404/response" } } }
              }
            }
          }
        },
        components: {
          schemas: {
            "/paths/~1v1~1users/get/application~1json/200/response": { schema: { type: "object", properties: { abc: { type: "number" } } } },
            "/paths/~1v1~1users/get/application~1json/200/requestBody": { schema: { type: "array" } },
            "/paths/~1v1~1users/get/application~1json/200/parameters/0": { name: "param_01", in: "query", schema: { type: "string" } },
            "/paths/~1v1~1users/get/application~1json/200/parameters/1": { name: "param_02", in: "header", schema: { type: "number" } },
            "/paths/~1v1~1users/get/application~1json/404/response": { schema: { type: "object", properties: { def: { type: "number" } } } },
            "/paths/~1v1~1users/get/text~1html/201/response": { schema: { type: "object", properties: { ghi: { type: "number" } } } },
            "/paths/~1v1~1users/get/text~1html/201/requestBody": { schema: { type: "array" } },
            "/paths/~1v1~1users/get/text~1html/201/parameters/0": { name: "param_03", in: "query", schema: { type: "string" } },
            "/paths/~1v1~1users/get/text~1html/201/parameters/1": { name: "param_04", in: "header", schema: { type: "number" } },
            "/paths/~1v1~1users/get/text~1html/404/response": { schema: { type: "object", properties: { jkl: { type: "number" } } } },
            "/paths/~1v1~1users/post/application~1json/204/response": { schema: { type: "object", properties: { mno: { type: "boolean" } } } },
            "/paths/~1v1~1users/post/application~1json/204/requestBody": { schema: { type: "array" } },
            "/paths/~1v1~1users/post/application~1json/204/parameters/0": { name: "param_05", in: "query", schema: { type: "string" } },
            "/paths/~1v1~1users/post/application~1json/204/parameters/1": { name: "param_06", in: "header", schema: { type: "number" } },
            "/paths/~1v1~1users/post/application~1json/404/response": { schema: { type: "object", properties: { pqr: { type: "number" } } } },
            "/paths/~1v1~1users/post/text~1html/201/response": { schema: { type: "object", properties: { stu: { type: "number" } } } },
            "/paths/~1v1~1users/post/text~1html/201/requestBody": { schema: { type: "array" } }, 
            "/paths/~1v1~1users/post/text~1html/201/parameters/0": { name: "param_07", in: "query", schema: { type: "string" } },
            "/paths/~1v1~1users/post/text~1html/201/parameters/1": { name: "param_08", in: "header", schema: { type: "number" } },
            "/paths/~1v1~1users/post/text~1html/404/response": { schema: { type: "object", properties: { vwx: { type: "number" } } } },
            "/paths/~1v1~1users~1{id}/get/application~1json/301/response": { schema: { type: "object", properties: { abc: { type: "number" } } } },
            "/paths/~1v1~1users~1{id}/get/application~1json/301/requestBody": { schema: { type: "array" } },
            "/paths/~1v1~1users~1{id}/get/application~1json/301/parameters/0": { name: "param_01", in: "query", schema: { type: "string" } },
            "/paths/~1v1~1users~1{id}/get/application~1json/301/parameters/1": { name: "param_02", in: "header", schema: { type: "number" } },
            "/paths/~1v1~1users~1{id}/post/application~1json/204/response": { schema: { type: "object", properties: { mno: { type: "boolean" } } } }, 
            "/paths/~1v1~1users~1{id}/post/application~1json/204/requestBody": { schema: { type: "array" } },
            "/paths/~1v1~1users~1{id}/post/application~1json/204/parameters/0": { name: "param_05", in: "query", schema: { type: "string" } },
            "/paths/~1v1~1users~1{id}/post/application~1json/204/parameters/1": { name: "param_06", in: "header", schema: { type: "number" } },
            "/paths/~1v1~1users~1{id}/post/application~1json/404/response": { schema: { type: "object", properties: { pqr: { type: "number" } } } },
            "/paths/~1v1~1users~1{id}/post/text~1html/201/response": { schema: { type: "object", properties: { stu: { type: "number" } } } },
            "/paths/~1v1~1users~1{id}/post/text~1html/201/requestBody": { schema: { type: "array" } },
            "/paths/~1v1~1users~1{id}/post/text~1html/201/parameters/0": { name: "param_07", in: "query", schema: { type: "string" } },
            "/paths/~1v1~1users~1{id}/post/text~1html/201/parameters/1": { name: "param_08", in: "header", schema: { type: "number" } },
            "/paths/~1v1~1users~1{id}/post/text~1html/404/response": { schema: { type: "object", properties: { vwx: { type: "number" } } } }
          }
        }
      }
    )

                  
          // { schema: { $ref: "/paths/~1v1~1users~1{id}/post/text~1html/201/response" } },
          // norml.paths["/v1/users"].get["application/json"][200].response
        // ), 
    // ["paths", "/api/v2/limited/special_booking_requests/{sbr_id}/hotel_options"]

    // console.log("dereferenced", 
    //   // show.serialize(
    //     openapi.fullyDereference({ document: norml })(["paths", "/v1/users/get/application/json/200"]),
    //     // "leuven",
    //   // )
    // )



  })
})
