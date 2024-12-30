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
      ["Z", { type: "string" }],
      ["Y", { type: "object", properties: {} }],
      ["X", { type: "object", properties: { xx_1: { type: "tuple", items: [{ type: "string", originalIndex: 0 }] } } }],
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
            "type": "boolean",
          },
        ],
        [
          "rTwo",
          {
            "type": "number",
          },
        ],
        [
          "rThree",
          {
            "properties": {
              "A": {
                "type": "null",
              },
              "B": {
                "type": "null",
              },
              "C": {
                "type": "null",
              },
            },
            "type": "object",
          },
        ],
        [
          "rFour",
          {
            "properties": {
              "A": {
                "type": "null",
              },
              "B": {
                "type": "null",
              },
              "C": {
                "type": "null",
              },
            },
            "type": "object",
          },
        ],
        [
          "rFive",
          {
            "properties": {
              "A": {
                "type": "null",
              },
              "B": {
                "type": "null",
              },
              "C": {
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
          "originalIndex": 1,
          "type": "null",
        },
        {
          "originalIndex": 0,
          "properties": {
            "rFive": {
              "properties": {
                "A": {
                  "type": "null",
                },
                "B": {
                  "type": "null",
                },
                "C": {
                  "type": "null",
                },
              },
              "type": "object",
            },
            "rFour": {
              "properties": {
                "A": {
                  "type": "null",
                },
                "B": {
                  "type": "null",
                },
                "C": {
                  "type": "null",
                },
              },
              "type": "object",
            },
            "rOne": {
              "type": "boolean",
            },
            "rThree": {
              "properties": {
                "A": {
                  "type": "null",
                },
                "B": {
                  "type": "null",
                },
                "C": {
                  "type": "null",
                },
              },
              "type": "object",
            },
            "rTwo": {
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
            "type": "null",
          },
        ],
        [
          "two",
          {
            "type": "boolean",
          },
        ],
        [
          "three",
          {
            "type": "boolean",
          },
        ],
        [
          "four",
          {
            "type": "integer",
          },
        ],
        [
          "five",
          {
            "type": "integer",
          },
        ],
        [
          "six",
          {
            "type": "number",
          },
        ],
        [
          "seven",
          {
            "type": "number",
          },
        ],
        [
          "eight",
          {
            "type": "string",
          },
        ],
        [
          "nine",
          {
            "type": "string",
          },
        ],
        [
          "ten",
          {
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
                    "properties": {},
                    "type": "object",
                  },
                  {
                    "allOf": [
                      {
                        "properties": {
                          "A": {
                            "items": {
                              "type": "null",
                            },
                            "type": "array",
                          },
                          "B": {
                            "items": {
                              "type": "boolean",
                            },
                            "type": "array",
                          },
                          "C": {
                            "items": {
                              "type": "string",
                            },
                            "type": "array",
                          },
                        },
                        "type": "object",
                      },
                    ],
                    "type": "allOf",
                  },
                ],
                "type": "anyOf",
              },
              "type": "record",
            },
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
                    "type": "null",
                  },
                  {
                    "properties": {},
                    "type": "object",
                  },
                  {
                    "allOf": [
                      {
                        "properties": {
                          "A": {
                            "items": {
                              "type": "null",
                            },
                            "type": "array",
                          },
                          "B": {
                            "items": {
                              "type": "boolean",
                            },
                            "type": "array",
                          },
                          "C": {
                            "items": {
                              "type": "string",
                            },
                            "type": "array",
                          },
                        },
                        "type": "object",
                      },
                    ],
                    "type": "allOf",
                  },
                ],
                "type": "anyOf",
              },
              "type": "record",
            },
            "type": "record",
          },
        ],
        [
          "thirteen",
          {
            "properties": {},
            "type": "object",
          },
        ],
        [
          "fourteen",
          {
            "properties": {
              "A": {
                "items": [
                  {
                    "originalIndex": 0,
                    "type": "string",
                  },
                ],
                "type": "tuple",
              },
            },
            "type": "object",
          },
        ],
        [
          "fifteen",
          {
            "properties": {
              "A": {
                "type": "null",
              },
              "B": {
                "type": "null",
              },
            },
            "type": "object",
          },
        ],
        [
          "sixteen",
          {
            "properties": {
              "A": {
                "type": "null",
              },
              "B": {
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
            "type": "tuple",
          },
        ],
        [
          "eighteen",
          {
            "items": [
              {
                "originalIndex": 1,
                "type": "null",
              },
              {
                "originalIndex": 0,
                "properties": {
                  "rFive": {
                    "properties": {
                      "A": {
                        "type": "null",
                      },
                      "B": {
                        "type": "null",
                      },
                      "C": {
                        "type": "null",
                      },
                    },
                    "type": "object",
                  },
                  "rFour": {
                    "properties": {
                      "A": {
                        "type": "null",
                      },
                      "B": {
                        "type": "null",
                      },
                      "C": {
                        "type": "null",
                      },
                    },
                    "type": "object",
                  },
                  "rOne": {
                    "type": "boolean",
                  },
                  "rThree": {
                    "properties": {
                      "A": {
                        "type": "null",
                      },
                      "B": {
                        "type": "null",
                      },
                      "C": {
                        "type": "null",
                      },
                    },
                    "type": "object",
                  },
                  "rTwo": {
                    "type": "number",
                  },
                },
                "type": "object",
              },
            ],
            "type": "tuple",
          },
        ],
        [
          "T",
          {
            "items": {
              "type": "null",
            },
            "type": "array",
          },
        ],
        [
          "U",
          {
            "items": {
              "type": "boolean",
            },
            "type": "array",
          },
        ],
      ]
    `)
  })
})
