import * as vi from "vitest"

import { arbitrary as A } from "@traversable/algebra"

const ex_01 = {
  type: "object",
  required: ["a"],
  properties: {
    a: {
      type: "object",
      required: ["b"],
      properties: {
        b: {
          type: "array",
          items: [
            { 
              type: "object", 
              required: ["c", "d", "e", "f"],
              properties: {
                d: { type: "integer" },
                e: {
                  type: "array",
                  items: [
                    {
                      type: "array",
                      items: [
                        {
                          type: "array",
                          items: [ 
                            { 
                              type: "object", 
                              required: ["f", "g"],
                              properties: { 
                                f: { type: "string" }, 
                                g: { type: "boolean" } 
                              }
                            }
                          ]
                        }
                      ]
                    }
                  ]
                },
                c: { type: "number" },
                f: { type: "number" }
              }
            },
            { type: "object", required: ["g"], properties: { g: { type: "number" } } }
          ]
        },
        h: { type: "number" },
      }
    }
  }
} as const

vi.describe("〖️⛳️〗‹‹‹ ❲@traversable/algebra/arbitrary❳", () => {
  vi.it("〖️⛳️〗› ❲arbitrary.derive❳: ‹sanity› (highly-suspect)", () => {
    vi.assert.equal(
      A.generate()(ex_01),
      'const Arbitrary = fc.record({ ' + 
      'a: fc.record({ b: fc.tuple(fc.record({ d: fc.integer(), ' +
      'e: fc.tuple(fc.tuple(fc.tuple(fc.record({ f: fc.lorem(), ' +
      'g: fc.boolean() }, ' +
      '{ requiredKeys: ["f", "g"] })))), ' +
      'c: fc.float(), ' +
      'f: fc.float() }, ' +
      '{ requiredKeys: ["c", "d", "e", "f"] }), ' +
      'fc.record({ g: fc.float() }, ' +
      '{ requiredKeys: ["g"] })), ' +
      'h: fc.float() }, ' +
      '{ requiredKeys: ["b"] }) }, ' +
      '{ requiredKeys: ["a"] })',
    )
  })
  
  vi.it("〖️⛳️〗› ❲arbitrary.derive❳: ‹record› (example-based)", () => {
    vi.assert.equal(
      A.generate()({ 
        type: "record", 
        additionalProperties: { type: "string" },
      }),
      'const Arbitrary = fc.dictionary(fc.lorem(), fc.lorem())',
    )
    vi.assert.equal(
      A.generate()({ 
        type: "record", 
        additionalProperties: { type: "record", additionalProperties: { type: "string" } },
      }),
      'const Arbitrary = fc.dictionary(fc.lorem(), fc.dictionary(fc.lorem(), fc.lorem()))',
    )
  })

  vi.it("〖️⛳️〗› ❲arbitrary.derive❳: Tuple (example-based)", () => {
    vi.assert.equal(
      A.generate()({
        type: "tuple", 
        items: [
          { type: "string" }, 
          { type: "array", items: { type: "integer" } }, 
          { type: "boolean" },
        ],
      }),
      'const Arbitrary = fc.tuple(fc.lorem(), fc.array(fc.integer()), fc.boolean())',
    )
  })
})
