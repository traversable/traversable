import { Weight } from "@traversable/openapi"
import * as vi from "vitest"

import { validator } from "@traversable/interpret"

const ex_01 = {
  type: "object",
  properties: {
    a: {
      type: "object",
      properties: {
        b: {
          type: "array",
          items: [
            { 
              type: "object", 
              properties: {
                c: { type: "number" },
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
                f: { type: "number" }
              }
            },
            { type: "object", properties: { g: { type: "number" } } }
          ]
        },
        h: { type: "number" },
      }
    }
  }
} as const

vi.describe("〖️⛳️〗‹‹‹ ❲@traversable/interpret/validator❳", () => {
  vi.it("〖️⛳️〗› ❲validator.derive❳", () => {
    vi.assert.equal(
      validator.derive.fold(ex_01).go([]),
      'let a = $;' +
      'if (!a || typeof a !== "object" || Array.isArray(a)) return false;' + 
      'let ab = a["b"];' +
      'if (!Array.isArray(ab)) return false;' +
      'let ab0=ab[0];' + 
      'if (!ab0 || typeof ab0 !== "object" || Array.isArray(ab0)) return false;' +
      'let ab0c = ab0["c"];' +
      'if(typeof ab0c !== "number") return false;' + 
      'if (!ab0 || typeof ab0 !== "object" || Array.isArray(ab0)) return false;' +
      'let ab0d = ab0["d"];' +
      'if(typeof ab0d !== "number") return false;' + 
      'if (!ab0 || typeof ab0 !== "object" || Array.isArray(ab0)) return false;' +
      'let ab0e = ab0["e"];' +
      'if (!Array.isArray(ab0e)) return false;' + 
      'let ab0e0=ab0e[0];' +
      'if (!Array.isArray(ab0e0)) return false;' + 
      'let ab0e00=ab0e0[0];' + 
      'if (!Array.isArray(ab0e00)) return false;' +
      'let ab0e000=ab0e00[0];' +
      'if (!ab0e000 || typeof ab0e000 !== "object" || Array.isArray(ab0e000)) return false;' +
      'let ab0e000f = ab0e000["f"];' +
      'if(typeof ab0e000f!=="string") return false;' +
      'if (!ab0e000 || typeof ab0e000 !== "object" || Array.isArray(ab0e000)) return false;' +
      'let ab0e000g = ab0e000["g"];' + 
      'if(typeof ab0e000g !== "boolean") return false;' +
      'if (!ab0 || typeof ab0 !== "object" || Array.isArray(ab0)) return false;' +
      'let ab0f = ab0["f"];' + 
      'if(typeof ab0f !== "number") return false;' +
      'if (!Array.isArray(ab)) return false;' + 
      'let ab1=ab[1];' +
      'if (!ab1 || typeof ab1 !== "object" || Array.isArray(ab1)) return false;' +
      'let ab1g = ab1["g"];' + 
      'if(typeof ab1g !== "number") return false;' +
      'if (!a || typeof a !== "object" || Array.isArray(a)) return false;' +
      'let ah = a["h"];' + 
      'if(typeof ah !== "number") return false;'
    )
  })

  /** @internal */
  const Object_entries = globalThis.Object.entries
  /** @internal */
  const Object_fromEntries = globalThis.Object.fromEntries

  const WeightMap = { ...Weight.byType, array: Weight.byType.object, object: Weight.byType.array }

  vi.it("〖️⛳️〗› ❲validator.derive ❳", () => {


  })
})
