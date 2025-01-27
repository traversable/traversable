import { test } from "@fast-check/vitest"
import { type } from "arktype"
import * as vi from "vitest"

import { arbitrary as Arbitrary, validator as Validator } from "@traversable/algebra"
import { fc, t } from "@traversable/core"
import { fn } from "@traversable/data"

const strict = { 
  flags: { 
    jitCompile: true, 
    treatArraysLikeObjects: false,
  } 
} satisfies Validator.Options

const lax = { 
  flags: { 
    jitCompile: true, 
    treatArraysLikeObjects: true 
  } 
} satisfies Validator.Options


vi.describe("〖️⛳️〗‹‹‹ ❲@traversable/algebra/validator❳", () => {
  //////////////////////////
  ///    Intersection    ///
  const IntersectionSchema = t.allOf(
    t.object({ abc: t.boolean() }),
    t.object({ def: t.optional(t.boolean() )}),
  )
  const IntersectionJsonSchema = IntersectionSchema.toJsonSchema
  //    ^?

  const Intersection = {
    strict: () => Validator.derive(IntersectionJsonSchema, strict),
    lax: () => Validator.derive(IntersectionJsonSchema, lax),
    arbitrary: () => Arbitrary.derive.fold()(IntersectionJsonSchema),
    oracle: type(
      { abc: "boolean" }, 
      "&",
      { "def?": "boolean" },
    ),
  } as const

  vi.it("〖️⛳️〗› ❲validator.derive❳: Intersection (examples)", () => {
    vi.expect(Intersection.strict()).toMatchInlineSnapshot(`"(function($0$){if(!$0$||typeof $0$!=="object"||Array.isArray($0$))return false;let $0$abc=$0$['abc'];if(typeof $0$abc!=="boolean")return false;if(!$0$||typeof $0$!=="object"||Array.isArray($0$))return false;let $0$def=$0$['def'];if($0$def!==undefined&&typeof $0$def!=="boolean")return false;return true;})"`)
    vi.expect(Intersection.lax()).toMatchInlineSnapshot(`"(function($0$){if(!$0$||typeof $0$!=="object")return false;let $0$abc=$0$['abc'];if(typeof $0$abc!=="boolean")return false;if(!$0$||typeof $0$!=="object")return false;let $0$def=$0$['def'];if($0$def!==undefined&&typeof $0$def!=="boolean")return false;return true;})"`)
  })

  test.prop([Intersection.arbitrary()], { 
    // numRuns: 100_000,
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
    examples: [
      [ null ],
      [ [ ] ],
      [ [ "" ] ],
      [ { "": "" } ],
      [ [ { "": "" } ] ],
      [ { "": void 0 } ],
      [ globalThis.Object.create(null) ],
      [ { abc: true } ],
      [ { abc: false, def: true } ],
      [ { def: true } ],
      [ { def: 1 } ],
      [ { abc: 0 } ],
      [ { abc: 1, def: false } ],
      [ { abc: true, def: 0 } ],
    ],
  })(
    "〖️⛳️〗› ❲validator.derive❳: Intersection (oracle)", 
    fn.flow(
      fn.tee(
        (_) => eval(Intersection.lax())(_) === true,
        (_) => !(Intersection.oracle(_) instanceof type.errors),
      ),
      ([p, q]) => p === q,
      vi.assert.isTrue,
    )
  )
  ///    Intersection    ///
  //////////////////////////


  ///////////////////
  ///    Union    ///
  const UnionSchema = t.anyOf(
    t.object({ abc: t.boolean() }),
    t.object({ def: t.optional(t.boolean()) }),
  )
  const UnionJsonSchema = UnionSchema.toJsonSchema
  //    ^?

  const Union = {
    strict: () => Validator.derive(UnionJsonSchema, strict),
    lax: () => Validator.derive(UnionJsonSchema, lax),
    arbitrary: () => Arbitrary.derive.fold()(UnionJsonSchema),
    oracle: type({ abc: "boolean" }).or({ "def?": "boolean" }),
  } as const

  test.prop([fc.json()], { 
    // numRuns: 100_000,
    examples: [
      [ null ],
      [ [ ] ],
      [ [ "" ] ],
      [ { "": "" } ],
      [ [ { "": "" } ] ],
      [ { "": void 0 } ],
      [ globalThis.Object.create(null) ],
      [ { abc: true } ],
      [ { abc: false, def: true } ],
      [ { def: true } ],
      [ { def: 1 } ],
      [ { abc: 1, def: false } ],
      [ { abc: true, def: 0 } ],
    ],
  })(
    "〖️⛳️〗› ❲validator.derive❳: Union (oracle)", 
    fn.flow(
      fn.tee(
        (_) => eval(Union.lax())(_) === true,
        (_) => !(Union.oracle(_) instanceof type.errors),
      ),
      ([p, q]) => p === q,
      vi.assert.isTrue,
    )
  )
  ///    Union    ///
  ///////////////////


  ////////////////////////////
  ///    Disjoint Union    ///
  const DisjointUnionSchema = {
    oneOf: UnionJsonSchema.anyOf,
  } as const
  // const DisjointUnionJsonSchema = DisjointUnionSchema
  //    ^?

  const DisjointUnion = {
    strict: () => Validator.derive(DisjointUnionSchema, strict),
    lax: () => Validator.derive(DisjointUnionSchema, lax),
    arbitrary: () => Arbitrary.derive.fold()(DisjointUnionSchema),
    oracle: Union.oracle,
  } as const

  vi.it(
    "〖️⛳️〗› ❲validator.derive❳: Disjoint Union (makes sure )",
    () => {
    vi.assert.isFalse(eval(DisjointUnion.lax())({ abc: true, def: true }))
  })
  
  test.prop([fc.json()], { 
    // numRuns: 100_000,
    examples: [
      [ null ],
      [ [ ] ],
      [ [ "" ] ],
      [ { "": "" } ],
      [ [ { "": "" } ] ],
      [ { "": void 0 } ],
      [ globalThis.Object.create(null) ],
      [ { abc: true } ],
      [ { abc: false, def: true } ],
      [ { def: true } ],
      [ { def: 1 } ],
      [ { abc: 1, def: false } ],
      [ { abc: true, def: 0 } ],
    ],
  })(
    "〖️⛳️〗› ❲validator.derive❳: Union (oracle)", 
    fn.flow(
      fn.tee(
        (_) => eval(Union.lax())(_) === true,
        (_) => !(Union.oracle(_) instanceof type.errors),
      ),
      ([p, q]) => p === q,
      vi.assert.isTrue,
    )
  )
  ///    Disjoint Union    ///
  ////////////////////////////


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
    vi.expect(Dict.strict()).toMatchInlineSnapshot(`"(function($0$){if(!$0$||typeof $0$!=="object"||Array.isArray($0$))return false;let $k0=Object.keys($0$);for(let i=0;i<$k0.length;i++){let $1$=$0$[$k0[i]];if(typeof $1$!=="string")return false;}return true;})"`)
    vi.expect(Dict.lax()).toMatchInlineSnapshot(`"(function($0$){if(!$0$||typeof $0$!=="object")return false;let $k0=Object.keys($0$);for(let i=0;i<$k0.length;i++){let $1$=$0$[$k0[i]];if(typeof $1$!=="string")return false;}return true;})"`)
  })

  test.prop([fc.json()], { 
    // numRuns: 100_000,
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
  }

  vi.it("〖️⛳️〗› ❲validator.derive❳: Dict<string[]> (examples)", () => {
    vi.expect(DictOfStrings.strict()).toMatchInlineSnapshot(`"(function($0$){if(!$0$||typeof $0$!=="object"||Array.isArray($0$))return false;let $k0=Object.keys($0$);for(let i=0;i<$k0.length;i++){let $1$=$0$[$k0[i]];if(!Array.isArray($1$))return false;for(let i=0;i<$1$.length;i++){let $2$=$1$[i];if(typeof $2$!=="string")return false;}}return true;})"`)
    vi.expect(DictOfStrings.lax()).toMatchInlineSnapshot(`"(function($0$){if(!$0$||typeof $0$!=="object")return false;let $k0=Object.keys($0$);for(let i=0;i<$k0.length;i++){let $1$=$0$[$k0[i]];if(!Array.isArray($1$))return false;for(let i=0;i<$1$.length;i++){let $2$=$1$[i];if(typeof $2$!=="string")return false;}}return true;})"`)
  })

  test.prop([fc.json()], { 
    // numRuns: 100_000,
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
    vi.expect(DictOfDictionaries.strict()).toMatchInlineSnapshot(`"(function($0$){if(!$0$||typeof $0$!=="object"||Array.isArray($0$))return false;let $k0=Object.keys($0$);for(let i=0;i<$k0.length;i++){let $1$=$0$[$k0[i]];if(!$1$||typeof $1$!=="object"||Array.isArray($1$))return false;let $k1=Object.keys($1$);for(let i=0;i<$k1.length;i++){let $2$=$1$[$k1[i]];if(typeof $2$!=="string")return false;}}return true;})"`)
    vi.expect(DictOfDictionaries.lax()).toMatchInlineSnapshot(`"(function($0$){if(!$0$||typeof $0$!=="object")return false;let $k0=Object.keys($0$);for(let i=0;i<$k0.length;i++){let $1$=$0$[$k0[i]];if(!$1$||typeof $1$!=="object")return false;let $k1=Object.keys($1$);for(let i=0;i<$k1.length;i++){let $2$=$1$[$k1[i]];if(typeof $2$!=="string")return false;}}return true;})"`)
  })

  test.prop([fc.json()], { 
    // numRuns: 100_000,
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
  let items = [
    { type: "string" },
    { type: "array", items: { type: "integer" } },
    { type: "boolean" },
  ] as const

  // void (items[1] = { type: "string" } as const)
  // void (items[0] = { type: "boolean" } as const)
  // void (items[2] = { type: "array", items: { type: "integer" } } as const)

  // { type: "array", items: { type: "integer" } }, 
  // { type: "string" }, 
  // { type: "boolean" },

  const TupleSchema = {
    type: "tuple", 
    items,
  } as const

  const Tuple = {
    strict: () => Validator.derive(TupleSchema, strict),
    lax: () => Validator.derive(TupleSchema, lax),
    arbitrary: () => Arbitrary.derive.fold()(TupleSchema),
    oracle: type([
      { type: "'array'", items: { type: "'integer'" } },
      { type: "'string'" }, 
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

  const KitchenSinkSchema = t.object({
    a: t.optional(
      t.object({ 
        b: t.optional(
          t.tuple(
            t.object({
              d: t.optional(t.number()),
              e: t.optional(
                t.tuple(
                  t.tuple(
                    t.tuple(
                      t.object({ 
                        f: t.string(), 
                        g: t.boolean(),
                      })
                    )
                  )
                )
              ),
              c: t.optional(t.boolean()),
              f: t.optional(t.number()),
            }),
            t.object({ 
              g: t.number(),
            }),
          ),
        ),
        h: t.optional(t.number()),
      })
    )
  });

  const KitchenSinkJsonSchema = KitchenSinkSchema.toJsonSchema

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
    strict: () => Validator.derive(KitchenSinkJsonSchema, strict),
    lax: () => Validator.derive(KitchenSinkJsonSchema, lax),
    arbitrary: () => Arbitrary.derive.fold()(KitchenSinkJsonSchema),
    oracle: type({
      "a?": a.or("undefined"),
    }),
  }

  vi.it("〖️⛳️〗› ❲validator.derive❳: KitchenSink (examples)", () => {
    vi.expect(KitchenSink.strict()).toMatchInlineSnapshot(`"(function($0$){if(!$0$||typeof $0$!=="object"||Array.isArray($0$))return false;let $0$a=$0$['a'];if($0$a!==undefined){if($0$a===null||typeof $0$a!=="object"||Array.isArray($0$a))return false;let $0$ah=$0$a['h'];if($0$ah!==undefined&&typeof $0$ah!=="number")return false;let $0$ab=$0$a['b'];if($0$ab!==undefined){if(!Array.isArray($0$ab))return false;let $0$ab0=$0$ab[0];if(!$0$ab0||typeof $0$ab0!=="object"||Array.isArray($0$ab0))return false;let $0$ab0d=$0$ab0['d'];if($0$ab0d!==undefined&&typeof $0$ab0d!=="number")return false;let $0$ab0e=$0$ab0['e'];if($0$ab0e!==undefined){if(!Array.isArray($0$ab0e))return false;let $0$ab0e0=$0$ab0e[0];if(!Array.isArray($0$ab0e0))return false;let $0$ab0e00=$0$ab0e0[0];if(!Array.isArray($0$ab0e00))return false;let $0$ab0e000=$0$ab0e00[0];if(!$0$ab0e000||typeof $0$ab0e000!=="object"||Array.isArray($0$ab0e000))return false;let $0$ab0e000f=$0$ab0e000['f'];if(typeof $0$ab0e000f!=="string")return false;let $0$ab0e000g=$0$ab0e000['g'];if(typeof $0$ab0e000g!=="boolean")return false;}let $0$ab0c=$0$ab0['c'];if($0$ab0c!==undefined&&typeof $0$ab0c!=="boolean")return false;let $0$ab0f=$0$ab0['f'];if($0$ab0f!==undefined&&typeof $0$ab0f!=="number")return false;let $0$ab1=$0$ab[1];if(!$0$ab1||typeof $0$ab1!=="object"||Array.isArray($0$ab1))return false;let $0$ab1g=$0$ab1['g'];if(typeof $0$ab1g!=="number")return false;}}return true;})"`)
    vi.expect(KitchenSink.lax()).toMatchInlineSnapshot(`"(function($0$){if(!$0$||typeof $0$!=="object")return false;let $0$a=$0$['a'];if($0$a!==undefined){if($0$a===null||typeof $0$a!=="object")return false;let $0$ah=$0$a['h'];if($0$ah!==undefined&&typeof $0$ah!=="number")return false;let $0$ab=$0$a['b'];if($0$ab!==undefined){if(!Array.isArray($0$ab))return false;let $0$ab0=$0$ab[0];if(!$0$ab0||typeof $0$ab0!=="object")return false;let $0$ab0d=$0$ab0['d'];if($0$ab0d!==undefined&&typeof $0$ab0d!=="number")return false;let $0$ab0e=$0$ab0['e'];if($0$ab0e!==undefined){if(!Array.isArray($0$ab0e))return false;let $0$ab0e0=$0$ab0e[0];if(!Array.isArray($0$ab0e0))return false;let $0$ab0e00=$0$ab0e0[0];if(!Array.isArray($0$ab0e00))return false;let $0$ab0e000=$0$ab0e00[0];if(!$0$ab0e000||typeof $0$ab0e000!=="object")return false;let $0$ab0e000f=$0$ab0e000['f'];if(typeof $0$ab0e000f!=="string")return false;let $0$ab0e000g=$0$ab0e000['g'];if(typeof $0$ab0e000g!=="boolean")return false;}let $0$ab0c=$0$ab0['c'];if($0$ab0c!==undefined&&typeof $0$ab0c!=="boolean")return false;let $0$ab0f=$0$ab0['f'];if($0$ab0f!==undefined&&typeof $0$ab0f!=="number")return false;let $0$ab1=$0$ab[1];if(!$0$ab1||typeof $0$ab1!=="object")return false;let $0$ab1g=$0$ab1['g'];if(typeof $0$ab1g!=="number")return false;}}return true;})"`)
  })

  test.prop([fc.json()], { 
    // numRuns: 100_000,
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
