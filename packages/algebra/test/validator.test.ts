import { test } from "@fast-check/vitest"
import { type } from "arktype"
import * as vi from "vitest"

import { arbitrary as Arbitrary, validator as Validator } from "@traversable/algebra"
import { validator } from "@traversable/algebra"
import { fc, t } from "@traversable/core"
import { fn } from "@traversable/data"
import type { Widen } from "@traversable/registry"

const strict = { 
  flags: { 
    aheadOfTime: true, 
    treatArraysLikeObjects: false,
  },
  validationType: 'typeguard',
} satisfies Validator.Options

const lax = { 
  flags: { 
    aheadOfTime: true, 
    treatArraysLikeObjects: true 
  },
  validationType: 'typeguard',
} satisfies Validator.Options

const strictFailSlow = {
  ...strict,
  validationType: validator.Type.failSlow,
} satisfies Validator.Options

const laxFailSlow = {
  ...lax,
  validationType: validator.Type.failSlow,
} satisfies Validator.Options

vi.describe("〖️⛳️〗‹‹‹ ❲@traversable/algebra/validator❳", () => {
  vi.describe("〖️⛳️〗‹‹ ❲validator.derive❳: shallow object w/ booleans", () => {
    const schema = t.object({ a: t.boolean(), b: t.optional(t.boolean()) })
    const oracle = type({ a: "boolean", "b?": "boolean|undefined" })
    const generatedStrict = Validator.derive(schema.toJsonSchema, strictFailSlow)
    const generatedLax = Validator.derive(schema.toJsonSchema, laxFailSlow)
    const validator = eval('(' + generatedLax + ')')
    const validArbitrary = fc.record({ a: fc.boolean(), b: fc.optional(fc.boolean()) }, { requiredKeys: ["a"] })
    const fuzzyArbitrary = fc.oneof(
      fc.record({ 
        a: fc.oneof(
          fc.boolean(),
          fc.constant(undefined),
          fc.anything(),
        ),
        b: fc.optional(
          fc.oneof(
            fc.boolean(),
            fc.constant(undefined),
            fc.anything(),
          ),
        ),
        z: fc.anything(),
      }, { requiredKeys: [] }),
      fc.constant(undefined),
      fc.anything(),
    )
    vi.it("〖️⛳️〗› ❲shallow object w/ booleans❳: snapshots, types", () => {
      vi.assertType<typeof oracle.infer>(schema._type)
      vi.assertType<typeof schema._type>(oracle.infer)
      vi.expect(generatedStrict).toMatchInlineSnapshot(`"function isValid($0$){let errors=[];isValid.errors=errors;let errNo=0;if(errNo===0){let $isObj0=!!$0$ && typeof $0$==="object";if(!$isObj0||globalThis.Array.isArray($0$)){isValid.errors.push({path:"",schemaPath:"#/",keyword:"type",message:"must be an object (was "+typeof $0$+")"});errNo++;}if((($isObj0 && $0$["a"]===undefined && (errNo++,void isValid.errors.push({path:"a",schemaPath:"#/required/",keyword:"required",message:"must have required property 'a'"}))))){};if($isObj0){let $1$a=$0$["a"];if(typeof $1$a !== "boolean"){errNo++;isValid.errors.push({path:"a",schemaPath:"#/properties/a/",keyword:"type",message:"must be a boolean (was "+typeof $1$a+")"});}}if($isObj0){let $1$b=$0$["b"];if($1$b!==undefined && typeof $1$b !== "boolean"){errNo++;isValid.errors.push({path:"b",schemaPath:"#/properties/b/",keyword:"type",message:"must be a boolean (was "+typeof $1$b+")"});}}}errNo===0&&(delete isValid.errors);return errNo===0;}"`)
    })
    test.prop(
      [validArbitrary, fuzzyArbitrary], 
      { 
        // numRuns: 100_000,
        examples: [],
      },
    )(
      "〖️⛳️〗› ❲shallow object w/ booleans❳: parity with oracle",
      (valid, fuzz) => {
        const v = validator(valid)
        const o = oracle(valid)
        const vFuzz = validator(fuzz)
        const oFuzz = oracle(fuzz)
        vi.assert.equal(v, !(o instanceof type.errors))
        vi.assert.equal(vFuzz, !(oFuzz instanceof type.errors))
      }
    )
  })

  vi.describe("〖️⛳️〗‹‹ ❲validator.derive❳: shallow object w/ integers", () => {
    type Schema = Widen<t.typeof<typeof schema>>
    const schema = t.object({ a: t.integer(), b: t.optional(t.integer()) })
    const oracle = type({ a: "number.integer", "b?": "number.integer|undefined" })
    const generatedStrict = Validator.derive(schema.toJsonSchema, strictFailSlow)
    const generatedLax = Validator.derive(schema.toJsonSchema, laxFailSlow)
    const validator = eval('(' + generatedLax + ')')
    const validArbitrary = fc.record({ a: fc.integer(), b: fc.optional(fc.integer()) })
    const fuzzyArbitrary = fc.oneof(
      fc.record({ 
        a: fc.oneof(
          fc.integer(),
          fc.float(),
          fc.constant(undefined),
          fc.anything(),
        ),
        b: fc.optional(
          fc.oneof(
            fc.integer(),
            fc.float(),
            fc.constant(undefined),
            fc.anything(),
          ),
        ),
        z: fc.anything(),
      }),
      fc.constant(undefined),
      fc.anything(),
    )
    vi.it("〖️⛳️〗› ❲shallow object w/ integers❳: snapshots, types", () => {
     vi.assertType<typeof oracle.infer>(schema._type as Schema)
      vi.assertType<typeof schema._type>(oracle.infer)
      vi.expect(generatedStrict).toMatchInlineSnapshot(`"function isValid($0$){let errors=[];isValid.errors=errors;let errNo=0;if(errNo===0){let $isObj0=!!$0$ && typeof $0$==="object";if(!$isObj0||globalThis.Array.isArray($0$)){isValid.errors.push({path:"",schemaPath:"#/",keyword:"type",message:"must be an object (was "+typeof $0$+")"});errNo++;}if((($isObj0 && $0$["a"]===undefined && (errNo++,void isValid.errors.push({path:"a",schemaPath:"#/required/",keyword:"required",message:"must have required property 'a'"}))))){};if($isObj0){let $1$a=$0$["a"];if(!globalThis.Number.isInteger($1$a)){errNo++;isValid.errors.push({path:"a",schemaPath:"#/properties/a/",keyword:"type",message:"must be an integer (was "+typeof $1$a+")"});}}if($isObj0){let $1$b=$0$["b"];if($1$b!==undefined && !globalThis.Number.isInteger($1$b)){errNo++;isValid.errors.push({path:"b",schemaPath:"#/properties/b/",keyword:"type",message:"must be an integer (was "+typeof $1$b+")"});}}}errNo===0&&(delete isValid.errors);return errNo===0;}"`)
    })
    test.prop(
      [validArbitrary, fuzzyArbitrary], 
      { 
        // numRuns: 100_000,
        examples: [],
      },
    )(
      "〖️⛳️〗› ❲shallow object w/ integers❳: parity with oracle",
      (valid, fuzz) => {
        const v = validator(valid)
        const o = oracle(valid)
        const vFuzz = validator(fuzz)
        const oFuzz = oracle(fuzz)
        vi.assert.equal(v, !(o instanceof type.errors))
        vi.assert.equal(vFuzz, !(oFuzz instanceof type.errors))
      }
    )
  })

  vi.describe("〖️⛳️〗‹‹ ❲validator.derive❳: shallow object w/ numbers", () => {
    const fc_number = fc.oneof(fc.integer(), fc.float())
    const schema = t.object({ a: t.number(), b: t.optional(t.number()) })
    const oracle = type({ a: "number", "b?": "number|undefined" })
    const generatedStrict = Validator.derive(schema.toJsonSchema, strictFailSlow)
    const generatedLax = Validator.derive(schema.toJsonSchema, laxFailSlow)
    const validator = eval('(' + generatedLax + ')')
    const validArbitrary = fc.record({ a: fc_number, b: fc.optional(fc_number) })
    const fuzzyArbitrary = fc.oneof(
      fc.record({ 
        a: fc.oneof(
          fc_number,
          fc.constant(undefined),
          fc.anything(),
        ),
        b: fc.optional(
          fc.oneof(
            fc_number,
            fc.constant(undefined),
            fc.anything(),
          ),
        ),
        z: fc.anything(),
      }),
      fc.constant(undefined),
      fc.anything(),
    )
    vi.it("〖️⛳️〗› ❲shallow object w/ numbers❳: snapshots, types", () => {
     vi.assertType<typeof oracle.infer>(schema._type)
      vi.assertType<typeof schema._type>(oracle.infer)
      vi.expect(generatedStrict).toMatchInlineSnapshot(`"function isValid($0$){let errors=[];isValid.errors=errors;let errNo=0;if(errNo===0){let $isObj0=!!$0$ && typeof $0$==="object";if(!$isObj0||globalThis.Array.isArray($0$)){isValid.errors.push({path:"",schemaPath:"#/",keyword:"type",message:"must be an object (was "+typeof $0$+")"});errNo++;}if((($isObj0 && $0$["a"]===undefined && (errNo++,void isValid.errors.push({path:"a",schemaPath:"#/required/",keyword:"required",message:"must have required property 'a'"}))))){};if($isObj0){let $1$a=$0$["a"];if(typeof $1$a !== "number"){errNo++;isValid.errors.push({path:"a",schemaPath:"#/properties/a/",keyword:"type",message:"must be a number (was "+typeof $1$a+")"});}}if($isObj0){let $1$b=$0$["b"];if($1$b!==undefined && typeof $1$b !== "number"){errNo++;isValid.errors.push({path:"b",schemaPath:"#/properties/b/",keyword:"type",message:"must be a number (was "+typeof $1$b+")"});}}}errNo===0&&(delete isValid.errors);return errNo===0;}"`)
    })
    test.prop(
      [validArbitrary, fuzzyArbitrary], 
      { 
        // numRuns: 100_000,
        examples: [],
      },
    )(
      "〖️⛳️〗› ❲shallow object w/ numbers❳: parity with oracle",
      (valid, fuzz) => {
        const v = validator(valid)
        const o = oracle(valid)
        const vFuzz = validator(fuzz)
        const oFuzz = oracle(fuzz)
        vi.assert.equal(v, !(o instanceof type.errors))
        vi.assert.equal(vFuzz, !(oFuzz instanceof type.errors))
      }
    )
  })

  vi.describe("〖️⛳️〗‹‹ ❲validator.derive❳: shallow object w/ strings", () => {
    const schema = t.object({ a: t.string(), b: t.optional(t.string()) })
    const oracle = type({ a: "string", "b?": "string|undefined" })
    const generatedStrict = Validator.derive(schema.toJsonSchema, strictFailSlow)
    const generatedLax = Validator.derive(schema.toJsonSchema, laxFailSlow)
    const validator = eval('(' + generatedLax + ')')
    const validArbitrary = fc.record({ a: fc.string(), b: fc.optional(fc.string()) })
    const fuzzyArbitrary = fc.oneof(
      fc.record({ 
        a: fc.oneof(
          fc.string(),
          fc.constant(undefined),
          fc.anything(),
        ),
        b: fc.optional(
          fc.oneof(
            fc.string(),
            fc.constant(undefined),
            fc.anything(),
          ),
        ),
        z: fc.anything(),
      }),
      fc.constant(undefined),
      fc.anything(),
    )
    vi.it("〖️⛳️〗› ❲shallow object w/ strings❳: snapshots, types", () => {
     vi.assertType<typeof oracle.infer>(schema._type)
      vi.assertType<typeof schema._type>(oracle.infer)
      vi.expect(generatedStrict).toMatchInlineSnapshot(`"function isValid($0$){let errors=[];isValid.errors=errors;let errNo=0;if(errNo===0){let $isObj0=!!$0$ && typeof $0$==="object";if(!$isObj0||globalThis.Array.isArray($0$)){isValid.errors.push({path:"",schemaPath:"#/",keyword:"type",message:"must be an object (was "+typeof $0$+")"});errNo++;}if((($isObj0 && $0$["a"]===undefined && (errNo++,void isValid.errors.push({path:"a",schemaPath:"#/required/",keyword:"required",message:"must have required property 'a'"}))))){};if($isObj0){let $1$a=$0$["a"];if(typeof $1$a !== "string"){errNo++;isValid.errors.push({path:"a",schemaPath:"#/properties/a/",keyword:"type",message:"must be a string (was "+typeof $1$a+")"});}}if($isObj0){let $1$b=$0$["b"];if($1$b!==undefined && typeof $1$b !== "string"){errNo++;isValid.errors.push({path:"b",schemaPath:"#/properties/b/",keyword:"type",message:"must be a string (was "+typeof $1$b+")"});}}}errNo===0&&(delete isValid.errors);return errNo===0;}"`)
    })
    test.prop(
      [validArbitrary, fuzzyArbitrary], 
      { 
        // numRuns: 100_000,
        examples: [],
      },
    )(
      "〖️⛳️〗› ❲shallow object w/ strings❳: parity with oracle",
      (valid, fuzz) => {
        const v = validator(valid)
        const o = oracle(valid)
        const vFuzz = validator(fuzz)
        const oFuzz = oracle(fuzz)
        vi.assert.equal(v, !(o instanceof type.errors))
        vi.assert.equal(vFuzz, !(oFuzz instanceof type.errors))
      }
    )
  })

  vi.describe("〖️⛳️〗‹‹ ❲validator.derive❳: shallow object w/ 2 opt. props", () => {
    const schema = t.object({ a: t.optional(t.null()), b: t.optional(t.null()) })
    const oracle = type({ "a?": "null|undefined", "b?": "null|undefined" })
    const generatedStrict = Validator.derive(schema.toJsonSchema, strictFailSlow)
    const generatedLax = Validator.derive(schema.toJsonSchema, laxFailSlow)
    const validator = eval('(' + generatedLax + ')')
    const validArbitrary = fc.record({ a: fc.constant(null), b: fc.constant(null) }, { requiredKeys: [] })
    const fuzzyArbitrary = fc.oneof(
      fc.record({ 
        a: fc.oneof(
          fc.constant(null),
          fc.boolean(),
        ),
        b: fc.oneof(
          fc.constant(null),
          fc.boolean(),
        ),
        c: fc.anything(),
      }, { requiredKeys: [] }),
      fc.constant(undefined),
      fc.anything(),
    )
    vi.it("〖️⛳️〗› ❲shallow object w/ opt. props❳: snapshots, types", () => {
      vi.assertType<typeof oracle.infer>(schema._type)
      vi.assertType<typeof schema._type>(oracle.infer)
      vi.expect(generatedStrict).toMatchInlineSnapshot(`"function isValid($0$){let errors=[];isValid.errors=errors;let errNo=0;if(errNo===0){let $isObj0=!!$0$ && typeof $0$==="object";if(!$isObj0||globalThis.Array.isArray($0$)){isValid.errors.push({path:"",schemaPath:"#/",keyword:"type",message:"must be an object (was "+typeof $0$+")"});errNo++;}if($isObj0){let $1$a=$0$["a"];if($1$a!==undefined && $1$a!==null){errNo++;isValid.errors.push({path:"a",schemaPath:"#/properties/a/",keyword:"type",message:"must be null (was "+typeof $1$a+")"});}}if($isObj0){let $1$b=$0$["b"];if($1$b!==undefined && $1$b!==null){errNo++;isValid.errors.push({path:"b",schemaPath:"#/properties/b/",keyword:"type",message:"must be null (was "+typeof $1$b+")"});}}}errNo===0&&(delete isValid.errors);return errNo===0;}"`)
    })
    test.prop(
      [validArbitrary, fuzzyArbitrary], 
      { 
        // numRuns: 100_000,
        examples: [],
      },
    )(
      "〖️⛳️〗› ❲shallow object w/ opt. props❳: parity with oracle",
      (valid, fuzz) => {
        const v = validator(valid)
        const o = oracle(valid)
        const vFuzz = validator(fuzz)
        const oFuzz = oracle(fuzz)
        vi.assert.equal(v, !(o instanceof type.errors))
        vi.assert.equal(vFuzz, !(oFuzz instanceof type.errors))
      }
    )
  })

  vi.describe("〖️⛳️〗‹‹ ❲validator.derive❳: shallow object w/ req. props", () => {
    const schema = t.object({ a: t.null(), b: t.null() })
    const oracle = type({ a: "null", b: "null" })
    const generatedStrict = Validator.derive(schema.toJsonSchema, strictFailSlow)
    const generatedLax = Validator.derive(schema.toJsonSchema, laxFailSlow)
    const validator = eval('(' + generatedLax + ')')
    const validArbitrary = fc.record({ a: fc.constant(null), b: fc.constant(null) }, { requiredKeys: [] })
    const fuzzyArbitrary = fc.oneof(
      fc.record({ 
        a: fc.oneof(
          fc.constant(null),
          fc.constant(undefined),
          fc.anything(),
        ),
        b: fc.oneof(
          fc.constant(null),
          fc.constant(undefined),
          fc.anything(),
        ),
        z: fc.anything(),
      }, { requiredKeys: [] }),
      fc.constant(undefined),
      fc.anything(),
    )
    vi.it("〖️⛳️〗› ❲validator.derive❳: shallow object w/ req. props", () => {
      vi.assertType<typeof oracle.infer>(schema._type)
      vi.assertType<typeof schema._type>(oracle.infer)
      vi.expect(generatedStrict).toMatchInlineSnapshot(`"function isValid($0$){let errors=[];isValid.errors=errors;let errNo=0;if(errNo===0){let $isObj0=!!$0$ && typeof $0$==="object";if(!$isObj0||globalThis.Array.isArray($0$)){isValid.errors.push({path:"",schemaPath:"#/",keyword:"type",message:"must be an object (was "+typeof $0$+")"});errNo++;}if((($isObj0 && $0$["a"]===undefined && (errNo++,void isValid.errors.push({path:"a",schemaPath:"#/required/",keyword:"required",message:"must have required property 'a'"}))) || ($isObj0 && $0$["b"]===undefined && (errNo++,void isValid.errors.push({path:"b",schemaPath:"#/required/",keyword:"required",message:"must have required property 'b'"}))))){};if($isObj0){let $1$a=$0$["a"];if($1$a!==null){errNo++;isValid.errors.push({path:"a",schemaPath:"#/properties/a/",keyword:"type",message:"must be null (was "+typeof $1$a+")"});}}if($isObj0){let $1$b=$0$["b"];if($1$b!==null){errNo++;isValid.errors.push({path:"b",schemaPath:"#/properties/b/",keyword:"type",message:"must be null (was "+typeof $1$b+")"});}}}errNo===0&&(delete isValid.errors);return errNo===0;}"`)
    })
    test.prop(
      [validArbitrary, fuzzyArbitrary], 
      { 
        // numRuns: 100_000,
        examples: [],
      },
    )(
      "〖️⛳️〗› ❲shallow object w/ req. props❳: snapshots, types",
      (valid, fuzz) => {
        const v = validator(valid)
        const o = oracle(valid)
        const vFuzz = validator(fuzz)
        const oFuzz = oracle(fuzz)
        vi.assert.equal(v, !(o instanceof type.errors))
        vi.assert.equal(vFuzz, !(oFuzz instanceof type.errors))
      }
    )
  })

  vi.describe("〖️⛳️〗‹‹ ❲validator.derive❳: nested object", () => {
    const schema = t.object({ a: t.object({ b: t.null() }), c: t.null() })
    const oracle = type({ a: { b: "null" }, c: "null" })
    const generatedStrict = Validator.derive(schema.toJsonSchema, strictFailSlow)
    const generatedLax = Validator.derive(schema.toJsonSchema, laxFailSlow)
    const validator = eval('(' + generatedLax + ')')
    const validArbitrary = fc.record({ 
      a: fc.record({ 
        b: fc.constant(null) 
      }, { requiredKeys: ["b"] }), 
      c: fc.constant(null) 
    }, { requiredKeys: ["a", "c"] })
    const fuzzyArbitrary = fc.oneof(
      fc.record({ 
        a: fc.oneof(
          fc.record({
            b: fc.oneof(
              fc.constant(null),
              fc.constant(undefined),
              fc.anything(),
            ),
            y: fc.anything(),
          }, { requiredKeys: [] }),
          fc.anything(),
        ),
        c: fc.oneof(
          fc.constant(null),
          fc.constant(undefined),
          fc.anything(),
        ),
        z: fc.anything(),
      }, { requiredKeys: [] }),
      fc.constant(undefined),
      fc.anything(),
    )
    vi.it("〖️⛳️〗› ❲validator.derive❳: nested object", () => {
      vi.assertType<typeof oracle.infer>(schema._type)
      vi.assertType<typeof schema._type>(oracle.infer)
      vi.expect(generatedStrict).toMatchInlineSnapshot(`"function isValid($0$){let errors=[];isValid.errors=errors;let errNo=0;if(errNo===0){let $isObj0=!!$0$ && typeof $0$==="object";if(!$isObj0||globalThis.Array.isArray($0$)){isValid.errors.push({path:"",schemaPath:"#/",keyword:"type",message:"must be an object (was "+typeof $0$+")"});errNo++;}if((($isObj0 && $0$["c"]===undefined && (errNo++,void isValid.errors.push({path:"c",schemaPath:"#/required/",keyword:"required",message:"must have required property 'c'"}))) || ($isObj0 && $0$["a"]===undefined && (errNo++,void isValid.errors.push({path:"a",schemaPath:"#/required/",keyword:"required",message:"must have required property 'a'"}))))){};if($isObj0){let $1$c=$0$["c"];if($1$c!==null){errNo++;isValid.errors.push({path:"c",schemaPath:"#/properties/c/",keyword:"type",message:"must be null (was "+typeof $1$c+")"});}}if($isObj0){let $1$a=$0$["a"];let $isObj1a=!!$1$a && typeof $1$a==="object";if(!$isObj1a||globalThis.Array.isArray($1$a)){isValid.errors.push({path:"a",schemaPath:"#/properties/a/",keyword:"type",message:"must be an object (was "+typeof $1$a+")"});errNo++;}if((($isObj1a && $1$a["b"]===undefined && (errNo++,void isValid.errors.push({path:"a.b",schemaPath:"#/properties/a/required/",keyword:"required",message:"must have required property 'b'"}))))){};if($isObj1a){let $2$ba=$1$a["b"];if($2$ba!==null){errNo++;isValid.errors.push({path:"a.b",schemaPath:"#/properties/a/properties/b/",keyword:"type",message:"must be null (was "+typeof $2$ba+")"});}}}}errNo===0&&(delete isValid.errors);return errNo===0;}"`)
    })
    test.prop(
      [validArbitrary, fuzzyArbitrary], 
      { 
        // numRuns: 100_000,
        examples: [],
      },
    )(
      "〖️⛳️〗› ❲nested object❳: parity with oracle",
      (valid, fuzz) => {
        const v = validator(valid)
        const o = oracle(valid)
        const vFuzz = validator(fuzz)
        const oFuzz = oracle(fuzz)
        vi.assert.equal(v, !(o instanceof type.errors))
        vi.assert.equal(vFuzz, !(oFuzz instanceof type.errors))
      }
    )
  })

  vi.describe("〖️⛳️〗‹‹ ❲validator.derive❳: deeply nested object", () => {
    const schema = t.object({ 
      a: t.object({ 
        b: t.optional(
          t.object({
            c: t.object({
              d: t.object({ 
                e: t.null(),
                f: t.object({ 
                  g: t.null(),
                  h: t.object({
                    i: t.optional(
                      t.object({
                        j: t.null(),
                        k: t.object({
                          l: t.object({
                            m: t.null(),
                            n: t.optional(
                              t.object({
                                o: t.object({
                                  p: t.null(),
                                }),
                                q: t.null(),
                              }),
                            ),
                            r: t.object({
                              s: t.null(),
                              t: t.optional(
                                t.object({
                                  u: t.boolean(),
                                }),
                              ),
                            }),
                            v: t.object({
                              w: t.null(),
                              x: t.string(),
                            }),
                          }),
                          y: t.null(),
                        }),
                      }),
                    ),
                  }),
                  z: t.null(),
                }),
              }),
              h: t.null(),
            }),
            i: t.null(),
          }),
        ),
        j: t.null(),
      }),
      k: t.null(),
    })

    const oracle = type({ 
      a: { 
        "b?": type({
          c: { 
            d: { 
              e: "null",
              f: { 
                g: "null",
                h: {
                  "i?": type({ 
                    j: "null",
                    k: {
                      l: {
                        m: "null",
                        "n?": type({
                          o: {
                            p: "null",
                          },
                          q: "null",
                        }).or("undefined"),
                        r: {
                          s: "null",
                          "t?": type({
                            u: "boolean",
                          }).or("undefined"),
                        },
                        v: {
                          w: "null",
                          x: "string",
                        }
                      },
                      y: "null",
                    },
                  }).or("undefined"),
                },
                z: "null",
              },
            },
            h: "null",
          },
          i: "null",
        }).or("undefined"),
        j: "null",
      },
      k: "null",
    })

    const validArbitrary = fc.record({
      a: fc.record({ 
        b: fc.optional(
          fc.record({
            c: fc.record({
              d: fc.record({ 
                e: fc.null(),
                f: fc.record({ 
                  g: fc.null(),
                  h: fc.record({
                    i: fc.optional(
                      fc.record({
                        j: fc.null(),
                        k: fc.record({
                          l: fc.record({
                            m: fc.null(),
                            n: fc.optional(
                              fc.record({
                                o: fc.record({
                                  p: fc.null(),
                                }),
                                q: fc.null(),
                              }),
                            ),
                            r: fc.record({
                              s: fc.null(),
                              t: fc.optional(
                                fc.record({
                                  u: fc.boolean(),
                                }),
                              ),
                            }),
                            v: fc.record({
                              w: fc.null(),
                              x: fc.string(),
                            }),
                          }),
                          y: fc.null(),
                        }),
                      }),
                    ),
                  }),
                  z: fc.null(),
                }),
              }),
              h: fc.null(),
            }),
            i: fc.null(),
          }),
        ),
        j: fc.null(),
      }),
      k: fc.null(),
    })

    const fuzzyArbitrary = fc.oneof(
      // fc.optional(
        fc.record({
          a: 
          // fc.optional(
            fc.oneof(
              fc.record({
                b: 
                // fc.optional(
                  fc.oneof(
                    fc.record({
                      c: 
                      // fc.optional(
                        fc.oneof(
                          fc.record({
                            d: 
                            // fc.optional(
                              fc.oneof(
                                fc.record({ 
                                  e: 
                                  // fc.optional(
                                    fc.oneof(
                                      fc.null(),
                                      fc.anything(),
                                    ),
                                  // ),
                                  f: 
                                  // fc.optional(
                                    fc.oneof(
                                      fc.record({
                                        g: 
                                        // fc.optional(
                                          fc.oneof(
                                            fc.null(),
                                            fc.anything(),
                                          ),
                                        // ),
                                        h: 
                                        // fc.optional(
                                          fc.oneof(
                                            fc.record({
                                              i: 
                                              // fc.optional(
                                                fc.oneof(
                                                  fc.record({
                                                    j: 
                                                    // fc.optional(
                                                      fc.oneof(
                                                        fc.null(),
                                                        fc.anything(),
                                                      ),
                                                    // ),
                                                    k: 
                                                    // fc.optional(
                                                      fc.oneof(
                                                        fc.record({
                                                          l: 
                                                          // fc.optional(
                                                            fc.oneof(
                                                              fc.record({
                                                                m: 
                                                                // fc.optional(
                                                                  fc.oneof(
                                                                    fc.null(), 
                                                                    fc.anything(),
                                                                  ),
                                                                // ),
                                                                n: 
                                                                // fc.optional(
                                                                  fc.oneof(
                                                                    fc.record({
                                                                      o: 
                                                                      // fc.optional(
                                                                        fc.oneof(
                                                                          fc.record({
                                                                            p: 
                                                                            // fc.optional(
                                                                              fc.oneof(
                                                                                fc.null(), 
                                                                                fc.anything(),
                                                                              ),
                                                                            // ),
                                                                          }),
                                                                          fc.anything(),
                                                                        ),
                                                                      // ),
                                                                      q: 
                                                                      // fc.optional(
                                                                        fc.oneof(
                                                                          fc.null(), 
                                                                          fc.anything(),
                                                                        ),
                                                                      // ),
                                                                    }),
                                                                    fc.anything(),
                                                                  ),
                                                                // ),
                                                                r: 
                                                                // fc.optional(
                                                                  fc.oneof(
                                                                    fc.record({
                                                                      s: 
                                                                      // fc.optional(
                                                                        fc.oneof(
                                                                          fc.null(), 
                                                                          fc.anything(),
                                                                        ),
                                                                      // ),
                                                                      t: 
                                                                      // fc.optional(
                                                                        fc.oneof(
                                                                          fc.record({
                                                                            u: 
                                                                            // fc.optional(
                                                                              fc.oneof(
                                                                                fc.boolean(), 
                                                                                fc.anything(),
                                                                              ),
                                                                            // ),
                                                                          }),
                                                                          fc.anything(),
                                                                        )
                                                                      // ),
                                                                    }),
                                                                  ),
                                                                // ),
                                                                v: 
                                                                // fc.optional(
                                                                  fc.oneof(
                                                                    fc.record({
                                                                      w: 
                                                                      // fc.optional(
                                                                        fc.oneof(
                                                                          fc.null(), 
                                                                          fc.anything(),
                                                                        ),
                                                                      // ),
                                                                      x: 
                                                                      // fc.optional(
                                                                        fc.oneof(
                                                                          fc.string(), 
                                                                          fc.anything(),
                                                                        ),
                                                                      // ),
                                                                    }),
                                                                    fc.anything(),
                                                                  ),
                                                                // ),
                                                              }),
                                                              fc.anything(),
                                                            ),
                                                          // ),
                                                          y: 
                                                          // fc.optional(
                                                            fc.oneof(
                                                              fc.null(), 
                                                              fc.anything(),
                                                            ),
                                                          // ),
                                                        }),
                                                      ),
                                                    // ),
                                                  }),
                                                  fc.anything(),
                                                ),
                                              // ),
                                            }),
                                            fc.anything(),
                                          ),
                                        // ),
                                        z: 
                                        // fc.optional(
                                          fc.oneof(
                                            fc.null(), 
                                            fc.anything(),
                                          ),
                                        // ),
                                      }),
                                      fc.anything(),
                                    ),
                                  // ),
                                }),
                                fc.anything(),
                              ),
                            // ),
                            h: 
                            // fc.optional(
                              fc.oneof(
                                fc.null(), 
                                fc.anything(),
                              ),
                            // ),
                          }),
                          fc.anything(),
                        ),
                      // ),
                      i: 
                      // fc.optional(
                        fc.oneof(
                          fc.null(), 
                          fc.anything(),
                        ),
                      // ),
                    }),
                  ),
                // ),
                j: 
                // fc.optional(
                  fc.oneof(
                    fc.null(), 
                    fc.anything(),
                  ),
                // ),
              }),
              fc.anything(),
            ),
          // ),
          k: 
          // fc.optional(
            fc.oneof(
              fc.null(), 
              fc.anything(),
            ),
          // ),
        }),
      // ),
      fc.anything(),
    )

    const generatedStrict = Validator.derive(schema.toJsonSchema, strictFailSlow)
    const generatedLax = Validator.derive(schema.toJsonSchema, laxFailSlow)
    const validator = eval('(' + generatedLax + ')')

    vi.it("〖️⛳️〗› ❲validator.derive❳: deeply nested object", () => {
      vi.assertType<typeof oracle.infer>(schema._type)
      vi.assertType<typeof schema._type>(oracle.infer)
      vi.expect(generatedStrict).toMatchInlineSnapshot(`"function isValid($0$){let errors=[];isValid.errors=errors;let errNo=0;if(errNo===0){let $isObj0=!!$0$ && typeof $0$==="object";if(!$isObj0||globalThis.Array.isArray($0$)){isValid.errors.push({path:"",schemaPath:"#/",keyword:"type",message:"must be an object (was "+typeof $0$+")"});errNo++;}if((($isObj0 && $0$["k"]===undefined && (errNo++,void isValid.errors.push({path:"k",schemaPath:"#/required/",keyword:"required",message:"must have required property 'k'"}))) || ($isObj0 && $0$["a"]===undefined && (errNo++,void isValid.errors.push({path:"a",schemaPath:"#/required/",keyword:"required",message:"must have required property 'a'"}))))){};if($isObj0){let $1$k=$0$["k"];if($1$k!==null){errNo++;isValid.errors.push({path:"k",schemaPath:"#/properties/k/",keyword:"type",message:"must be null (was "+typeof $1$k+")"});}}if($isObj0){let $1$a=$0$["a"];let $isObj1a=!!$1$a && typeof $1$a==="object";if(!$isObj1a||globalThis.Array.isArray($1$a)){isValid.errors.push({path:"a",schemaPath:"#/properties/a/",keyword:"type",message:"must be an object (was "+typeof $1$a+")"});errNo++;}if((($isObj1a && $1$a["j"]===undefined && (errNo++,void isValid.errors.push({path:"a.j",schemaPath:"#/properties/a/required/",keyword:"required",message:"must have required property 'j'"}))))){};if($isObj1a){let $2$ja=$1$a["j"];if($2$ja!==null){errNo++;isValid.errors.push({path:"a.j",schemaPath:"#/properties/a/properties/j/",keyword:"type",message:"must be null (was "+typeof $2$ja+")"});}}if($isObj1a){let $2$ba=$1$a["b"];if($2$ba!==undefined){let $isObj2a=!!$2$ba && typeof $2$ba==="object";if(!$isObj2a||globalThis.Array.isArray($2$ba)){isValid.errors.push({path:"a.b",schemaPath:"#/properties/a/properties/b/",keyword:"type",message:"must be an object (was "+typeof $2$ba+")"});errNo++;}if((($isObj2a && $2$ba["i"]===undefined && (errNo++,void isValid.errors.push({path:"a.b.i",schemaPath:"#/properties/a/properties/b/required/",keyword:"required",message:"must have required property 'i'"}))) || ($isObj2a && $2$ba["c"]===undefined && (errNo++,void isValid.errors.push({path:"a.b.c",schemaPath:"#/properties/a/properties/b/required/",keyword:"required",message:"must have required property 'c'"}))))){};if($isObj2a){let $3$iba=$2$ba["i"];if($3$iba!==null){errNo++;isValid.errors.push({path:"a.b.i",schemaPath:"#/properties/a/properties/b/properties/i/",keyword:"type",message:"must be null (was "+typeof $3$iba+")"});}}if($isObj2a){let $3$cba=$2$ba["c"];let $isObj3a=!!$3$cba && typeof $3$cba==="object";if(!$isObj3a||globalThis.Array.isArray($3$cba)){isValid.errors.push({path:"a.b.c",schemaPath:"#/properties/a/properties/b/properties/c/",keyword:"type",message:"must be an object (was "+typeof $3$cba+")"});errNo++;}if((($isObj3a && $3$cba["h"]===undefined && (errNo++,void isValid.errors.push({path:"a.b.c.h",schemaPath:"#/properties/a/properties/b/properties/c/required/",keyword:"required",message:"must have required property 'h'"}))) || ($isObj3a && $3$cba["d"]===undefined && (errNo++,void isValid.errors.push({path:"a.b.c.d",schemaPath:"#/properties/a/properties/b/properties/c/required/",keyword:"required",message:"must have required property 'd'"}))))){};if($isObj3a){let $4$hcba=$3$cba["h"];if($4$hcba!==null){errNo++;isValid.errors.push({path:"a.b.c.h",schemaPath:"#/properties/a/properties/b/properties/c/properties/h/",keyword:"type",message:"must be null (was "+typeof $4$hcba+")"});}}if($isObj3a){let $4$dcba=$3$cba["d"];let $isObj4a=!!$4$dcba && typeof $4$dcba==="object";if(!$isObj4a||globalThis.Array.isArray($4$dcba)){isValid.errors.push({path:"a.b.c.d",schemaPath:"#/properties/a/properties/b/properties/c/properties/d/",keyword:"type",message:"must be an object (was "+typeof $4$dcba+")"});errNo++;}if((($isObj4a && $4$dcba["e"]===undefined && (errNo++,void isValid.errors.push({path:"a.b.c.d.e",schemaPath:"#/properties/a/properties/b/properties/c/properties/d/required/",keyword:"required",message:"must have required property 'e'"}))) || ($isObj4a && $4$dcba["f"]===undefined && (errNo++,void isValid.errors.push({path:"a.b.c.d.f",schemaPath:"#/properties/a/properties/b/properties/c/properties/d/required/",keyword:"required",message:"must have required property 'f'"}))))){};if($isObj4a){let $5$edcba=$4$dcba["e"];if($5$edcba!==null){errNo++;isValid.errors.push({path:"a.b.c.d.e",schemaPath:"#/properties/a/properties/b/properties/c/properties/d/properties/e/",keyword:"type",message:"must be null (was "+typeof $5$edcba+")"});}}if($isObj4a){let $5$fdcba=$4$dcba["f"];let $isObj5a=!!$5$fdcba && typeof $5$fdcba==="object";if(!$isObj5a||globalThis.Array.isArray($5$fdcba)){isValid.errors.push({path:"a.b.c.d.f",schemaPath:"#/properties/a/properties/b/properties/c/properties/d/properties/f/",keyword:"type",message:"must be an object (was "+typeof $5$fdcba+")"});errNo++;}if((($isObj5a && $5$fdcba["g"]===undefined && (errNo++,void isValid.errors.push({path:"a.b.c.d.f.g",schemaPath:"#/properties/a/properties/b/properties/c/properties/d/properties/f/required/",keyword:"required",message:"must have required property 'g'"}))) || ($isObj5a && $5$fdcba["z"]===undefined && (errNo++,void isValid.errors.push({path:"a.b.c.d.f.z",schemaPath:"#/properties/a/properties/b/properties/c/properties/d/properties/f/required/",keyword:"required",message:"must have required property 'z'"}))) || ($isObj5a && $5$fdcba["h"]===undefined && (errNo++,void isValid.errors.push({path:"a.b.c.d.f.h",schemaPath:"#/properties/a/properties/b/properties/c/properties/d/properties/f/required/",keyword:"required",message:"must have required property 'h'"}))))){};if($isObj5a){let $6$gfdcba=$5$fdcba["g"];if($6$gfdcba!==null){errNo++;isValid.errors.push({path:"a.b.c.d.f.g",schemaPath:"#/properties/a/properties/b/properties/c/properties/d/properties/f/properties/g/",keyword:"type",message:"must be null (was "+typeof $6$gfdcba+")"});}}if($isObj5a){let $6$zfdcba=$5$fdcba["z"];if($6$zfdcba!==null){errNo++;isValid.errors.push({path:"a.b.c.d.f.z",schemaPath:"#/properties/a/properties/b/properties/c/properties/d/properties/f/properties/z/",keyword:"type",message:"must be null (was "+typeof $6$zfdcba+")"});}}if($isObj5a){let $6$hfdcba=$5$fdcba["h"];let $isObj6a=!!$6$hfdcba && typeof $6$hfdcba==="object";if(!$isObj6a||globalThis.Array.isArray($6$hfdcba)){isValid.errors.push({path:"a.b.c.d.f.h",schemaPath:"#/properties/a/properties/b/properties/c/properties/d/properties/f/properties/h/",keyword:"type",message:"must be an object (was "+typeof $6$hfdcba+")"});errNo++;}if($isObj6a){let $7$ihfdcba=$6$hfdcba["i"];if($7$ihfdcba!==undefined){let $isObj7a=!!$7$ihfdcba && typeof $7$ihfdcba==="object";if(!$isObj7a||globalThis.Array.isArray($7$ihfdcba)){isValid.errors.push({path:"a.b.c.d.f.h.i",schemaPath:"#/properties/a/properties/b/properties/c/properties/d/properties/f/properties/h/properties/i/",keyword:"type",message:"must be an object (was "+typeof $7$ihfdcba+")"});errNo++;}if((($isObj7a && $7$ihfdcba["j"]===undefined && (errNo++,void isValid.errors.push({path:"a.b.c.d.f.h.i.j",schemaPath:"#/properties/a/properties/b/properties/c/properties/d/properties/f/properties/h/properties/i/required/",keyword:"required",message:"must have required property 'j'"}))) || ($isObj7a && $7$ihfdcba["k"]===undefined && (errNo++,void isValid.errors.push({path:"a.b.c.d.f.h.i.k",schemaPath:"#/properties/a/properties/b/properties/c/properties/d/properties/f/properties/h/properties/i/required/",keyword:"required",message:"must have required property 'k'"}))))){};if($isObj7a){let $8$jihfdcba=$7$ihfdcba["j"];if($8$jihfdcba!==null){errNo++;isValid.errors.push({path:"a.b.c.d.f.h.i.j",schemaPath:"#/properties/a/properties/b/properties/c/properties/d/properties/f/properties/h/properties/i/properties/j/",keyword:"type",message:"must be null (was "+typeof $8$jihfdcba+")"});}}if($isObj7a){let $8$kihfdcba=$7$ihfdcba["k"];let $isObj8a=!!$8$kihfdcba && typeof $8$kihfdcba==="object";if(!$isObj8a||globalThis.Array.isArray($8$kihfdcba)){isValid.errors.push({path:"a.b.c.d.f.h.i.k",schemaPath:"#/properties/a/properties/b/properties/c/properties/d/properties/f/properties/h/properties/i/properties/k/",keyword:"type",message:"must be an object (was "+typeof $8$kihfdcba+")"});errNo++;}if((($isObj8a && $8$kihfdcba["y"]===undefined && (errNo++,void isValid.errors.push({path:"a.b.c.d.f.h.i.k.y",schemaPath:"#/properties/a/properties/b/properties/c/properties/d/properties/f/properties/h/properties/i/properties/k/required/",keyword:"required",message:"must have required property 'y'"}))) || ($isObj8a && $8$kihfdcba["l"]===undefined && (errNo++,void isValid.errors.push({path:"a.b.c.d.f.h.i.k.l",schemaPath:"#/properties/a/properties/b/properties/c/properties/d/properties/f/properties/h/properties/i/properties/k/required/",keyword:"required",message:"must have required property 'l'"}))))){};if($isObj8a){let $9$ykihfdcba=$8$kihfdcba["y"];if($9$ykihfdcba!==null){errNo++;isValid.errors.push({path:"a.b.c.d.f.h.i.k.y",schemaPath:"#/properties/a/properties/b/properties/c/properties/d/properties/f/properties/h/properties/i/properties/k/properties/y/",keyword:"type",message:"must be null (was "+typeof $9$ykihfdcba+")"});}}if($isObj8a){let $9$lkihfdcba=$8$kihfdcba["l"];let $isObj9a=!!$9$lkihfdcba && typeof $9$lkihfdcba==="object";if(!$isObj9a||globalThis.Array.isArray($9$lkihfdcba)){isValid.errors.push({path:"a.b.c.d.f.h.i.k.l",schemaPath:"#/properties/a/properties/b/properties/c/properties/d/properties/f/properties/h/properties/i/properties/k/properties/l/",keyword:"type",message:"must be an object (was "+typeof $9$lkihfdcba+")"});errNo++;}if((($isObj9a && $9$lkihfdcba["m"]===undefined && (errNo++,void isValid.errors.push({path:"a.b.c.d.f.h.i.k.l.m",schemaPath:"#/properties/a/properties/b/properties/c/properties/d/properties/f/properties/h/properties/i/properties/k/properties/l/required/",keyword:"required",message:"must have required property 'm'"}))) || ($isObj9a && $9$lkihfdcba["v"]===undefined && (errNo++,void isValid.errors.push({path:"a.b.c.d.f.h.i.k.l.v",schemaPath:"#/properties/a/properties/b/properties/c/properties/d/properties/f/properties/h/properties/i/properties/k/properties/l/required/",keyword:"required",message:"must have required property 'v'"}))) || ($isObj9a && $9$lkihfdcba["r"]===undefined && (errNo++,void isValid.errors.push({path:"a.b.c.d.f.h.i.k.l.r",schemaPath:"#/properties/a/properties/b/properties/c/properties/d/properties/f/properties/h/properties/i/properties/k/properties/l/required/",keyword:"required",message:"must have required property 'r'"}))))){};if($isObj9a){let $10$mlkihfdcba=$9$lkihfdcba["m"];if($10$mlkihfdcba!==null){errNo++;isValid.errors.push({path:"a.b.c.d.f.h.i.k.l.m",schemaPath:"#/properties/a/properties/b/properties/c/properties/d/properties/f/properties/h/properties/i/properties/k/properties/l/properties/m/",keyword:"type",message:"must be null (was "+typeof $10$mlkihfdcba+")"});}}if($isObj9a){let $10$vlkihfdcba=$9$lkihfdcba["v"];let $isObj10a=!!$10$vlkihfdcba && typeof $10$vlkihfdcba==="object";if(!$isObj10a||globalThis.Array.isArray($10$vlkihfdcba)){isValid.errors.push({path:"a.b.c.d.f.h.i.k.l.v",schemaPath:"#/properties/a/properties/b/properties/c/properties/d/properties/f/properties/h/properties/i/properties/k/properties/l/properties/v/",keyword:"type",message:"must be an object (was "+typeof $10$vlkihfdcba+")"});errNo++;}if((($isObj10a && $10$vlkihfdcba["w"]===undefined && (errNo++,void isValid.errors.push({path:"a.b.c.d.f.h.i.k.l.v.w",schemaPath:"#/properties/a/properties/b/properties/c/properties/d/properties/f/properties/h/properties/i/properties/k/properties/l/properties/v/required/",keyword:"required",message:"must have required property 'w'"}))) || ($isObj10a && $10$vlkihfdcba["x"]===undefined && (errNo++,void isValid.errors.push({path:"a.b.c.d.f.h.i.k.l.v.x",schemaPath:"#/properties/a/properties/b/properties/c/properties/d/properties/f/properties/h/properties/i/properties/k/properties/l/properties/v/required/",keyword:"required",message:"must have required property 'x'"}))))){};if($isObj10a){let $11$wvlkihfdcba=$10$vlkihfdcba["w"];if($11$wvlkihfdcba!==null){errNo++;isValid.errors.push({path:"a.b.c.d.f.h.i.k.l.v.w",schemaPath:"#/properties/a/properties/b/properties/c/properties/d/properties/f/properties/h/properties/i/properties/k/properties/l/properties/v/properties/w/",keyword:"type",message:"must be null (was "+typeof $11$wvlkihfdcba+")"});}}if($isObj10a){let $11$xvlkihfdcba=$10$vlkihfdcba["x"];if(typeof $11$xvlkihfdcba !== "string"){errNo++;isValid.errors.push({path:"a.b.c.d.f.h.i.k.l.v.x",schemaPath:"#/properties/a/properties/b/properties/c/properties/d/properties/f/properties/h/properties/i/properties/k/properties/l/properties/v/properties/x/",keyword:"type",message:"must be a string (was "+typeof $11$xvlkihfdcba+")"});}}}if($isObj9a){let $10$nlkihfdcba=$9$lkihfdcba["n"];if($10$nlkihfdcba!==undefined){let $isObj10a=!!$10$nlkihfdcba && typeof $10$nlkihfdcba==="object";if(!$isObj10a||globalThis.Array.isArray($10$nlkihfdcba)){isValid.errors.push({path:"a.b.c.d.f.h.i.k.l.n",schemaPath:"#/properties/a/properties/b/properties/c/properties/d/properties/f/properties/h/properties/i/properties/k/properties/l/properties/n/",keyword:"type",message:"must be an object (was "+typeof $10$nlkihfdcba+")"});errNo++;}if((($isObj10a && $10$nlkihfdcba["q"]===undefined && (errNo++,void isValid.errors.push({path:"a.b.c.d.f.h.i.k.l.n.q",schemaPath:"#/properties/a/properties/b/properties/c/properties/d/properties/f/properties/h/properties/i/properties/k/properties/l/properties/n/required/",keyword:"required",message:"must have required property 'q'"}))) || ($isObj10a && $10$nlkihfdcba["o"]===undefined && (errNo++,void isValid.errors.push({path:"a.b.c.d.f.h.i.k.l.n.o",schemaPath:"#/properties/a/properties/b/properties/c/properties/d/properties/f/properties/h/properties/i/properties/k/properties/l/properties/n/required/",keyword:"required",message:"must have required property 'o'"}))))){};if($isObj10a){let $11$qnlkihfdcba=$10$nlkihfdcba["q"];if($11$qnlkihfdcba!==null){errNo++;isValid.errors.push({path:"a.b.c.d.f.h.i.k.l.n.q",schemaPath:"#/properties/a/properties/b/properties/c/properties/d/properties/f/properties/h/properties/i/properties/k/properties/l/properties/n/properties/q/",keyword:"type",message:"must be null (was "+typeof $11$qnlkihfdcba+")"});}}if($isObj10a){let $11$onlkihfdcba=$10$nlkihfdcba["o"];let $isObj11a=!!$11$onlkihfdcba && typeof $11$onlkihfdcba==="object";if(!$isObj11a||globalThis.Array.isArray($11$onlkihfdcba)){isValid.errors.push({path:"a.b.c.d.f.h.i.k.l.n.o",schemaPath:"#/properties/a/properties/b/properties/c/properties/d/properties/f/properties/h/properties/i/properties/k/properties/l/properties/n/properties/o/",keyword:"type",message:"must be an object (was "+typeof $11$onlkihfdcba+")"});errNo++;}if((($isObj11a && $11$onlkihfdcba["p"]===undefined && (errNo++,void isValid.errors.push({path:"a.b.c.d.f.h.i.k.l.n.o.p",schemaPath:"#/properties/a/properties/b/properties/c/properties/d/properties/f/properties/h/properties/i/properties/k/properties/l/properties/n/properties/o/required/",keyword:"required",message:"must have required property 'p'"}))))){};if($isObj11a){let $12$ponlkihfdcba=$11$onlkihfdcba["p"];if($12$ponlkihfdcba!==null){errNo++;isValid.errors.push({path:"a.b.c.d.f.h.i.k.l.n.o.p",schemaPath:"#/properties/a/properties/b/properties/c/properties/d/properties/f/properties/h/properties/i/properties/k/properties/l/properties/n/properties/o/properties/p/",keyword:"type",message:"must be null (was "+typeof $12$ponlkihfdcba+")"});}}}}}if($isObj9a){let $10$rlkihfdcba=$9$lkihfdcba["r"];let $isObj10a=!!$10$rlkihfdcba && typeof $10$rlkihfdcba==="object";if(!$isObj10a||globalThis.Array.isArray($10$rlkihfdcba)){isValid.errors.push({path:"a.b.c.d.f.h.i.k.l.r",schemaPath:"#/properties/a/properties/b/properties/c/properties/d/properties/f/properties/h/properties/i/properties/k/properties/l/properties/r/",keyword:"type",message:"must be an object (was "+typeof $10$rlkihfdcba+")"});errNo++;}if((($isObj10a && $10$rlkihfdcba["s"]===undefined && (errNo++,void isValid.errors.push({path:"a.b.c.d.f.h.i.k.l.r.s",schemaPath:"#/properties/a/properties/b/properties/c/properties/d/properties/f/properties/h/properties/i/properties/k/properties/l/properties/r/required/",keyword:"required",message:"must have required property 's'"}))))){};if($isObj10a){let $11$srlkihfdcba=$10$rlkihfdcba["s"];if($11$srlkihfdcba!==null){errNo++;isValid.errors.push({path:"a.b.c.d.f.h.i.k.l.r.s",schemaPath:"#/properties/a/properties/b/properties/c/properties/d/properties/f/properties/h/properties/i/properties/k/properties/l/properties/r/properties/s/",keyword:"type",message:"must be null (was "+typeof $11$srlkihfdcba+")"});}}if($isObj10a){let $11$trlkihfdcba=$10$rlkihfdcba["t"];if($11$trlkihfdcba!==undefined){let $isObj11a=!!$11$trlkihfdcba && typeof $11$trlkihfdcba==="object";if(!$isObj11a||globalThis.Array.isArray($11$trlkihfdcba)){isValid.errors.push({path:"a.b.c.d.f.h.i.k.l.r.t",schemaPath:"#/properties/a/properties/b/properties/c/properties/d/properties/f/properties/h/properties/i/properties/k/properties/l/properties/r/properties/t/",keyword:"type",message:"must be an object (was "+typeof $11$trlkihfdcba+")"});errNo++;}if((($isObj11a && $11$trlkihfdcba["u"]===undefined && (errNo++,void isValid.errors.push({path:"a.b.c.d.f.h.i.k.l.r.t.u",schemaPath:"#/properties/a/properties/b/properties/c/properties/d/properties/f/properties/h/properties/i/properties/k/properties/l/properties/r/properties/t/required/",keyword:"required",message:"must have required property 'u'"}))))){};if($isObj11a){let $12$utrlkihfdcba=$11$trlkihfdcba["u"];if(typeof $12$utrlkihfdcba !== "boolean"){errNo++;isValid.errors.push({path:"a.b.c.d.f.h.i.k.l.r.t.u",schemaPath:"#/properties/a/properties/b/properties/c/properties/d/properties/f/properties/h/properties/i/properties/k/properties/l/properties/r/properties/t/properties/u/",keyword:"type",message:"must be a boolean (was "+typeof $12$utrlkihfdcba+")"});}}}}}}}}}}}}}}}}}errNo===0&&(delete isValid.errors);return errNo===0;}"`)
    })

    test.prop(
      [validArbitrary, fuzzyArbitrary], 
      { 
        // numRuns: 100_000,
        examples: [
          [{"a":{"b":undefined,"j":null},"k":null},{}]
        ],
      },
    )(
      "〖️⛳️〗› ❲deeply nested object❳: parity with oracle",
      (valid, fuzz) => {
        const v = validator(valid)
        const o = oracle(valid)
        const vFuzz = validator(fuzz)
        const oFuzz = oracle(fuzz)

        if (vFuzz === false) {
          // console.group("ERRORS")
          // console.log("fuzz", fuzz)
          // console.log(validator.errors)
          // console.groupEnd()
        }

        if (v !== (!(o instanceof type.errors))) {
          // console.group("MISMATCH")
          // console.log("valid", valid)
          // console.log("validator: ", validator(valid))
          // console.log("oracle: ", oracle(valid))
          // console.groupEnd()
        }

        if (vFuzz !== (!(oFuzz instanceof type.errors))) {
          // console.group("FUZZ MISMATCH")
          // console.log("fuzz", fuzz)
          // console.log("validator: ", validator(fuzz))
          // console.log("oracle: ", oracle(fuzz))
          // console.groupEnd()
        }

        vi.assert.equal(v, !(o instanceof type.errors))
        vi.assert.equal(vFuzz, !(oFuzz instanceof type.errors))
      }
    )
  })

  //////////////////////////
  ///    Intersection    ///
  const IntersectionSchema = t.allOf(
    t.object({ abc: t.boolean() }),
    t.object({ def: t.optional(t.boolean() )}),
  )
  const IntersectionJsonSchema = IntersectionSchema.toJsonSchema
  //    ^?
  console.log('intersection json schema', JSON.stringify(IntersectionJsonSchema, null, 2))

  const Intersection = {
    strict: () => Validator.derive(IntersectionJsonSchema, strict),
    lax: () => Validator.derive(IntersectionJsonSchema, lax),
    validator: () => Validator.derive(IntersectionJsonSchema, strictFailSlow),
    arbitrary: () => Arbitrary.derive.fold()(IntersectionJsonSchema),
    oracle: type(
      { abc: "boolean" }, 
      "&",
      { "def?": "boolean" },
    ),
  } as const

  vi.it("〖️⛳️〗› ❲validator.derive❳: Intersection (examples)", () => {
    vi.expect(Intersection.strict()).toMatchInlineSnapshot(`"(function isValid($0$){let v$0$=[(() => {if(!$0$||typeof $0$!=="object"||globalThis.Array.isArray($0$))return false;let $0$abc=$0$['abc'];if(typeof $0$abc!=="boolean")return false;return true;})(),(() => {if(!$0$||typeof $0$!=="object"||globalThis.Array.isArray($0$))return false;let $0$def=$0$['def'];if($0$def!==undefined&&typeof $0$def!=="boolean")return false;return true;})()].every((_) => _ === true);if(v$0$!==true)return false;return true;})"`)
    vi.expect(Intersection.lax()).toMatchInlineSnapshot(`"(function isValid($0$){let v$0$=[(() => {if(!$0$||typeof $0$!=="object")return false;let $0$abc=$0$['abc'];if(typeof $0$abc!=="boolean")return false;return true;})(),(() => {if(!$0$||typeof $0$!=="object")return false;let $0$def=$0$['def'];if($0$def!==undefined&&typeof $0$def!=="boolean")return false;return true;})()].every((_) => _ === true);if(v$0$!==true)return false;return true;})"`)
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
    "〖️⛳️〗› ❲validator.derive❳: Disjoint Union",
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
    vi.expect(Dict.strict()).toMatchInlineSnapshot(`"(function isValid($0$){if(!$0$||typeof $0$!=="object"||globalThis.Array.isArray($0$))return false;let $k0=globalThis.Object.keys($0$);for(let i=0;i<$k0.length;i++){let $1$=$0$[$k0[i]];if(typeof $1$!=="string")return false;}return true;})"`)
    vi.expect(Dict.lax()).toMatchInlineSnapshot(`"(function isValid($0$){if(!$0$||typeof $0$!=="object")return false;let $k0=globalThis.Object.keys($0$);for(let i=0;i<$k0.length;i++){let $1$=$0$[$k0[i]];if(typeof $1$!=="string")return false;}return true;})"`)
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
    vi.expect(DictOfStrings.strict()).toMatchInlineSnapshot(`"(function isValid($0$){if(!$0$||typeof $0$!=="object"||globalThis.Array.isArray($0$))return false;let $k0=globalThis.Object.keys($0$);for(let i=0;i<$k0.length;i++){let $1$=$0$[$k0[i]];if(!globalThis.Array.isArray($1$))return false;for(let i=0;i<$1$.length;i++){let $2$=$1$[i];if(typeof $2$!=="string")return false;}}return true;})"`)
    vi.expect(DictOfStrings.lax()).toMatchInlineSnapshot(`"(function isValid($0$){if(!$0$||typeof $0$!=="object")return false;let $k0=globalThis.Object.keys($0$);for(let i=0;i<$k0.length;i++){let $1$=$0$[$k0[i]];if(!globalThis.Array.isArray($1$))return false;for(let i=0;i<$1$.length;i++){let $2$=$1$[i];if(typeof $2$!=="string")return false;}}return true;})"`)
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
    vi.expect(DictOfDictionaries.strict()).toMatchInlineSnapshot(`"(function isValid($0$){if(!$0$||typeof $0$!=="object"||globalThis.Array.isArray($0$))return false;let $k0=globalThis.Object.keys($0$);for(let i=0;i<$k0.length;i++){let $1$=$0$[$k0[i]];if(!$1$||typeof $1$!=="object"||globalThis.Array.isArray($1$))return false;let $k1=globalThis.Object.keys($1$);for(let i=0;i<$k1.length;i++){let $2$=$1$[$k1[i]];if(typeof $2$!=="string")return false;}}return true;})"`)
    vi.expect(DictOfDictionaries.lax()).toMatchInlineSnapshot(`"(function isValid($0$){if(!$0$||typeof $0$!=="object")return false;let $k0=globalThis.Object.keys($0$);for(let i=0;i<$k0.length;i++){let $1$=$0$[$k0[i]];if(!$1$||typeof $1$!=="object")return false;let $k1=globalThis.Object.keys($1$);for(let i=0;i<$k1.length;i++){let $2$=$1$[$k1[i]];if(typeof $2$!=="string")return false;}}return true;})"`)
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
    vi.expect(Tuple.strict()).toMatchInlineSnapshot(`"(function isValid($0$){if(!Array.isArray($0$))return false;let $0$2=$0$[2];if(typeof $0$2!=="boolean")return false;let $0$0=$0$[0];if(typeof $0$0!=="string")return false;let $0$1=$0$[1];if(!globalThis.Array.isArray($0$1))return false;for(let i=0;i<$0$1.length;i++){let $1$1=$0$1[i];if(!Number.isInteger($1$1))return false;}return true;})"`)
    vi.expect(Tuple.lax()).toMatchInlineSnapshot(`"(function isValid($0$){if(!Array.isArray($0$))return false;let $0$2=$0$[2];if(typeof $0$2!=="boolean")return false;let $0$0=$0$[0];if(typeof $0$0!=="string")return false;let $0$1=$0$[1];if(!globalThis.Array.isArray($0$1))return false;for(let i=0;i<$0$1.length;i++){let $1$1=$0$1[i];if(!Number.isInteger($1$1))return false;}return true;})"`)
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
    vi.expect(KitchenSink.strict()).toMatchInlineSnapshot(`"(function isValid($0$){if(!$0$||typeof $0$!=="object"||globalThis.Array.isArray($0$))return false;let $0$a=$0$['a'];if($0$a!==undefined){if($0$a===null||typeof $0$a!=="object"||globalThis.Array.isArray($0$a))return false;let $0$ah=$0$a['h'];if($0$ah!==undefined&&typeof $0$ah!=="number")return false;let $0$ab=$0$a['b'];if($0$ab!==undefined){if(!Array.isArray($0$ab))return false;let $0$ab0=$0$ab[0];if(!$0$ab0||typeof $0$ab0!=="object"||globalThis.Array.isArray($0$ab0))return false;let $0$ab0d=$0$ab0['d'];if($0$ab0d!==undefined&&typeof $0$ab0d!=="number")return false;let $0$ab0e=$0$ab0['e'];if($0$ab0e!==undefined){if(!Array.isArray($0$ab0e))return false;let $0$ab0e0=$0$ab0e[0];if(!Array.isArray($0$ab0e0))return false;let $0$ab0e00=$0$ab0e0[0];if(!Array.isArray($0$ab0e00))return false;let $0$ab0e000=$0$ab0e00[0];if(!$0$ab0e000||typeof $0$ab0e000!=="object"||globalThis.Array.isArray($0$ab0e000))return false;let $0$ab0e000f=$0$ab0e000['f'];if(typeof $0$ab0e000f!=="string")return false;let $0$ab0e000g=$0$ab0e000['g'];if(typeof $0$ab0e000g!=="boolean")return false;}let $0$ab0c=$0$ab0['c'];if($0$ab0c!==undefined&&typeof $0$ab0c!=="boolean")return false;let $0$ab0f=$0$ab0['f'];if($0$ab0f!==undefined&&typeof $0$ab0f!=="number")return false;let $0$ab1=$0$ab[1];if(!$0$ab1||typeof $0$ab1!=="object"||globalThis.Array.isArray($0$ab1))return false;let $0$ab1g=$0$ab1['g'];if(typeof $0$ab1g!=="number")return false;}}return true;})"`)
    vi.expect(KitchenSink.lax()).toMatchInlineSnapshot(`"(function isValid($0$){if(!$0$||typeof $0$!=="object")return false;let $0$a=$0$['a'];if($0$a!==undefined){if($0$a===null||typeof $0$a!=="object")return false;let $0$ah=$0$a['h'];if($0$ah!==undefined&&typeof $0$ah!=="number")return false;let $0$ab=$0$a['b'];if($0$ab!==undefined){if(!Array.isArray($0$ab))return false;let $0$ab0=$0$ab[0];if(!$0$ab0||typeof $0$ab0!=="object")return false;let $0$ab0d=$0$ab0['d'];if($0$ab0d!==undefined&&typeof $0$ab0d!=="number")return false;let $0$ab0e=$0$ab0['e'];if($0$ab0e!==undefined){if(!Array.isArray($0$ab0e))return false;let $0$ab0e0=$0$ab0e[0];if(!Array.isArray($0$ab0e0))return false;let $0$ab0e00=$0$ab0e0[0];if(!Array.isArray($0$ab0e00))return false;let $0$ab0e000=$0$ab0e00[0];if(!$0$ab0e000||typeof $0$ab0e000!=="object")return false;let $0$ab0e000f=$0$ab0e000['f'];if(typeof $0$ab0e000f!=="string")return false;let $0$ab0e000g=$0$ab0e000['g'];if(typeof $0$ab0e000g!=="boolean")return false;}let $0$ab0c=$0$ab0['c'];if($0$ab0c!==undefined&&typeof $0$ab0c!=="boolean")return false;let $0$ab0f=$0$ab0['f'];if($0$ab0f!==undefined&&typeof $0$ab0f!=="number")return false;let $0$ab1=$0$ab[1];if(!$0$ab1||typeof $0$ab1!=="object")return false;let $0$ab1g=$0$ab1['g'];if(typeof $0$ab1g!=="number")return false;}}return true;})"`)
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
