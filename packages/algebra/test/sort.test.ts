import * as vi from "vitest"

import { sort } from "@traversable/algebra"
import { type Traversable, show, tr as t } from "@traversable/core"

vi.describe("〖️⛳️〗‹‹‹ ❲@traversable/algebra/sort❳", () => {
  vi.it("〖️⛳️〗› ❲sort.deep❳", () => {

    const ex_01 = { 
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
    } satisfies Traversable.allOf
    // console.log("ex_01", show.serialize(ex_01, "leuven"))

    const ex_02 = t.allOf(
      t.object({
        C: t.array(t.string()),
      }),
      t.object({
        A: t.array(t.null()),
      }),
      t.object({
        B: t.array(t.boolean()),
      })
    )

    // console.log("ex_02", show.serialize(ex_02.toTraversable, 'leuven'))
  })
})

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
        /* 
        eleven: t.record(
          t.record(
            t.anyOf(
              t.object({}),
              t.allOf(
                t.object({
                  C: t.array(t.string()),
                  A: t.array(t.null()),
                  B: t.array(t.boolean()),
                })
              )
            )
          )
        ),
        three: t.boolean(),
        seven: t.number(),
        fourteen: t.object({
          A: t.tuple(t.string()),
        }),
        ten: t.string(),
        five: t.integer(),
        U: t.array(t.boolean()),
        T: t.array(t.null()),
        one: t.null(),
        thirteen: t.object({}),
        */
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
  })

  vi.it("〖️⛳️〗› ❲sort.deep❳: throws when applied to a non-object intersection", () => {
    vi.assert.throws(() => sort.derive()({
      type: "allOf", 
      allOf: [
        { type: "object", properties: {}, meta: {}, } ,
        { type: "string" },
      ],
      meta: {},
    }))

  })

})
