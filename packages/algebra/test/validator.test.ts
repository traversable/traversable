import { core, fc, show, test, tree } from "@traversable/core"
import * as vi from "vitest"

import { arbitrary as Arbitrary, validator as Validator, arbitrary } from "@traversable/algebra"
import { fn } from "@traversable/data"

const defineCase = <K extends keyof Schema, const T extends {}>(schemaKey: K, meta: T = {} as never) => {
  return {
    arbitrary: Arbitrary.derive.fold()(Schema[schemaKey]),
    validator: Validator.derive(Schema[schemaKey], { jitCompile: true }),
    ...meta,
  }
}

type Schema = typeof Schema
const Schema = {
  Deep: {
    type: "object",
    required: [],
    properties: {
      a: {
        type: "object",
        required: [],
        properties: {
          b: {
            type: "array",
            items: [
              { 
                type: "object", 
                required: [],
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
  },
  Intersection: {
    allOf: [
      { type: "object", properties: { abc: { type: "boolean" } }, required: ["abc"] },
      { type: "object", properties: { def: { type: "boolean" } } },
    ]
  },
  Record: {
    type: "record", 
    additionalProperties: { type: "string" },
  },
  RecordOfStrings: {
    type: "record", 
    additionalProperties: { type: "array", items: { type: "string" } },
  },
  RecordOfRecords: { 
    type: "record", 
    additionalProperties: { type: "record", additionalProperties: { type: "string" } },
  },
  Tuple: { 
    type: "tuple", 
    items: [
      { type: "string" }, 
      { type: "array", items: { type: "integer" } }, 
      { type: "boolean" },
    ],
  },
} as const

const Case = {
  Intersection: defineCase("Intersection", {
    oracle: core.and(
      tree.has("abc", core.is.boolean), 
      (u: unknown): u is { def?: boolean } => {
        if (u !== null && typeof u === "object" && "def" in u) {
          return typeof u.def === "boolean"
        } else return u !== null && typeof u === "object"
      }
    ),
    expected: ''
    + '(function($0$){if(!$0$||typeof $0$!=="object"||Array.isArray($0$))return false;'
    + 'let $0$abc=$0$["abc"];'
    + 'if(typeof $0$abc!=="boolean")return false;'
    + 'if(!$0$||typeof $0$!=="object"||Array.isArray($0$))return false;'
    + 'let $0$def=$0$["def"];'
    + 'if($0$def!==undefined&&typeof $0$def!=="boolean")return false;'
    + 'return true;'
    + '})',
  }),
  Record: defineCase("Record", {
    oracle: core.is.record(core.is.string),
    expected: ''
    + '(function($0$){if(!$0$||typeof $0$!=="object"||Array.isArray($0$))return false;'
    + 'let $k0=Object.keys($0$);'
    + 'for(let i=0;'
    + 'i<$k0.length;'
    + 'i++){let $1$=$0$[$k0[i]];'
    + 'if(typeof $1$!=="string")return false;'
    + '}return true;'
    + '})'
  }),
  RecordOfRecords: defineCase("RecordOfRecords", {
    oracle: core.is.record(core.is.record(core.is.string)),
    expected: ''
    + '(function($0$){if(!$0$||typeof $0$!=="object"||Array.isArray($0$))return false;'
    + 'let $k0=Object.keys($0$);'
    + 'for(let i=0;'
    + 'i<$k0.length;'
    + 'i++){let $1$=$0$[$k0[i]];'
    + 'if(!$1$||typeof $1$!=="object"||Array.isArray($1$))return false;'
    + 'let $k1=Object.keys($1$);'
    + 'for(let i=0;'
    + 'i<$k1.length;'
    + 'i++){let $2$=$1$[$k1[i]];'
    + 'if(typeof $2$!=="string")return false;'
    + '}}return true;'
    + '})',
  }),
  RecordOfStrings: defineCase("RecordOfStrings", {
    oracle: core.is.record(core.is.array(core.is.string)),
    expected: ''
    + '(function($0$){if(!$0$||typeof $0$!=="object"||Array.isArray($0$))return false;'
    + 'let $k0=Object.keys($0$);'
    + 'for(let i=0;'
    + 'i<$k0.length;'
    + 'i++){let $1$=$0$[$k0[i]];'
    + 'if(!Array.isArray($1$))return false;'
    + 'for(let i=0;'
    + 'i<$1$.length;'
    + 'i++){let $2$=$1$[i];'
    + 'if(typeof $2$!=="string")return false;'
    + '}}return true;'
    + '})',
  }),
  Tuple: defineCase("Tuple", {
    oracle: core.is.tuple(core.is.string, core.is.array(core.is.integer), core.is.boolean),
    expected: ''
    + '(function($0$){if(!Array.isArray($0$))return false;'
    + 'let $0$2=$0$[2];'
    + 'if(typeof $0$2!=="boolean")return false;'
    + 'let $0$0=$0$[0];'
    + 'if(typeof $0$0!=="string")return false;'
    + 'let $0$1=$0$[1];'
    + 'if(!Array.isArray($0$1))return false;'
    + 'for(let i=0;'
    + 'i<$0$1.length;'
    + 'i++){let $1$1=$0$1[i];'
    + 'if(!Number.isInteger($1$1))return false;'
    + '}return true;'
    + '})',
  }),
  Deep: defineCase("Deep", {
    expected: ''
    + '(function($0$){if(!$0$||typeof $0$!=="object"||Array.isArray($0$))return false;'
    + 'let $0$a=$0$["a"];'
    + 'if($0$a!==undefined){if(typeof $0$a!=="object"||Array.isArray($0$a))return false;'
    + 'let $0$ah=$0$a["h"];'
    + 'if($0$ah!==undefined&&typeof $0$ah!=="number")return false;'
    + 'let $0$ab=$0$a["b"];'
    + 'if($0$ab!==undefined){if(!Array.isArray($0$ab))return false;'
    + 'let $0$ab0=$0$ab[0];'
    + 'if(!$0$ab0||typeof $0$ab0!=="object"||Array.isArray($0$ab0))return false;'
    + 'let $0$ab0d=$0$ab0["d"];'
    + 'if($0$ab0d!==undefined&&!Number.isInteger($0$ab0d))return false;'
    + 'let $0$ab0e=$0$ab0["e"];'
    + 'if($0$ab0e!==undefined){if(!Array.isArray($0$ab0e))return false;'
    + 'let $0$ab0e0=$0$ab0e[0];'
    + 'if(!Array.isArray($0$ab0e0))return false;'
    + 'let $0$ab0e00=$0$ab0e0[0];'
    + 'if(!Array.isArray($0$ab0e00))return false;'
    + 'let $0$ab0e000=$0$ab0e00[0];'
    + 'if(!$0$ab0e000||typeof $0$ab0e000!=="object"||Array.isArray($0$ab0e000))return false;'
    + 'let $0$ab0e000f=$0$ab0e000["f"];'
    + 'if(typeof $0$ab0e000f!=="string")return false;'
    + 'let $0$ab0e000g=$0$ab0e000["g"];'
    + 'if(typeof $0$ab0e000g!=="boolean")return false;'
    + '}let $0$ab0c=$0$ab0["c"];'
    + 'if($0$ab0c!==undefined&&typeof $0$ab0c!=="number")return false;'
    + 'let $0$ab0f=$0$ab0["f"];'
    + 'if($0$ab0f!==undefined&&typeof $0$ab0f!=="number")return false;'
    + 'let $0$ab1=$0$ab[1];'
    + 'if(!$0$ab1||typeof $0$ab1!=="object"||Array.isArray($0$ab1))return false;'
    + 'let $0$ab1g=$0$ab1["g"];'
    + 'if(typeof $0$ab1g!=="number")return false;'
    + '}}return true;'
    + '})'
  }),
} as const

vi.describe("〖️⛳️〗‹‹‹ ❲@traversable/algebra/validator❳", () => {
  vi.it("〖️⛳️〗› ❲validator.derive❳: Deep", () => {
    vi.assert.equal(
      Case.Deep.validator,
      Case.Deep.expected,
    )
  })
  vi.it("〖️⛳️〗› ❲validator.derive❳: &", () => {
    vi.assert.equal(
      Case.Intersection.validator,
      Case.Intersection.expected,
    )
  })
  vi.it("〖️⛳️〗› ❲validator.derive❳: Record<string, string>", () => {
    vi.assert.equal(
      Case.Record.validator,
      Case.Record.expected,
    )
  })
  vi.it("〖️⛳️〗› ❲validator.derive❳: Record<string, Record<string, string>>", () => {
    vi.assert.equal(
      Case.RecordOfRecords.validator,
      Case.RecordOfRecords.expected,
    )
  })
  vi.it("〖️⛳️〗› ❲validator.derive❳: Record<string, string[]>", () => {
    vi.assert.equal(
      Case.RecordOfStrings.validator,
      // '' 
      Case.RecordOfStrings.expected,
    )
  })
  vi.it("〖️⛳️〗› ❲validator.derive❳: [string, number[], boolean] (fail-fast deep sort optimization)", () => {
    vi.assert.equal(
      Case.Tuple.validator,
      Case.Tuple.expected,
    )
  })
})

vi.describe("〖️⛳️〗‹‹‹ ❲@traversable/algebra/validator❳: property-based tests", () => {
  test.prop([Case.Deep.arbitrary], { /* numRuns: 100_000, */ examples: [[{"a":{}}] ] })(
    "〖️⛳️〗› ❲validator.derive❳: Deep", //(deep) => {
    fn.flow(
      eval(Case.Deep.validator),
      vi.assert.isTrue,
    )
  )
  test.prop([Case.Intersection.arbitrary], { /* numRuns: 100_000, */ examples: [] })(
    "〖️⛳️〗› ❲validator.derive❳: &", 
    fn.flow(
      eval(Case.Intersection.validator),
      vi.assert.isTrue,
    )
  )
  test.prop([Case.Record.arbitrary], { /* numRuns: 100_000, */ examples: [] })(
    "〖️⛳️〗› ❲validator.derive❳: Record<string, string>", 
    fn.flow(
      eval(Case.Record.validator), 
      vi.assert.isTrue,
    )
  )
  test.prop([Case.RecordOfStrings.arbitrary], { /* numRuns: 100_000, */ examples: [[{ "a": [] }]] })(
    "〖️⛳️〗› ❲validator.derive❳: Record<string, string[]>", 
    fn.flow(
      eval(Case.RecordOfStrings.validator), 
      vi.assert.isTrue,
    )
  )
  test.prop([Case.RecordOfRecords.arbitrary], { /* numRuns: 100_000, */ examples: [] })(
    "〖️⛳️〗› ❲validator.derive❳: Record<string, Record<string, string>>", 
    fn.flow(
      eval(Case.RecordOfRecords.validator), 
      vi.assert.isTrue,
    )
  )
  test.prop([Case.Tuple.arbitrary], { /* numRuns: 100_000, */ examples: [] })(
    "〖️⛳️〗› ❲validator.derive❳: Record<string, Record<string, string>>", 
    fn.flow(
      eval(Case.Tuple.validator), 
      vi.assert.isTrue,
    )
  )
})

  // test.prop([fc.json()], { /* numRuns: 100_000, */ examples: [[{}], [[]], [{ "$": [] }]] })(
  //   "〖️⛳️〗› ❲validator.derive❳: parity with oracle given arbitrary JSON input", (json) => 
  //   vi.assert.equal(
  //     eval(Case.RecordOfStrings.validator)(json), 
  //     Case.RecordOfStrings.oracle(json),
  //   )
  // )
