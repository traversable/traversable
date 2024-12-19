import { core, fc, test } from "@traversable/core"
import * as vi from "vitest"

import { validator as V } from "@traversable/interpret"

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
                c: { type: "number" },
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
  vi.it("〖️⛳️〗› ❲validator.derive❳: ‹sanity› (highly-suspect)", () => {
    vi.assert.equal(
      V.derive(ex_01),
      'function($0$:any){if(!$0$||typeof $0$!=="object"||Array.isArray($0$))return false;let a=$0$["a"];if(!$0$||typeof $0$!=="object"||Array.isArray($0$))return false;let ah=$0$["h"];if(typeof ah!=="number")return false;if(!$0$||typeof $0$!=="object"||Array.isArray($0$))return false;let ab=$0$["b"];if(!Array.isArray($0$b))return false;let $0$b0=$0$b[0];if(!$0$0||typeof $0$0!=="object"||Array.isArray($0$0))return false;let $0$b0d=$0$0["d"];if(typeof $0$b0d!=="number")return false;if(!$0$0||typeof $0$0!=="object"||Array.isArray($0$0))return false;let $0$b0e=$0$0["e"];if(!Array.isArray($0$0e))return false;let $0$0e0=$0$0e[0];if(!Array.isArray($0$0))return false;let $0$00=$0$0[0];if(!Array.isArray($0$0))return false;let $0$00=$0$0[0];if(!$0$0||typeof $0$0!=="object"||Array.isArray($0$0))return false;let $0$00f=$0$0["f"];if(typeof $0$00f!=="string")return false;if(!$0$0||typeof $0$0!=="object"||Array.isArray($0$0))return false;let $0$00g=$0$0["g"];if(typeof $0$00g!=="boolean")return false;if(!$0$0||typeof $0$0!=="object"||Array.isArray($0$0))return false;let $0$b0c=$0$0["c"];if(typeof $0$b0c!=="number")return false;if(!$0$0||typeof $0$0!=="object"||Array.isArray($0$0))return false;let $0$b0f=$0$0["f"];if(typeof $0$b0f!=="number")return false;let $0$b1=$0$b[1];if(!$0$1||typeof $0$1!=="object"||Array.isArray($0$1))return false;let $0$b1g=$0$1["g"];if(typeof $0$b1g!=="number")return false;return true;}',
    )
  })
  
  vi.it("〖️⛳️〗› ❲validator.derive❳: ‹record› (example-based)", () => {
    vi.assert.equal(
      V.derive({ 
        type: "record", 
        additionalProperties: { type: "string" },
      }),
      'function($0$:any){if(!$0$||typeof $0$!=="object"||Array.isArray($0$))return false;let $k0=Object.keys($0$);for(let i=0;i<$k0.length;i++){let $1$=$0$[$k0[i]];if(typeof $1$!=="string")return false;}return true;}',
    )
    vi.assert.equal(
      V.derive({ 
        type: "record", 
        additionalProperties: { type: "record", additionalProperties: { type: "string" } },
      }),
      'function($0$:any){if(!$0$||typeof $0$!=="object"||Array.isArray($0$))return false;let $k0=Object.keys($0$);for(let i=0;i<$k0.length;i++){let $1$=$0$[$k0[i]];if(!$1$||typeof $1$!=="object"||Array.isArray($1$))return false;let $k1=Object.keys($1$);for(let i=0;i<$k1.length;i++){let $2$=$1$[$k1[i]];if(typeof $2$!=="string")return false;}}return true;}'
    )
  })

  vi.it("〖️⛳️〗› ❲validator.derive❳: ‹tuple› (example-based) recursively sorted for shortest path to failure", () => {
    vi.assert.equal(
      V.derive({ 
        type: "tuple", 
        items: [
          { type: "string" }, 
          { type: "array", items: { type: "integer" } }, 
          { type: "boolean" },
        ],
      }),
      'function($0$:any){if(!Array.isArray($0$))return false;let $0$2=$0$[2];if(typeof $0$2!=="boolean")return false;let $0$0=$0$[0];if(typeof $0$0!=="string")return false;let $0$1=$0$[1];if(!Array.isArray($0$1))return false;for(let i=0;i<$0$1.length;i++){let $1$1=$0$1[i];if(typeof $1$1!=="number")return false;}return true;}',
    )
  })

})

vi.describe("〖️⛳️〗‹‹‹ ❲@traversable/interpret/validator❳: records", () => {
  const RecordOfStringArrays = {
    type: "record", 
    additionalProperties: { type: "array", items: { type: "string" } },
  } as const
  const RecordOfStringArraysGenerated = V.derive(RecordOfStringArrays, {
    includeType: false,
    functionName: "strings"
  })

  const Case = {
    RecordOfStringArrays: {
      arbitrary: fc.dictionary(fc.array(fc.string())),
      generated: RecordOfStringArraysGenerated,
      validator: eval("(" + RecordOfStringArraysGenerated + ")"),
      oracle: core.is.recordOf(core.is.array(core.is.string)),
      expected
        : 'function strings($0$){'
        + 'if(!$0$||typeof $0$!=="object"||Array.isArray($0$))return false;' 
        + 'let $k0=Object.keys($0$);' 
        + 'for(let i=0;i<$k0.length;i++){'
        + 'let $1$=$0$[$k0[i]];' 
        + 'if(!Array.isArray($1$))return false;' 
        + 'for(let i=0;i<$1$.length;i++){'
        + 'let $2$=$1$[i];' 
        + 'if(typeof $2$!=="string")return false;' 
        + '}}return true;' 
        + '}'
      ,
    }
  }

  vi.it("〖️⛳️〗› ❲validator.derive❳: Record<Array<string>> (example-based)", () => {
    vi.assert.isTrue(Case.RecordOfStringArrays.validator({}))
    vi.assert.isTrue(Case.RecordOfStringArrays.validator({ hey: ["ho"] }))
    vi.assert.isFalse(Case.RecordOfStringArrays.validator([]))
    vi.assert.equal(
      Case.RecordOfStringArrays.generated,
      Case.RecordOfStringArrays.expected,
    )
  })

  test.prop(
    [Case.RecordOfStringArrays.arbitrary], 
    { 
      // numRuns: 100_000,
      examples: [[{ "a": [] }]],
    },
  )(
    "〖️⛳️〗› ❲validator.derive❳: Record<Array<string>> (arbitrary valid input)", 
    (array) => 
      Case.RecordOfStringArrays.validator(array)
  )

  test.prop(
    [fc.json()], 
    { 
      // numRuns: 100_000,
      examples: [[{}], [[]], [{ "$": [] }]],
    }
  )(
    "〖️⛳️〗› ❲validator.derive❳: Record<Array<string>> (arbitrary json input)", 
    (json) => vi.assert.equal(
      Case.RecordOfStringArrays.validator(json), 
      Case.RecordOfStringArrays.oracle(json),
    )
  )
})
