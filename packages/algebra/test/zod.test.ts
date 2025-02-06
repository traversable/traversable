import * as vi from "vitest"
import { z } from "zod"

import { zod } from "@traversable/algebra"
import { _ } from "@traversable/registry"
import IR = zod.IR

vi.describe("〖️⛳️〗‹‹‹ ❲@traversable/algebra/zod❳", () => {
  vi.it("〖️⛳️〗› ❲zod.toString❳", () => {
    vi.expect( zod.toString( z.tuple([z.string(), z.number(), z.object({ pointsScored: z.number() })]) ))
    .toMatchInlineSnapshot(`"z.tuple([z.string(), z.number(), z.object({ pointsScored: z.number() })])"`)

    vi.expect( zod.toString( z.array(z.string()) ))
    .toMatchInlineSnapshot(`"z.array(z.string())"`)

    vi.expect( zod.toString( z.union([z.enum(["1", "2", "3"]), z.nativeEnum({ x: 0, y: 16, z: 32 })]) ))
    .toMatchInlineSnapshot(`"z.union([z.enum(["1", "2", "3"]), z.nativeEnum({ x: 0, y: 16, z: 32 })])"`)

    vi.expect( zod.toString( z.tuple([z.number()]).rest(z.boolean()) ))
    .toMatchInlineSnapshot(`"z.tuple([z.number()]).rest(z.boolean())"`)

    vi.expect( zod.toString( z.object({ a: z.string() }).catchall(z.boolean()) ))
    .toMatchInlineSnapshot(`"z.object({ a: z.string() }).catchall(z.boolean())"`)

    vi.expect( zod.toString( z.discriminatedUnion("tag", [z.object({ tag: z.literal("Nothing") }), z.object({ tag: z.literal("Just"), value: z.unknown() })]) ))
    .toMatchInlineSnapshot(`"z.discriminatedUnion("tag", [z.object({ tag: z.literal("Nothing") }), z.object({ tag: z.literal("Just"), value: z.unknown() })])"`)

    vi.expect( zod.toString( z.discriminatedUnion("tag", [z.object({ tag: z.literal("Nothing") }), z.object({ tag: z.literal("Just"), value: z.unknown() })]) ))
    .toMatchInlineSnapshot(`"z.discriminatedUnion("tag", [z.object({ tag: z.literal("Nothing") }), z.object({ tag: z.literal("Just"), value: z.unknown() })])"`)

    vi.expect( zod.toString( z.union([z.null(), z.symbol(), z.map(z.string(), z.void()), z.never(), z.any()]) ))
    .toMatchInlineSnapshot(`"z.union([z.null(), z.symbol(), z.map(z.string(), z.void()), z.never(), z.any()])"`)

    vi.expect( zod.toString( z.string().array() ))
    .toMatchInlineSnapshot(`"z.array(z.string())"`)

    vi.expect( zod.toString( z.record(z.record(z.array(z.number()))) ))
    .toMatchInlineSnapshot(`"z.record(z.record(z.array(z.number())))"`)

    vi.expect( zod.toString( z.lazy(() => z.record(z.array(z.number()))) ))
    .toMatchInlineSnapshot(`"z.lazy(() => z.record(z.array(z.number())))"`)

    vi.expect( zod.toString( z.date() ))
    .toMatchInlineSnapshot(`"z.date()"`)

    vi.expect( zod.toString( z.object({ v: z.number().int().finite(), w: z.number().min(0).lt(2), x: z.number().multipleOf(2), y: z.number().max(2).gt(0), z: z.number().nullable() }) ))
    .toMatchInlineSnapshot(`"z.object({ v: z.number().int().finite(), w: z.number().min(0).lt(2), x: z.number().multipleOf(2), y: z.number().max(2).gt(0), z: z.number().nullable() })"`)

    vi.expect( zod.toString( z.object({ x: z.array(z.number()).min(0).max(1), y: z.array(z.number()).length(1), z: z.array(z.array(z.array(z.literal('z')).min(9000)).max(9001)).length(9001) })))
    .toMatchInlineSnapshot(`"z.object({ x: z.array(z.number()).min(0).max(1), y: z.array(z.number()).length(1), z: z.array(z.array(z.array(z.literal("z")).min(9000)).max(9001)).length(9001) })"`)
  })

  const Null = IR.make.null()
  const examples = {
    null: Null,
    boolean: IR.make.boolean(),
    number: IR.make.number(),
    string: IR.make.string(),
    literal: IR.make.literal({ literal: null }),
    optional: IR.make.optional(Null),
    array: IR.make.array(Null),
    record: IR.make.record(Null),
    object: IR.make.object({ a: Null }),
    tuple: IR.make.tuple([Null, Null]),
    intersection: IR.make.intersection([Null, Null]),
    union: IR.make.union([Null, Null]),
  } as const

  // vi.it("〖️⛳️〗› ❲zod.IR.make❳", () => {
  //   vi.assert.deepEqual(
  //     { tag: z.ZodFirstPartyTypeKind.ZodNull, meta: {} },
  //     examples.null, 
  //   )
  //   vi.assert.deepEqual(
  //     { tag: z.ZodFirstPartyTypeKind.ZodBoolean, meta: {} },
  //     examples.boolean, 
  //   )
  //   vi.assert.deepEqual(
  //     { tag: z.ZodFirstPartyTypeKind.ZodNumber, meta: {} },
  //     examples.number,
  //   )
  //   vi.assert.deepEqual(
  //     { tag: z.ZodFirstPartyTypeKind.ZodString, meta: {} },
  //     examples.string, 
  //   )
  //   vi.assert.deepEqual(
  //     { tag: z.ZodFirstPartyTypeKind.ZodLiteral, meta: { literal: null } },
  //     examples.literal, 
  //   )
  //   vi.assert.deepEqual(
  //     { tag: z.ZodFirstPartyTypeKind.ZodOptional, meta: {}, def: Null },
  //     examples.optional, 
  //   )
  //   vi.assert.deepEqual(
  //     { tag: z.ZodFirstPartyTypeKind.ZodArray, meta: {}, def: Null },
  //     examples.array, 
  //   )
  //   vi.assert.deepEqual(
  //     { tag: z.ZodFirstPartyTypeKind.ZodRecord, meta: {}, def: Null },
  //     examples.record, 
  //   )
  //   vi.assert.deepEqual(
  //     { tag: z.ZodFirstPartyTypeKind.ZodObject, meta: {}, def: { a: Null } },
  //     examples.object, 
  //   )
  //   vi.assert.deepEqual(
  //     { tag: z.ZodFirstPartyTypeKind.ZodTuple, meta: {}, def: [Null, Null] },
  //     examples.tuple, 
  //   )
  //   vi.assert.deepEqual(
  //     { tag: z.ZodFirstPartyTypeKind.ZodIntersection, meta: {}, def: [Null, Null] },
  //     examples.intersection,
  //   )
  //   vi.assert.deepEqual(
  //     { tag: z.ZodFirstPartyTypeKind.ZodUnion, meta: {}, def: [Null, Null] },
  //     examples.union, 
  //   )
  // })

  // vi.it("〖️⛳️〗› ❲zod.IR.is❳", () => {
  //   vi.assert.isTrue(IR.is.null(examples.null))
  //   vi.assert.isFalse(IR.is.null(examples.boolean))

  //   vi.assert.isTrue(IR.is.boolean(examples.boolean))
  //   vi.assert.isFalse(IR.is.boolean(examples.null))

  //   vi.assert.isTrue(IR.is.number(examples.number))
  //   vi.assert.isFalse(IR.is.number(examples.null))

  //   vi.assert.isTrue(IR.is.string(examples.string))
  //   vi.assert.isFalse(IR.is.string(examples.null))

  //   vi.assert.isTrue(IR.is.array(examples.array))
  //   vi.assert.isFalse(IR.is.array(examples.null))

  //   vi.assert.isTrue(IR.is.record(examples.record))
  //   vi.assert.isFalse(IR.is.record(examples.null))

  //   vi.assert.isTrue(IR.is.object(examples.object))
  //   vi.assert.isFalse(IR.is.object(examples.null))

  //   vi.assert.isTrue(IR.is.tuple(examples.tuple))
  //   vi.assert.isFalse(IR.is.tuple(examples.null))

  //   vi.assert.isTrue(IR.is.intersection(examples.intersection))
  //   vi.assert.isFalse(IR.is.intersection(examples.null))

  //   vi.assert.isTrue(IR.is.union(examples.union))
  //   vi.assert.isFalse(IR.is.union(examples.null))
  // })

  // const Z = z.ZodFirstPartyTypeKind
  

  // /** 
  //  * Order of operations:
  //  * 
  //  * 1. Use {@link IR.arbitrary `IR.arbitrary`} to generate a pseudo-random
  //  *    intermediate representation of a Zod schema (arbitrary #1)
  //  * 2. From the IR, derive the corresponding Zod schema
  //  * 3. From the schema, derive a _separate_ arbitrary (arbitrary #2); this arbitrary will
  //  *    be responsible for generating data that schema should be able to parse
  //  * 4. Generate data from the arbitrary #2
  //  * 5. Parse the generated data using the generated schema 
  //  *
  //  * If this test is able to produce a counter-example, that indicates that _something_
  //  * in the chain isn't working properly.
  //  * 
  //  * This test is the moral equivalent of an integration test: we're trading granularity
  //  * for confidence that our programs can be composed together, and that their composition
  //  * has not caused any loss of fidelity.
  //  * 
  //  * TODO: depending on how coarse this tests proves to be, it might be worth decomposing
  //  * this test, so we have our cake and eat it too.
  //  */

  // test.prop(
  //   [
  //     IR.arbitrary({ 
  //       exclude: [
  //         /** 
  //          * TODO: __turn on property tests for intersections__
  //          * 
  //          * These are currently off because I haven't figured out how to 
  //          * programmatically generate tests intersections without quickly
  //          * running into schemas that are impossible to satisfy.
  //          * 
  //          * There's probably a clever way to do it, but I'm walking away from
  //          * this problem for now.
  //          */
  //         "intersection",
  //       ] 
  //     }).tree
  //   ], 
  //   {
  //     // numRuns: 100_000,
  //     numRuns: 10,
  //     endOnFailure: true,
  //     errorWithCause: true,
  //     verbose: true,
  //     examples: [
  //       [
  //         {
  //           "tag":Z.ZodTuple,"meta": {},"def":[ 
  //             {"tag":Z.ZodBoolean,"meta": {}}, 
  //             {"tag":Z.ZodNull,"meta": {}}, 
  //             {"tag":Z.ZodObject,"meta": {},"def": {"81635595": {
  //               "tag":Z.ZodNull,"meta": {}},"1061554849": {
  //               "tag":Z.ZodUnion,"meta": {},"def":[ {
  //               "tag":Z.ZodOptional,"meta": {},"def": {
  //               "tag":Z.ZodString,"meta": {}}}, {
  //               "tag":Z.ZodUnion,"meta": {},"def":[ {
  //               "tag":Z.ZodNull,"meta": {}}, {
  //               "tag":Z.ZodNull,"meta": {}}, {
  //               "tag":Z.ZodNull,"meta": {}}, {
  //               "tag":Z.ZodBoolean,"meta": {}}, {
  //               "tag":Z.ZodNull,"meta": {}}, {
  //               "tag":Z.ZodNull,"meta": {}}, {
  //               "tag":Z.ZodOptional,"meta": {},"def": {
  //               "tag":Z.ZodNull,"meta": {}}}, {
  //               "tag":Z.ZodNull,"meta": {}}]}, {
  //               "tag":Z.ZodNull,"meta": {}}, {
                
  //               "tag":Z.ZodUnion,"meta": {},"def":[ {
  //               "tag":Z.ZodNull,"meta": {}}, {
  //               "tag":Z.ZodNull,"meta": {}}, {
  //               "tag":Z.ZodNull,"meta":{}}, {
  //               "tag":Z.ZodNull,"meta": {}}, {
  //               "tag":Z.ZodNull,"meta": {}}, {
  //               "tag":Z.ZodString,"meta": {}}]}, {
  //               "tag":Z.ZodNull,"meta": {}}, {
  //               "tag":Z.ZodNull,"meta": {}}, {
  //               "tag":Z.ZodNull,"meta": {}}, {
  //               "tag":Z.ZodNull,"meta": {}}, {
  //               "tag":Z.ZodNull,"meta": {}}]},"1743851784": {
  //               "tag":Z.ZodString,"meta": {}},"Brw$D": {
  //               "tag":Z.ZodNull,"meta": {}},"$_0F_": {
  //               "tag":Z.ZodNumber,"meta": {}},"_U": {
  //               "tag":Z.ZodNull,"meta": {}},"C9_$_72t6x": {
  //               "tag":Z.ZodNull,"meta": {}},"R": {
  //               "tag":Z.ZodNull,"meta": {}},[Symbol.for("Ww_$")]: {
  //               "tag":Z.ZodNumber,"meta": {}},[Symbol.for("_c$$")]: {
  //               "tag":Z.ZodString,"meta": {}}}}, {
  //               "tag":Z.ZodObject,"meta": {},"def": {"334582093": {
  //               "tag":Z.ZodNull,"meta": {}},"_28": {"tag":Z.ZodOptional,"meta": {},"def": {"tag":Z.ZodString,"meta": {}}},"$s": {"tag":Z.ZodObject,"meta": {},"def": {"225474784": {"tag":Z.ZodObject,"meta":{},"def":{"175542874":{"tag":Z.ZodNull,"meta":{}},"531249800":{"tag":Z.ZodNull,"meta":{}},"568717621":{"tag":Z.ZodObject,"meta":{},"def":{"_1B__$g":{"tag":Z.ZodNull,"meta":{}}}},"2019941045":{"tag":Z.ZodNull,"meta":{}},"2128020207":{"tag":Z.ZodNull,"meta":{}},"P$495B_$4":{"tag":Z.ZodNull,"meta":{}},"a_$__YG_x_":{"tag":Z.ZodNull,"meta":{}},[Symbol.for("y_Z")]:{"tag":Z.ZodNull,"meta":{}}}},"334887904":{"tag":Z.ZodNull,"meta":{}},"1427593236":{"tag":Z.ZodNull,"meta":{}},"1936584550":{"tag":Z.ZodNull,"meta":{}},"$_x$$$Z":{"tag":Z.ZodNull,"meta":{}},"Rf_2$$_3":{"tag":Z.ZodNull,"meta":{}},[Symbol.for("$A$TB2")]:{"tag":Z.ZodNull,"meta":{}},[Symbol.for("oG77QG")]:{"tag":Z.ZodNumber,"meta":{}}}},"Ri$":{"tag":Z.ZodNull,"meta":{}},"c$4":{"tag":Z.ZodTuple,"meta":{},"def":[{"tag":Z.ZodOptional,"meta":{},"def":{"tag":Z.ZodNull,"meta":{}}},{"tag":Z.ZodNull,"meta":{}},{"tag":Z.ZodNull,"meta":{}},{"tag":Z.ZodNull,"meta":{}}]},[Symbol.for("_0M12v__c_0")]:{"tag":Z.ZodNull,"meta":{}}}}]}],
  //       [
  //         {
  //         "tag": Z.ZodTuple,
  //         "meta": {},
  //         "def": [
  //           {
  //             "tag": Z.ZodArray,
  //             "meta": {},
  //             "def": {
  //               "tag": Z.ZodObject,
  //               "meta": {},
  //               "def": {},
  //             }
  //           },
  //           {
  //             "tag": Z.ZodOptional,
  //             "meta": {},
  //             "def": {
  //               "tag": Z.ZodTuple,
  //               "meta": {},
  //               "def":[
  //                 {
  //                   "tag": Z.ZodNull,
  //                   "meta": {},
  //                 }, 
  //                 {
  //                   "tag": Z.ZodObject,
  //                   "meta": {},
  //                   "def": {
  //                     "500474855": {
  //                       "tag": Z.ZodNull,
  //                       "meta": {},
  //                     },
  //                     "j_": {
  //                       "tag": Z.ZodOptional,
  //                       "meta": {},
  //                       "def": {
  //                         "tag": Z.ZodNull,
  //                         "meta": {},
  //                       }
  //                     }
  //                   }
  //                 }, 
  //                 {
  //                   "tag": Z.ZodNull,
  //                   "meta": {},
  //                 },
  //               ]
  //             }
  //           }, 
  //           {
  //             "tag": Z.ZodBoolean,
  //             "meta": {}
  //           }, 
  //           {
  //             "tag": Z.ZodObject,
  //             "meta": {},
  //             "def": {},
  //           }
  //         ]
  //       }
  //     ]
  //   ]
  // })(
  //   "〖️⛳️〗› ❲zod.IntermediateRepresentation❳", 
  //   (ir) => {
  //     const schema = IR.toSchema(ir)
  //     const arbitrary = IR.toArbitrary(ir)
  //     const mock = fc.peek(arbitrary)
  //     const parsed = schema.safeParse(mock)
  //     if (!parsed.success) {
  //       console.group("\n\n\nFAILURE:\n\n\n")
  //       console.dir(["mock", mock], { depth: 10 })
  //       console.dir(["error", parsed.error], { depth: 10, getters: true })
  //       console.log(IR.toString(ir))
  //       console.groupEnd()
  //     }
  //     vi.assert.isTrue(parsed.success)
  //   }
  // )
})
