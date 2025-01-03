import { array$, core, fc, is, object$, optional$, record$, show, t, test, tree, tuple$ } from "@traversable/core"
import { configure, type } from "arktype"
import * as vi from "vitest"

import { arbitrary as Arbitrary, validator as Validator } from "@traversable/algebra"
import { fn } from "@traversable/data"

configure({

})

const strict = { 
  flags: { 
    jitCompile: true, 
    treatArraysLikeObjects: false 
  } 
} satisfies Validator.Options

const lax = { 
  flags: { 
    jitCompile: true, 
    treatArraysLikeObjects: true 
  } 
} satisfies Validator.Options

vi.describe("〖️⛳️〗‹‹‹ ❲@traversable/algebra/validator❳", () => {
  const EXPECT_FAIL = Symbol()

  vi.test("t.null", () => {
    vi.assert.isTrue(t.null().is(null))
    vi.assert.isFalse(t.number().is(EXPECT_FAIL))
    vi.assert.isFalse(t.number().is(undefined))
  })

  vi.test("t.boolean", () => {
    vi.assert.isTrue(t.boolean().is(true))
    vi.assert.isTrue(t.boolean().is(false))
    vi.assert.isFalse(t.boolean().is(EXPECT_FAIL))
    vi.assert.isFalse(t.boolean().is(0))
    vi.assert.isFalse(t.boolean().is(""))
    vi.assert.isFalse(t.boolean().is(undefined))
  })

  vi.test("t.integer", () => {
    vi.assert.isTrue(t.integer().is(1))
    vi.assert.isTrue(t.integer().is(-0))
    vi.assert.isTrue(t.integer().is(0))
    vi.assert.isTrue(t.integer().is(0x00))
    vi.assert.isTrue(t.integer().is(1e+29))
    vi.assert.isTrue(t.integer().is(-1e+29))
    ///
    vi.assert.isFalse(t.integer().is(EXPECT_FAIL))
    vi.assert.isFalse(t.integer().is(2.1))
    vi.assert.isFalse(t.integer().is(undefined))
  })

  vi.test("t.number", () => {
    vi.assert.isTrue(t.number().is(1))
    vi.assert.isTrue(t.number().is(-0))
    vi.assert.isTrue(t.number().is(0))
    vi.assert.isTrue(t.number().is(0x00))
    vi.assert.isTrue(t.number().is(1e+29))
    vi.assert.isTrue(t.number().is(-1e+29))
    vi.assert.isTrue(t.number().is(2.1))
    ///
    vi.assert.isFalse(t.number().is(EXPECT_FAIL))
    vi.assert.isFalse(t.number().is(undefined))
    vi.assert.isFalse(t.number().is(new globalThis.Number(1)))
  })

  vi.test("t.string", () => {
    vi.assert.isTrue(t.string().is(""))
    vi.assert.isTrue(t.string().is(" "))
    vi.assert.isTrue(t.string().is("abc"))
    vi.assert.isTrue(t.string().is("0"))
    ///
    vi.assert.isFalse(t.string().is(EXPECT_FAIL))
    vi.assert.isFalse(t.string().is(new globalThis.String("")))
    vi.assert.isFalse(t.string().is(undefined))
  })

  vi.test("t.array", () => {
    vi.assert.isTrue(t.array(t.null()).is([]))
    vi.assert.isTrue(t.array(t.null()).is([null]))
    vi.assert.isTrue(t.array(t.null()).is([null, null]))
    vi.assert.isTrue(t.array(t.array(t.any())).is([[]]))
    vi.assert.isTrue(t.array(t.array(t.any())).is([[[]]]))
    ///
    vi.assert.isFalse(t.optional(t.string()).is(EXPECT_FAIL))
    vi.assert.isFalse(t.array(t.array(t.any())).is([[], 0]))
    vi.assert.isFalse(t.array(t.array(t.any())).is([0, []]))
    vi.assert.isFalse(t.array(t.null()).is(null))
    vi.assert.isFalse(t.array(t.null()).is({ 0: null}))
    vi.assert.isFalse(t.array(t.null()).is([0, null]))
    vi.assert.isFalse(t.array(t.null()).is([null, 0]))
    vi.assert.isFalse(t.array(t.null()).is([null, 0, null]))
  })

  vi.test("t.object", () => {
    vi.assert.isTrue(t.object({}).is({}))
    vi.assert.isTrue(t.object(Object.create(null)).is({}))
    vi.assert.isTrue(t.object({}).is(Object.create(null)))
    vi.assert.isTrue(t.object({ a: t.integer() }).is({ a: 0 }))
    vi.assert.isTrue(t.object({}).is([]))
    ///
    vi.assert.isFalse(t.object({}).is(EXPECT_FAIL))
    vi.assert.isFalse(t.object({ a: t.integer() }).is({}))
    vi.assert.isFalse(t.object({ a: t.integer() }).is({ a: "0" }))
  })

  vi.test("t.optional", () => {
    vi.assert.isTrue(t.optional(t.null()).is(null))
    vi.assert.isTrue(t.object({ a: t.optional(t.number())}).is({}))
    vi.assert.isTrue(t.object({ a: t.optional(t.number())}).is({ a: 0 }))
    vi.assert.isTrue(t.object({ a: t.optional(t.number())}).is({ a: undefined }))
    ///
    vi.assert.isFalse(t.optional(t.string()).is(EXPECT_FAIL))
    vi.assert.isFalse(t.object({ a: t.optional(t.number())}).is({ a: null }))
    vi.assert.isFalse(t.object({ a: t.optional(t.number())}).is({ a: "" }))

    const ex_01 = t.object({ 
      a: t.optional(t.number()), 
      b: t.optional(
        t.object({ 
          c: t.optional(t.boolean()) 
        })
      ) 
    }).is

    vi.assert.isTrue(ex_01({ a: undefined }))
    vi.assert.isTrue(ex_01({ b: undefined }))
    vi.assert.isTrue(ex_01({ a: undefined, b: undefined }))
    vi.assert.isTrue(ex_01({ a: 0, b: { c: true } }))
    vi.assert.isTrue(ex_01({ b: { c: undefined } }))
    vi.assert.isTrue(ex_01({ a: undefined, b: { c: false } }))
    ///
    vi.assert.isFalse(ex_01({ a: 0, b: { c: "false" } }))
    vi.assert.isFalse(ex_01({ a: "0", b: { c: true } }))
  })

  vi.test("t.const", () => {
    vi.assert.isTrue(t.const(1).is(1))
    vi.assert.isTrue(t.const("hey").is("hey"))
    vi.assert.isTrue(t.object({ a: t.const("hey") }).is({ a: "hey" }))
    vi.assert.isTrue(t.object({ a: t.optional(t.const("hey")) }).is({ a: "hey" }))
    vi.assert.isTrue(t.object({ a: t.optional(t.const("hey")) }).is({ a: undefined }))
    vi.assert.isTrue(t.object({ a: t.optional(t.const("hey")) }).is({}))
    vi.assert.isFalse(t.object({ a: t.const("hey") }).is({ a: "HEY" }))

    t.object({ 
      type: t.const("enum"), 
      enum: t.array(t.any()),
    })
  })

})

