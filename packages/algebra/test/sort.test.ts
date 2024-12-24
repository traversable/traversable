import * as vi from "vitest"

import { type Ext, type Ltd, sort } from "@traversable/algebra"

vi.describe("〖️⛳️〗‹‹‹ ❲@traversable/algebra/sort❳", () => {
  vi.it("〖️⛳️〗› ❲sort.deep❳", () => {
    const sortFn = sort.derive()
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
        six: { type: "number" }, 
        four: { type: "integer" },
        eighteen: { 
          type: "tuple", 
          items: [
            { 
              type: "object", 
              properties: { 
                rThree: { type: "object", properties: { B: { type: "null" }, C: { type: "null" }, A: { type: "null" } } }, 
                rTwo: { type: "number" }, 
                rFour: { type: "object", properties: { A: { type: "null" }, B: { type: "null" }, C: { type: "null" } } }, 
                rOne: { type: "boolean" }, 
                rFive: { type: "object", properties: { C: { type: "null" }, A: { type: "null" }, B: { type: "null" } } }, 
              } 
            },
            { type: "null" },
          ] 
        },
        seventeen: { type: "tuple", items: [] },
        eight: { type: "string" }, 
        fifteen: { type: "object", properties: { A: { type: "null" }, B: { type: "null" } } },
        nine: { type: "string" }, 
        two: { type: "boolean" }, 
        sixteen: { type: "object", properties: { B: { type: "null" }, A: { type: "null" } } },
        twelve: { 
          type: "record", 
          additionalProperties: { 
            type: "record",
            additionalProperties: {
              type: "anyOf",
              anyOf: [
                { type: "object", properties: {} },
                { type: "null" },
                { 
                  type: "allOf", 
                  allOf: [
                    { 
                      type: "object", 
                      properties: { 
                        C: { type: "array", items: { type: "string" } }, 
                        A: { type: "array", items: { type: "null" } }, 
                        B: { type: "array", items: { type: "boolean" } }, 
                      } 
                    }
                  ]
                }
              ] 
            }
          },
        },
        eleven: { 
          type: "record", 
          additionalProperties: { 
            type: "record",
            additionalProperties: {
              type: "anyOf",
              anyOf: [
                { type: "object", properties: {} },
                { 
                  type: "allOf", 
                  allOf: [
                    { 
                      type: "object", 
                      properties: { 
                        C: { type: "array", items: { type: "string" } }, 
                        A: { type: "array", items: { type: "null" } }, 
                        B: { type: "array", items: { type: "boolean" } }, 
                      } 
                    }
                  ] 
                }
              ] 
            }
          },
        },
        three: { type: "boolean" },
        seven: { type: "number" }, 
        fourteen: {
          type: "object", 
          properties: { 
            A: { 
              type: "tuple", 
              items: [{ type: "string" }]
            } 
          } 
        }, 
        ten: { type: "string" }, 
        five: { type: "integer" },
        U: { type: "array", items: { type: "boolean" } },
        T: { type: "array", items: { type: "null" } },
        one: { type: "null" },
        thirteen: { type: "object", properties: {} },
      }
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
