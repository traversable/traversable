import * as vi from "vitest"

import { sort } from "@traversable/algebra"
import type { Traversable } from "@traversable/core"

vi.describe("〖️⛳️〗‹‹‹ ❲@traversable/algebra/sort❳", () => {
  vi.it("〖️⛳️〗› ❲sort.deep❳", () => {
    const sortFn = sort.derive()
    const input_00 = {
      type: "object", 
      properties: {
        Z: { type: "string", meta: {} }, 
        V: { type: "object", properties: { vv_2: { type: "string", meta: {} }, vv_1: { type: "null" } } },
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
    } as const satisfies Traversable

    const expected_01: [string, unknown][] = [
      ["Z", { type: "string", meta: {} }],
      ["Y", { type: "object", properties: {} }],
      ["X", { type: "object", properties: { xx_1: { type: "tuple", items: [{ type: "string", originalIndex: 0 }] } } }],
      ["W", { type: "object", properties: { ww_1: { type: "null" }, ww_2: { type: "null" } } }],
      ["V", { type: "object", properties: { vv_1: { type: "null" }, vv_2: { type: "string", meta: {} } } }],
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
      ["vv_2", { type: "string", meta: {} }],
    ]

    vi.assert.notDeepEqual(actual_02, input_02)
    vi.assert.deepEqual(actual_02, expected_02)
  })

  vi.it("〖️⛳️〗› ❲sort.deep❳: sort is stable", () => {
    const actual_03 = sort.derive()({
      type: "object", 
      properties: {
        six: { type: "number", meta: {} }, 
        four: { type: "integer", meta: {} },
        eighteen: { 
          type: "tuple", 
          items: [
            { 
              type: "object", 
              properties: { 
                rThree: { type: "object", properties: { B: { type: "null", meta: {} }, C: { type: "null", meta: {} }, A: { type: "null", meta: {} } }, meta: {} }, 
                rTwo: { type: "number", meta: {} }, 
                rFour: { type: "object", properties: { A: { type: "null", meta: {} }, B: { type: "null", meta: {} }, C: { type: "null", meta: {} } }, meta: {} },
                rOne: { type: "boolean", meta: {} }, 
                rFive: { type: "object", properties: { C: { type: "null", meta: {} }, A: { type: "null", meta: {} }, B: { type: "null", meta: {} } }, meta: {} }, 
              },
              meta: {},
            },
            { type: "null", meta: {} },
          ],
          meta: {},
        },
        seventeen: { type: "tuple", items: [], meta: {} },
        eight: { type: "string", meta: {} }, 
        fifteen: { type: "object", properties: { A: { type: "null", meta: {} }, B: { type: "null", meta: {} } }, meta: {} },
        nine: { type: "string", meta: {} }, 
        two: { type: "boolean", meta: {} }, 
        sixteen: { type: "object", properties: { B: { type: "null", meta: {} }, A: { type: "null", meta: {} } }, meta: {} },
        twelve: { 
          type: "record", 
          additionalProperties: {
            type: "record",
            additionalProperties: {
              type: "anyOf",
              anyOf: [
                { type: "object", properties: {}, meta: {} },
                { type: "null", meta: {} },
                { 
                  type: "allOf", 
                  allOf: [
                    { 
                      type: "object", 
                      properties: { 
                        C: { type: "array", items: { type: "string", meta: {} }, meta: {} }, 
                        A: { type: "array", items: { type: "null", meta: {} }, meta: {} }, 
                        B: { type: "array", items: { type: "boolean", meta: {} }, meta: {} }, 
                      },
                      meta: {},
                    }
                  ],
                  meta: {},
                }
              ], 
              meta: {},
            },
            meta: {},
          },
          meta: {},
        },
        eleven: { 
          type: "record", 
          additionalProperties: {
            type: "record",
            additionalProperties: {
              type: "anyOf",
              anyOf: [
                { type: "object", properties: {}, meta: {} },
                { 
                  type: "allOf", 
                  allOf: [
                    { 
                      type: "object", 
                      properties: { 
                        C: { type: "array", items: { type: "string", meta: {} }, meta: {} }, 
                        A: { type: "array", items: { type: "null", meta: {} }, meta: {} }, 
                        B: { type: "array", items: { type: "boolean", meta: {} }, meta: {} }, 
                      }, 
                      meta: {},
                    }
                  ],
                  meta: {},
                }
              ], 
              meta: {},
            },
            meta: {},
          },
          meta: {},
        },
        three: { type: "boolean", meta: {} },
        seven: { type: "number", meta: {} }, 
        fourteen: {
          type: "object", 
          properties: {
            A: { 
              type: "tuple", 
              items: [{ type: "string", meta: {} }],
              meta: {},
            }
          },
          meta: {},
        }, 
        ten: { type: "string", meta: {} }, 
        five: { type: "integer", meta: {} },
        U: { type: "array", items: { type: "boolean", meta: {} }, meta: {} },
        T: { type: "array", items: { type: "null", meta: {} }, meta: {} },
        one: { type: "null", meta: {} },
        thirteen: { type: "object", properties: {}, meta: {} },
      },
      meta: {},
    })
    vi.expect(Object.entries((actual_03.properties.eighteen.items[1] as any).properties)).toMatchInlineSnapshot(`
      [
        [
          "rOne",
          {
            "meta": {},
            "type": "boolean",
          },
        ],
        [
          "rTwo",
          {
            "meta": {},
            "type": "number",
          },
        ],
        [
          "rThree",
          {
            "meta": {},
            "properties": {
              "A": {
                "meta": {},
                "type": "null",
              },
              "B": {
                "meta": {},
                "type": "null",
              },
              "C": {
                "meta": {},
                "type": "null",
              },
            },
            "type": "object",
          },
        ],
        [
          "rFour",
          {
            "meta": {},
            "properties": {
              "A": {
                "meta": {},
                "type": "null",
              },
              "B": {
                "meta": {},
                "type": "null",
              },
              "C": {
                "meta": {},
                "type": "null",
              },
            },
            "type": "object",
          },
        ],
        [
          "rFive",
          {
            "meta": {},
            "properties": {
              "A": {
                "meta": {},
                "type": "null",
              },
              "B": {
                "meta": {},
                "type": "null",
              },
              "C": {
                "meta": {},
                "type": "null",
              },
            },
            "type": "object",
          },
        ],
      ]
    `)
    vi.expect(actual_03.properties.eighteen.items).toMatchInlineSnapshot(`
      [
        {
          "meta": {},
          "originalIndex": 1,
          "type": "null",
        },
        {
          "meta": {},
          "originalIndex": 0,
          "properties": {
            "rFive": {
              "meta": {},
              "properties": {
                "A": {
                  "meta": {},
                  "type": "null",
                },
                "B": {
                  "meta": {},
                  "type": "null",
                },
                "C": {
                  "meta": {},
                  "type": "null",
                },
              },
              "type": "object",
            },
            "rFour": {
              "meta": {},
              "properties": {
                "A": {
                  "meta": {},
                  "type": "null",
                },
                "B": {
                  "meta": {},
                  "type": "null",
                },
                "C": {
                  "meta": {},
                  "type": "null",
                },
              },
              "type": "object",
            },
            "rOne": {
              "meta": {},
              "type": "boolean",
            },
            "rThree": {
              "meta": {},
              "properties": {
                "A": {
                  "meta": {},
                  "type": "null",
                },
                "B": {
                  "meta": {},
                  "type": "null",
                },
                "C": {
                  "meta": {},
                  "type": "null",
                },
              },
              "type": "object",
            },
            "rTwo": {
              "meta": {},
              "type": "number",
            },
          },
          "type": "object",
        },
      ]
    `)

    vi.expect(Object.entries(actual_03.properties)).toMatchInlineSnapshot(`
      [
        [
          "one",
          {
            "meta": {},
            "type": "null",
          },
        ],
        [
          "two",
          {
            "meta": {},
            "type": "boolean",
          },
        ],
        [
          "three",
          {
            "meta": {},
            "type": "boolean",
          },
        ],
        [
          "four",
          {
            "meta": {},
            "type": "integer",
          },
        ],
        [
          "five",
          {
            "meta": {},
            "type": "integer",
          },
        ],
        [
          "six",
          {
            "meta": {},
            "type": "number",
          },
        ],
        [
          "seven",
          {
            "meta": {},
            "type": "number",
          },
        ],
        [
          "eight",
          {
            "meta": {},
            "type": "string",
          },
        ],
        [
          "nine",
          {
            "meta": {},
            "type": "string",
          },
        ],
        [
          "ten",
          {
            "meta": {},
            "type": "string",
          },
        ],
        [
          "eleven",
          {
            "additionalProperties": {
              "additionalProperties": {
                "anyOf": [
                  {
                    "meta": {},
                    "properties": {},
                    "type": "object",
                  },
                  {
                    "allOf": [
                      {
                        "meta": {},
                        "properties": {
                          "A": {
                            "items": {
                              "meta": {},
                              "type": "null",
                            },
                            "meta": {},
                            "type": "array",
                          },
                          "B": {
                            "items": {
                              "meta": {},
                              "type": "boolean",
                            },
                            "meta": {},
                            "type": "array",
                          },
                          "C": {
                            "items": {
                              "meta": {},
                              "type": "string",
                            },
                            "meta": {},
                            "type": "array",
                          },
                        },
                        "type": "object",
                      },
                    ],
                    "meta": {},
                    "type": "allOf",
                  },
                ],
                "meta": {},
                "type": "anyOf",
              },
              "meta": {},
              "type": "record",
            },
            "meta": {},
            "type": "record",
          },
        ],
        [
          "twelve",
          {
            "additionalProperties": {
              "additionalProperties": {
                "anyOf": [
                  {
                    "meta": {},
                    "type": "null",
                  },
                  {
                    "meta": {},
                    "properties": {},
                    "type": "object",
                  },
                  {
                    "allOf": [
                      {
                        "meta": {},
                        "properties": {
                          "A": {
                            "items": {
                              "meta": {},
                              "type": "null",
                            },
                            "meta": {},
                            "type": "array",
                          },
                          "B": {
                            "items": {
                              "meta": {},
                              "type": "boolean",
                            },
                            "meta": {},
                            "type": "array",
                          },
                          "C": {
                            "items": {
                              "meta": {},
                              "type": "string",
                            },
                            "meta": {},
                            "type": "array",
                          },
                        },
                        "type": "object",
                      },
                    ],
                    "meta": {},
                    "type": "allOf",
                  },
                ],
                "meta": {},
                "type": "anyOf",
              },
              "meta": {},
              "type": "record",
            },
            "meta": {},
            "type": "record",
          },
        ],
        [
          "thirteen",
          {
            "meta": {},
            "properties": {},
            "type": "object",
          },
        ],
        [
          "fourteen",
          {
            "meta": {},
            "properties": {
              "A": {
                "items": [
                  {
                    "meta": {},
                    "originalIndex": 0,
                    "type": "string",
                  },
                ],
                "meta": {},
                "type": "tuple",
              },
            },
            "type": "object",
          },
        ],
        [
          "fifteen",
          {
            "meta": {},
            "properties": {
              "A": {
                "meta": {},
                "type": "null",
              },
              "B": {
                "meta": {},
                "type": "null",
              },
            },
            "type": "object",
          },
        ],
        [
          "sixteen",
          {
            "meta": {},
            "properties": {
              "A": {
                "meta": {},
                "type": "null",
              },
              "B": {
                "meta": {},
                "type": "null",
              },
            },
            "type": "object",
          },
        ],
        [
          "seventeen",
          {
            "items": [],
            "meta": {},
            "type": "tuple",
          },
        ],
        [
          "eighteen",
          {
            "items": [
              {
                "meta": {},
                "originalIndex": 1,
                "type": "null",
              },
              {
                "meta": {},
                "originalIndex": 0,
                "properties": {
                  "rFive": {
                    "meta": {},
                    "properties": {
                      "A": {
                        "meta": {},
                        "type": "null",
                      },
                      "B": {
                        "meta": {},
                        "type": "null",
                      },
                      "C": {
                        "meta": {},
                        "type": "null",
                      },
                    },
                    "type": "object",
                  },
                  "rFour": {
                    "meta": {},
                    "properties": {
                      "A": {
                        "meta": {},
                        "type": "null",
                      },
                      "B": {
                        "meta": {},
                        "type": "null",
                      },
                      "C": {
                        "meta": {},
                        "type": "null",
                      },
                    },
                    "type": "object",
                  },
                  "rOne": {
                    "meta": {},
                    "type": "boolean",
                  },
                  "rThree": {
                    "meta": {},
                    "properties": {
                      "A": {
                        "meta": {},
                        "type": "null",
                      },
                      "B": {
                        "meta": {},
                        "type": "null",
                      },
                      "C": {
                        "meta": {},
                        "type": "null",
                      },
                    },
                    "type": "object",
                  },
                  "rTwo": {
                    "meta": {},
                    "type": "number",
                  },
                },
                "type": "object",
              },
            ],
            "meta": {},
            "type": "tuple",
          },
        ],
        [
          "T",
          {
            "items": {
              "meta": {},
              "type": "null",
            },
            "meta": {},
            "type": "array",
          },
        ],
        [
          "U",
          {
            "items": {
              "meta": {},
              "type": "boolean",
            },
            "meta": {},
            "type": "array",
          },
        ],
      ]
    `)
  })
})