vi.describe("〖️⛳️〗‹‹‹ ❲@traversable/algebra/validator❳", () => {
  //////////////////////////////
  ///    Intersection (&)    ///
  const IntersectionSchema = {
    allOf: [
      { type: "object", properties: { abc: { type: "boolean" } }, required: ["abc"] },
      { type: "object", properties: { def: { type: "boolean" } } },
    ]
  } as const

  const Intersection = {
    strict: () => Validator.derive(IntersectionSchema, strict),
    lax: () => Validator.derive(IntersectionSchema, lax),
    arbitrary: () => Arbitrary.derive.fold()(IntersectionSchema),
    oracle: type(
      {
        type: "'object'", 
        required: ["'abc'"],
        properties: { 
          abc: { 
            type: "'boolean'" 
          }
        }
      }, 
      "&",
      {
        type: "'object'", 
        properties: { 
          abc: { 
            type: "'boolean'" 
          }
        }
      },
    )
  } as const

  vi.it("〖️⛳️〗› ❲validator.derive❳: Intersection (examples)", () => {
    vi.expect(Intersection.strict()).toEqual(
      [
        '(function($0$){if(!$0$||typeof $0$!=="object"||Array.isArray($0$))return false;',
        'let $0$abc=$0$["abc"];',
        'if(typeof $0$abc!=="boolean")return false;',
        'if(!$0$||typeof $0$!=="object"||Array.isArray($0$))return false;',
        'let $0$def=$0$["def"];',
        'if($0$def!==undefined&&typeof $0$def!=="boolean")return false;',
        'return true;',
        '})',
      ].join("")
    )

    vi.expect(Intersection.lax()).toEqual(
      [
        '(function($0$){if(!$0$||typeof $0$!=="object")return false;',
        'let $0$abc=$0$["abc"];',
        'if(typeof $0$abc!=="boolean")return false;',
        'if(!$0$||typeof $0$!=="object")return false;',
        'let $0$def=$0$["def"];',
        'if($0$def!==undefined&&typeof $0$def!=="boolean")return false;',
        'return true;',
        '})',
      ].join("")
    )
  })

  test.prop([Intersection.arbitrary()], { 
    numRuns: 3,
    examples: [] 
  })(
    "〖️⛳️〗› ❲validator.derive❳: Intersection (property-based)", 
    fn.flow(
      eval(Intersection.strict()),
      vi.assert.isTrue,
    )
  )

  test.prop([fc.json()], { 
    // numRuns: 100_000,
    numRuns: 3_000,
    examples: [
      [ null ],
      [ [ ] ],
      [ [ "" ] ],
      [ { "": "" } ],
      [ [ { "": "" } ] ],
      [ { "": void 0 } ],
      [ globalThis.Object.create(null) ],
    ],
  })(
    "〖️⛳️〗› ❲validator.derive❳: Dict<string> (oracle)", 
    fn.flow(
      fn.tee(
        (_) => eval(Intersection.lax())(_) === true,
        (_) => ! (Intersection.oracle(_) instanceof type.errors),
      ),
      ([p, q]) => p === q,
      vi.assert.isTrue,
    )
  )

  ///    Intersection (&)    ///
  //////////////////////////////


  //////////////////////////
  ///    Dict<string>    ///
  const DictSchema = { 
    type: "record", 
    additionalProperties: { 
      type: "string" 
    } 
  } as const

  const Dict = {
    strict: () => Validator.derive(DictSchema, strict),
    lax: () => Validator.derive(DictSchema, lax),
    arbitrary: () => Arbitrary.derive.fold()(DictSchema),
    oracle: type("Record<string, string>"),
  }

  vi.it("〖️⛳️〗› ❲validator.derive❳: Dict<string> (examples)", () => {
    vi.expect(Dict.strict()).toEqual(
      [
        '(function($0$){if(!$0$||typeof $0$!=="object"||Array.isArray($0$))return false;',
        'let $k0=Object.keys($0$);',
        'for(let i=0;',
        'i<$k0.length;',
        'i++){let $1$=$0$[$k0[i]];',
         'if(typeof $1$!=="string")return false;',
        '}return true;',
        '})',
      ].join("")
    )
    vi.expect(Dict.lax()).toEqual(
      [
        '(function($0$){if(!$0$||typeof $0$!=="object")return false;',
        'let $k0=Object.keys($0$);',
        'for(let i=0;',
        'i<$k0.length;',
        'i++){let $1$=$0$[$k0[i]];',
         'if(typeof $1$!=="string")return false;',
        '}return true;',
        '})',
      ].join("")
    )
  })

  test.prop([fc.json()], { 
    // numRuns: 100_000,
    numRuns: 3_000,
    examples: [
      [ null ],
      [ { } ],
      [ [ ] ],
      [ [ "" ] ],
      [ { "": "" } ],
      [ [ { "": "" } ] ],
      [ { "": void 0 } ],
      [ globalThis.Object.create(null) ],
    ],
  })(
    "〖️⛳️〗› ❲validator.derive❳: Dict<string> (oracle)", 
    fn.flow(
      fn.tee(
        (_) => eval(Dict.lax())(_) === true,
        (_) => ! (Dict.oracle(_) instanceof type.errors),
      ),
      ([p, q]) => p === q,
      vi.assert.isTrue,
    )
  )
  ///    Dict<string>    ///
  //////////////////////////


  ////////////////////////////
  ///    Dict<string[]>    ///
  const DictOfStringsSchema = {
    type: "record", 
    additionalProperties: { 
      type: "array", 
      items: { 
        type: "string" 
      } 
    },
  } as const

  const DictOfStrings = {
    strict: () => Validator.derive(DictOfStringsSchema, strict),
    lax: () => Validator.derive(DictOfStringsSchema, lax),
    arbitrary: () => Arbitrary.derive.fold()(DictOfStringsSchema),
    oracle: type(`Record<string, string[]>`)
    // record$(array$(is.string))
  }

  vi.it("〖️⛳️〗› ❲validator.derive❳: Dict<string[]> (examples)", () => {
    vi.assert.equal(
      DictOfStrings.strict(),
      [
        '(function($0$){if(!$0$||typeof $0$!=="object"||Array.isArray($0$))return false;',
        'let $k0=Object.keys($0$);',
        'for(let i=0;',
        'i<$k0.length;',
        'i++){let $1$=$0$[$k0[i]];',
        'if(!Array.isArray($1$))return false;',
        'for(let i=0;',
        'i<$1$.length;',
        'i++){let $2$=$1$[i];',
        'if(typeof $2$!=="string")return false;',
        '}}return true;',
        '})',
      ].join("")
    )

    vi.assert.equal(
      DictOfStrings.lax(),
      [
        '(function($0$){if(!$0$||typeof $0$!=="object")return false;',
        'let $k0=Object.keys($0$);',
        'for(let i=0;',
        'i<$k0.length;',
        'i++){let $1$=$0$[$k0[i]];',
        'if(!Array.isArray($1$))return false;',
        'for(let i=0;',
        'i<$1$.length;',
        'i++){let $2$=$1$[i];',
        'if(typeof $2$!=="string")return false;',
        '}}return true;',
        '})',
      ].join("")
    )
  })

  test.prop([fc.json()], { 
    // numRuns: 100_000,
    numRuns: 3_000,
    examples: [
      [ null ],
      [ { } ],
      [ { "": "" } ],
      [ { "": { } } ],
      [ { "": void 0 } ],
      [ { "": { "": "" }} ],
      [ { "": { "": void 0 } } ],
      [ globalThis.Object.create(null) ],
    ],
  })(
    "〖️⛳️〗› ❲validator.derive❳: Dict<string[]> (oracle)", 
    fn.flow(
      fn.tee(
        (_) => eval(DictOfStrings.lax())(_) === true,
        (_) => ! (DictOfStrings.oracle(_) instanceof type.errors),
      ),
      ([p, q]) => p === q,
      vi.assert.isTrue,
    )
  )
  ///    Dict<string[]>    ///
  ////////////////////////////
  

  ////////////////////////////////
  ///    Dict<Dict<string>>    ///
  const DictOfDictionariesSchema = {
    type: "record", 
    additionalProperties: { 
      type: "record", 
      additionalProperties: { 
        type: "string" 
      } 
    },
  } as const

  const DictOfDictionaries = {
    strict: () => Validator.derive(DictOfDictionariesSchema, strict),
    lax: () => Validator.derive(DictOfDictionariesSchema, lax),
    arbitrary: () => Arbitrary.derive.fold()(DictOfDictionariesSchema),
    oracle: type(`Record<string, Record<string, string>>`),
  }
  
  vi.it("〖️⛳️〗› ❲validator.derive❳: Dict<Dict<string>> (examples)", () => {
    vi.assert.equal(
      DictOfDictionaries.strict(),
      [
        '(function($0$){if(!$0$||typeof $0$!=="object"||Array.isArray($0$))return false;',
        'let $k0=Object.keys($0$);',
        'for(let i=0;',
        'i<$k0.length;',
        'i++){let $1$=$0$[$k0[i]];',
        'if(!$1$||typeof $1$!=="object"||Array.isArray($1$))return false;',
        'let $k1=Object.keys($1$);',
        'for(let i=0;',
        'i<$k1.length;',
        'i++){let $2$=$1$[$k1[i]];',
        'if(typeof $2$!=="string")return false;',
        '}}return true;',
        '})',
      ].join("")
    )

    vi.assert.equal(
      DictOfDictionaries.lax(),
      [
        '(function($0$){if(!$0$||typeof $0$!=="object")return false;',
        'let $k0=Object.keys($0$);',
        'for(let i=0;',
        'i<$k0.length;',
        'i++){let $1$=$0$[$k0[i]];',
        'if(!$1$||typeof $1$!=="object")return false;',
        'let $k1=Object.keys($1$);',
        'for(let i=0;',
        'i<$k1.length;',
        'i++){let $2$=$1$[$k1[i]];',
        'if(typeof $2$!=="string")return false;',
        '}}return true;',
        '})',
      ].join("")
    )
  })

  test.prop([fc.json()], { 
    // numRuns: 100_000,
    numRuns: 3_000,
    examples: [
      [ null ],
      [ { } ],
      [ { "": "" } ],
      [ { "": { } } ],
      [ { "": void 0 } ],
      [ { "": { "": "" }} ],
      [ { "": { "": void 0 } } ],
      [ { "": { "": { "": "" } } } ],
      [ { "": { "": { "": { } } } } ],
      [ globalThis.Object.create(null) ],
    ],
  })(
    "〖️⛳️〗› ❲validator.derive❳: Dict<Dict<string>> (oracle)", 
    fn.flow(
      fn.tee(
        (_) => eval(DictOfDictionaries.lax())(_) === true,
        (_) => ! (DictOfDictionaries.oracle(_) instanceof type.errors),
      ),
      ([p, q]) => p === q,
      vi.assert.isTrue,
    )
  )
  ///    Dict<Dict<string>>    ///
  ////////////////////////////////


  ////////////////////////////////////////////
  ///    Tuple (deep-sort optimization)    ///
  const TupleSchema = {
    type: "tuple", 
    items: [
      { type: "string" }, 
      { type: "array", items: { type: "integer" } }, 
      { type: "boolean" },
    ],
  } as const

  const Tuple = {
    strict: () => Validator.derive(TupleSchema, strict),
    lax: () => Validator.derive(TupleSchema, lax),
    arbitrary: () => Arbitrary.derive.fold()(TupleSchema),
    oracle: type([
      { type: "'string'" }, 
      { type: "'array'", items: { type: "'integer'" } },
      { type: "'boolean'" },
    ]),
  }

  vi.it("〖️⛳️〗› ❲validator.derive❳: Tuple (sorting) (examples)", () => {
    const expected = [
      '(function($0$){if(!Array.isArray($0$))return false;',
      'let $0$2=$0$[2];',
      'if(typeof $0$2!=="boolean")return false;',
      'let $0$0=$0$[0];',
      'if(typeof $0$0!=="string")return false;',
      'let $0$1=$0$[1];',
      'if(!Array.isArray($0$1))return false;',
      'for(let i=0;',
      'i<$0$1.length;',
      'i++){let $1$1=$0$1[i];',
      'if(!Number.isInteger($1$1))return false;',
      '}return true;',
      '})',
    ].join("")

    /** 
     * Assert that changing the value of `treatArraysLikeObjects` 
     * does not change the generated output
     */
    vi.assert.equal(Tuple.strict(), expected)
    vi.assert.equal(Tuple.lax(), expected)
  })

  test.prop([fc.json()], { 
    // numRuns: 100_000,
    numRuns: 3_000,
    examples: [
      [ null ],
      [ { } ],
      [ { "": "" } ],
      [ { "": { } } ],
      [ { "": void 0 } ],
      [ { "": { "": "" }} ],
      [ { "": { "": void 0 } } ],
      [ { "": { "": { "": "" } } } ],
      [ { "": { "": { "": { } } } } ],
      [ globalThis.Object.create(null) ],
    ],
  })(
    "〖️⛳️〗› ❲validator.derive❳: Dict<Dict<string>> (oracle)", 
    fn.flow(
      fn.tee(
        (_) => eval(DictOfDictionaries.lax())(_) === true,
        (_) => ! (DictOfDictionaries.oracle(_) instanceof type.errors),
      ),
      ([p, q]) => p === q,
      vi.assert.isTrue,
    )
  )
  ///    Tuple (deep-sort optimization)    ///
  ////////////////////////////////////////////


  //////////////////////////
  ///    Kitchen Sink    ///
  type KitchenSink = {
    a?: {
      b: [
        {
          d?: number
          e?: [ [ [ { f: string, g: boolean } ] ] ]
          c?: boolean
          f?: number
        }
      ]
      h?: number
    }
  }

  const KitchenSinkSchema = {
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
                  d: { type: "number" },
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
                  c: { type: "boolean" },
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

  const e = type([ [ [ { f: "string", g: "boolean" } ] ] ])
  const b = type([
    { 
      "d?": "number|undefined",
      "e?": e.or("undefined"),
      "c?": "boolean|undefined",
      "f?": "number|undefined",
    },
    { g: "number" },
  ])
  const a = type({
    "b?": b.or("undefined"),
    "h?": "number|undefined",
  })
  const KitchenSink = {
    strict: () => Validator.derive(KitchenSinkSchema, strict),
    lax: () => Validator.derive(KitchenSinkSchema, lax),
    arbitrary: () => Arbitrary.derive.fold()(KitchenSinkSchema),
    oracle: type({
      "a?": a.or("undefined"),
    }),
  }

  vi.it("〖️⛳️〗› ❲validator.derive❳: KitchenSink (examples)", () => {
    vi.expect(KitchenSink.strict()).toEqual(
      [
        '(function($0$){if(!$0$||typeof $0$!=="object"||Array.isArray($0$))return false;',
        'let $0$a=$0$["a"];',
        'if($0$a!==undefined){if($0$a===null||typeof $0$a!=="object"||Array.isArray($0$a))return false;',
        'let $0$ah=$0$a["h"];',
        'if($0$ah!==undefined&&typeof $0$ah!=="number")return false;',
        'let $0$ab=$0$a["b"];',
        'if($0$ab!==undefined){if(!Array.isArray($0$ab))return false;',
        'let $0$ab0=$0$ab[0];',
        'if(!$0$ab0||typeof $0$ab0!=="object"||Array.isArray($0$ab0))return false;',
        'let $0$ab0d=$0$ab0["d"];',
        'if($0$ab0d!==undefined&&typeof $0$ab0d!=="number")return false;',
        'let $0$ab0e=$0$ab0["e"];',
        'if($0$ab0e!==undefined){if(!Array.isArray($0$ab0e))return false;',
        'let $0$ab0e0=$0$ab0e[0];',
        'if(!Array.isArray($0$ab0e0))return false;',
        'let $0$ab0e00=$0$ab0e0[0];',
        'if(!Array.isArray($0$ab0e00))return false;',
        'let $0$ab0e000=$0$ab0e00[0];',
        'if(!$0$ab0e000||typeof $0$ab0e000!=="object"||Array.isArray($0$ab0e000))return false;',
        'let $0$ab0e000f=$0$ab0e000["f"];',
        'if(typeof $0$ab0e000f!=="string")return false;',
        'let $0$ab0e000g=$0$ab0e000["g"];',
        'if(typeof $0$ab0e000g!=="boolean")return false;',
        '}let $0$ab0c=$0$ab0["c"];',
        'if($0$ab0c!==undefined&&typeof $0$ab0c!=="boolean")return false;',
        'let $0$ab0f=$0$ab0["f"];',
        'if($0$ab0f!==undefined&&typeof $0$ab0f!=="number")return false;',
        'let $0$ab1=$0$ab[1];',
        'if(!$0$ab1||typeof $0$ab1!=="object"||Array.isArray($0$ab1))return false;',
        'let $0$ab1g=$0$ab1["g"];',
        'if(typeof $0$ab1g!=="number")return false;',
        '}}return true;',
        '})',
      ].join("")
    )

    vi.expect(KitchenSink.lax()).toEqual(
      [
        '(function($0$){if(!$0$||typeof $0$!=="object")return false;',
        'let $0$a=$0$["a"];',
        'if($0$a!==undefined){if($0$a===null||typeof $0$a!=="object")return false;',
        'let $0$ah=$0$a["h"];',
        'if($0$ah!==undefined&&typeof $0$ah!=="number")return false;',
        'let $0$ab=$0$a["b"];',
        'if($0$ab!==undefined){if(!Array.isArray($0$ab))return false;',
        'let $0$ab0=$0$ab[0];',
        'if(!$0$ab0||typeof $0$ab0!=="object")return false;',
        'let $0$ab0d=$0$ab0["d"];',
        'if($0$ab0d!==undefined&&typeof $0$ab0d!=="number")return false;',
        'let $0$ab0e=$0$ab0["e"];',
        'if($0$ab0e!==undefined){if(!Array.isArray($0$ab0e))return false;',
        'let $0$ab0e0=$0$ab0e[0];',
        'if(!Array.isArray($0$ab0e0))return false;',
        'let $0$ab0e00=$0$ab0e0[0];',
        'if(!Array.isArray($0$ab0e00))return false;',
        'let $0$ab0e000=$0$ab0e00[0];',
        'if(!$0$ab0e000||typeof $0$ab0e000!=="object")return false;',
        'let $0$ab0e000f=$0$ab0e000["f"];',
        'if(typeof $0$ab0e000f!=="string")return false;',
        'let $0$ab0e000g=$0$ab0e000["g"];',
        'if(typeof $0$ab0e000g!=="boolean")return false;',
        '}let $0$ab0c=$0$ab0["c"];',
        'if($0$ab0c!==undefined&&typeof $0$ab0c!=="boolean")return false;',
        'let $0$ab0f=$0$ab0["f"];',
        'if($0$ab0f!==undefined&&typeof $0$ab0f!=="number")return false;',
        'let $0$ab1=$0$ab[1];',
        'if(!$0$ab1||typeof $0$ab1!=="object")return false;',
        'let $0$ab1g=$0$ab1["g"];',
        'if(typeof $0$ab1g!=="number")return false;',
        '}}return true;',
        '})',
      ].join("")
    )
  })

  test.prop([fc.json()], { 
    // numRuns: 100_000,
    numRuns: 3_000,
    examples: [
      [ { "a": void 0 } ],
      [ null ],
      [ { } ],
      [ { "": "" } ],
      [ { "": { } } ],
      [ { "a": null } ],
      [ { "a": [] } ],
      [ { "a": { "b": [ {} ] } } ],
      [ globalThis.Object.create(null) ],
    ],
  })(
    "〖️⛳️〗› ❲validator.derive❳: KitchenSink (oracle)", 
    fn.flow(
      fn.tee(
        (_) => eval(KitchenSink.lax())(_) === true,
        (_) => !(KitchenSink.oracle(_) instanceof type.errors),
      ),
      ([p, q]) => p === q,
      vi.assert.isTrue,
    )
  )

  const fuzz = fc.oneof(
    fc.record({
      a: fc.option(
        fc.record({
          b: fc.oneof(
            fc.constant(null),
            fc.constant([]),
            fc.tuple(
              fc.oneof(
                fc.record({
                  d: fc.oneof(fc.float(), fc.integer(), fc.bigInt()),
                  e: fc.tuple(
                    fc.tuple(
                      fc.tuple(
                        fc.oneof(
                          fc.constant(null),
                          fc.record({ 
                            f: fc.lorem(), 
                            g: fc.boolean({ falseBias: false }) 
                          }, { requiredKeys: [] }),
                          fc.record({ 
                            f: fc.anything(), 
                            g: fc.anything() 
                          }, { requiredKeys: [] }),
                        )
                      )
                    )
                  ),
                  c: fc.option(fc.oneof(fc.boolean(), fc.constant(null))),
                  f: fc.option(fc.oneof(fc.nat(), fc.float(), fc.constant(null))),
                }, { requiredKeys: [] }),
                fc.record({
                  d: fc.jsonValue(),
                  e: fc.jsonValue(),
                  c: fc.jsonValue(),
                  v: fc.jsonValue(),
                }, { requiredKeys: [] })
              ),
            ),
          )
        }, { requiredKeys: [] })
      ),
    }, { requiredKeys: [] })
  )

  test.prop([fuzz], { 
    // numRuns: 100_000,
    numRuns: 3_000,
    examples: [
      [ null ],
      [ { } ],
      [ { "": "" } ],
      [ { "": { } } ],
      [ { "a": null } ],
      [ { "a": void 0 } ],
      [ { "a": [] } ],
      [ { "a": { "b": [ {} ] } } ],
      [ globalThis.Object.create(null) ],
    ],
  })(
    "〖️⛳️〗› ❲validator.derive❳: KitchenSink (fuzz)", 
    fn.flow(
      fn.tee(
        (_) => eval(KitchenSink.lax())(_) === true,
        (_) => !(KitchenSink.oracle(_) instanceof type.errors),
      ),
      ([p, q]) => p === q,
      vi.assert.isTrue,
    )
  )
})
