import * as vi from "vitest"

import { t, fc } from "@traversable/core"

interface json<T extends t.AST.Node = t.AST.Node> {
  null: ReturnType<typeof t.null>
  boolean: ReturnType<typeof t.boolean>
  number: ReturnType<typeof t.number>
  string: ReturnType<typeof t.string>
  array: ReturnType<typeof t.array<T>>
  object: ReturnType<typeof t.object<{ [x: string]: T }>>
  optional: ReturnType<typeof t.optional<T>>
  tree: 
    | this["null"] 
    | this["boolean"] 
    | this["number"] 
    | this["string"] 
    | this["array"] 
    | this["object"]
    | this["optional"]
}

const zz = t.object({ a: t.optional(t.array(t.number())), b: t.string() })
type zz = typeof zz._type

/** 
 * ## {@link json `json`}
 */ 
function json<T extends json>(constraints?: arbitrary.Constraints): fc.LetrecValue<T>
function json(_: arbitrary.Constraints = arbitrary.defaults) {
  return fc.letrec(
    (loop: fc.LetrecTypedTie<json>) => ({
      object: object_(fc.dictionary(loop("tree")), _),
      array: array_(loop("tree"), _),
      // optional: optional_(loop("tree"), _),
      string: string_(_),
      number: number_(_),
      boolean: boolean_(_),
      null: null_(_),
      tree: fc.oneof(
        _,
        loop("object"),
        loop("array"),
        // loop("optional"),
        loop("string"),
        loop("number"),
        loop("boolean"),
        loop("null"),
      ),
    })
  ) 
}

declare namespace arbitrary {
  interface Constraints extends fc.OneOfConstraints {}
}

namespace arbitrary {
  export const defaults = {
    withCrossShrink: false,
    depthIdentifier: { depth: 0 },
    depthSize: "small",
    maxDepth: globalThis.Number.POSITIVE_INFINITY,
  } satisfies globalThis.Required<arbitrary.Constraints>
}

function null_(constraints?: arbitrary.Constraints)
  : fc.Arbitrary<ReturnType<typeof t.null>>
function null_(_: arbitrary.Constraints = arbitrary.defaults)
  : fc.Arbitrary<ReturnType<typeof t.null>>
  { return fc.constant(t.null()) }

function boolean_(constraints?: arbitrary.Constraints)
  : fc.Arbitrary<ReturnType<typeof t.boolean>>
function boolean_(_: arbitrary.Constraints = arbitrary.defaults)
  : fc.Arbitrary<ReturnType<typeof t.boolean>> 
  { return fc.constant(t.boolean()) }

function number_(constraints?: arbitrary.Constraints)
  : fc.Arbitrary<ReturnType<typeof t.number>>
function number_(_: arbitrary.Constraints = arbitrary.defaults)
  : fc.Arbitrary<ReturnType<typeof t.number>> 
  { return fc.constant(t.number()) } 

function string_(constraints?: arbitrary.Constraints)
  : fc.Arbitrary<ReturnType<typeof t.string>>
function string_(_: arbitrary.Constraints = arbitrary.defaults)
  : fc.Arbitrary<ReturnType<typeof t.string>> 
  { return fc.constant(t.string()) }

function array_<T extends t.AST.Node>(
  model: fc.Arbitrary<T>, 
  constraints?: arbitrary.Constraints
): fc.Arbitrary<ReturnType<typeof t.array<T>>>
function array_<T extends t.AST.Node>(
  node: fc.Arbitrary<T>, 
  _: arbitrary.Constraints = arbitrary.defaults
): fc.Arbitrary<ReturnType<typeof t.array<T>>>
  { return node.map((x) => t.array(x)) }

function optional_<T extends t.AST.Node>(
  model: fc.Arbitrary<T>, 
  constraints?: arbitrary.Constraints
): fc.Arbitrary<ReturnType<typeof t.optional<T>>>
function optional_<T extends t.AST.Node>(
  node: fc.Arbitrary<T>, 
  _: arbitrary.Constraints = arbitrary.defaults
): fc.Arbitrary<ReturnType<typeof t.optional<T>>>
  { return node.map<ReturnType<typeof t.optional<T>>>(t.optional) }

// function object_<T extends { [x: string]: t.AST.Node } = {}>
//   (model: fc.Arbitrary<T>, constraints?: arbitrary.Constraints)
//   : fc.Arbitrary<ReturnType<typeof t.object<T>>> 

const zzzz = fc.entries(fc.array(fc.null())).map((xs) => Object.fromEntries(xs))

function object_<T extends { [x: string]: t.AST.Node } = {}>(
  model: fc.Arbitrary<T>, 
  _: arbitrary.Constraints = arbitrary.defaults
): fc.Arbitrary<ReturnType<typeof t.object<T>>> 
  { return model.map((xs) => t.object(xs)) }

vi.describe("〖⛳️〗‹‹‹ ❲@traversable/core/ast❳", () => {
  vi.it("〖⛳️〗› ❲t.object❳", () => {
    const gen = fc.peek(json().tree)
    console.log("gen", gen)
    console.log("gen", JSON.stringify(gen.toJSON(), null, 2))
  })
})

      // anyOf: AnyOfNode(fc.array(loop("tree")) as never, _),
      // integer: IntegerNode(_),
      // allOf: AllOfNode(loop("object") as never, _),
// test.prop([json().tree], {})("testing guard", (guard) => {
//   console.log(guard)
//   vi.assert.isTrue(guard)
// })


// function IntegerNode(constraints?: arbitrary.Constraints): fc.Arbitrary<typeof t.integer>
// function IntegerNode(_: arbitrary.Constraints = arbitrary.defaults): fc.Arbitrary<typeof S.integer>
//   /// impl.
//   { return fc.constant(S.integer) }

  // S extends S.object.from<T> = S.object.from<T>

// void (object_.options = ObjectNode_options)

// function object_options(): fc.Arbitrary<S.object.Options> {
//   return fc.record({
//     exactOptionalPropertyTypes: fc.boolean(),
//   }, { requiredKeys: [] })
// }

// function BigIntNode(constraints?: arbitrary.Constraints): fc.Arbitrary<typeof S.bigint> 
// function BigIntNode(_: arbitrary.Constraints = arbitrary.defaults): fc.Arbitrary<typeof S.bigint> 
//   /// impl.
//   { return fc.constant(S.bigint) }

// function ObjectNode<
//   T extends { [x: string]: (u: any) => u is unknown },
//   S extends S.object.from<T> = S.object.from<T>
//   >(
//   model: fc.Arbitrary<T>, 
//   constraints?: arbitrary.Constraints
// ): fc.Arbitrary<typeof S.object<T, S>> 


// function AnyOfNode<
// // T extends readonly unknown[]
//   const T extends { [x: string]: (u: any) => u is unknown }, 
//   S extends S.object.from<T> = S.object.from<T>
// >(
//   model: fc.Arbitrary<T>,
//   constraints: arbitrary.Constraints = arbitrary.defaults
// ): fc.Arbitrary<(u: unknown) => u is S.object<S>> { return model.map((fns) => S.anyOf(...fns)) }

// function AnyOfNode<T>(
//   model: fc.Arbitrary<((u: unknown) => u is T)[]>,
//   constraints?: arbitrary.Constraints
// ): fc.Arbitrary<(u: unknown) => u is T> 

// function AnyOfNode<T>(
//   model: fc.Arbitrary<unknown>,
//   constraints?: arbitrary.Constraints
// ): fc.Arbitrary<(u: unknown) => u is T> 

// function AnyOfNode<T>(
//   model: fc.Arbitrary<((u: unknown) => u is T)[]>,
//   _: arbitrary.Constraints = arbitrary.defaults
// ): fc.Arbitrary<(u: unknown) => u is T> 
//   /// impl.
//   { return model.map((fns) => S.anyOf(...fns)) }

// function AllOfNode<T extends { [x: string]: unknown }>(
//   model: fc.Arbitrary<(u: unknown) => u is T> ,
//   constraints?: arbitrary.Constraints
// ): fc.Arbitrary<(u: unknown) => u is S.allOf<readonly T[]>> 

// function AllOfNode<T>(
//   model: fc.Arbitrary<(u: unknown) => u is T> ,
//   _: arbitrary.Constraints = arbitrary.defaults
// ): fc.Arbitrary<(u: unknown) => u is S.allOf<readonly T[]>> 
//   /// impl.
//   { return fc.array(model).map((fns) => S.allOf(...fns)) }


/** 
 * =========================
 *    EXAMPLE-BASED TESTS
 * =========================
 * 
 * These tests are included as a form of documentation only.
 * 
 * The actual tests (the ones that give us confidence) 
 * are located in the `describe` block directly below this one.
 */
// vi.describe("〖🚑〗‹‹‹ ❲@traversable/core/guard❳", () => {
//   vi.it("〖🚑〗› ❲S.object❳", () => {
//     vi.assert.isTrue(S.object.any({}))
//     vi.assert.isFalse(S.object.any([]))
//   })

//   vi.it("〖🚑〗› ❲S.object❳: validates required fields", () => {
//     const ex_01 = S.object({
//       abc: S.const("ABC"),
//       def: S.array(S.const("DEF")),
//       ghi: S.anyOf(S.const("G"), S.const("H"), S.const("I")),
//     })

//     void vi.assert.isTrue(
//       ex_01({
//         abc: "ABC",
//         def: ["DEF"],
//         ghi: "I",
//       })
//     )
//   })

//   vi.it("〖🚑〗› ❲S.object❳: validates optional fields", () => {
//     const ex_02 = S.object({
//       mno: S.optional(S.string),
//       pqr: S.optional(S.boolean),
//       stu: S.optional(S.string),
//     })
//     void vi.assert.isTrue(ex_02({}))
//     void vi.assert.isTrue(ex_02({ pqr: true }))
//     void vi.assert.isTrue(ex_02({ pqr: false, mno: "true" }))
//     void vi.assert.isFalse(ex_02({ mno: true }))
//     void vi.assert.isFalse(ex_02({ pqr: "true" }))
//     /** 
//      * "stu" field here can be `undefined` because 
//      * `exactOptionalPropertyTypes` has not been set
//      * (defaults to false)
//      */
//     void vi.assert.isTrue(ex_02({ stu: undefined }))
//   })

//   vi.it("〖🚑〗› ❲S.object❳: supports exactOptionalPropertyTypes", () => {
//     const ex_03 = S.object({
//       mno: S.optional(S.string),
//       pqr: S.optional(S.boolean),
//       stu: S.optional(S.string),
//     }, { exactOptionalPropertyTypes: true })

//     void vi.assert.isTrue(ex_03({}))
//     void vi.assert.isTrue(ex_03({ pqr: true }))
//     void vi.assert.isTrue(ex_03({ pqr: false, mno: "true" }))
//     void vi.assert.isFalse(ex_03({ mno: undefined }))
//     void vi.assert.isFalse(ex_03({ pqr: undefined }))
//     void vi.assert.isFalse(ex_03({ stu: undefined }))
//     void vi.assert.isFalse(ex_03({ mno: undefined, pqr: undefined }))
//     void vi.assert.isFalse(ex_03({ mno: undefined, pqr: undefined, stu: undefined }))
//     void vi.assert.isFalse(ex_03({ pqr: undefined, stu: undefined }))
//     void vi.assert.isFalse(ex_03({ mno: undefined, stu: undefined }))
//   })

//   vi.it("〖🚑〗› ❲S.object❳: validates mixed fields", () => {
//     const ex_04 = S.object({
//       vwx: S.number,
//     })
//     void vi.assert.isTrue(ex_04({ vwx: 10 }))
//     void vi.assert.isTrue(ex_04({ vwx: 100, stu: true }))
//     void vi.assert.isFalse(ex_04({}))
//     void vi.assert.isFalse(ex_04({ yz: "true" }))
//   })
// })

// vi.describe("〖🚑〗‹‹‹ ❲@traversable/core/guard❳: ", () => {
//   vi.it("〖🚑〗› ❲S.partial❳: validates optional fields", () => {
//     const ex_05 = S.partial({
//       mno: S.string,
//       pqr: S.boolean,
//       stu: S.string,
//     })
//     void vi.assert.isTrue(ex_05({}))
//     void vi.assert.isTrue(ex_05({ pqr: true }))
//     void vi.assert.isTrue(ex_05({ pqr: false, mno: "true" }))
//     void vi.assert.isFalse(ex_05({ mno: true }))
//     void vi.assert.isFalse(ex_05({ pqr: "true" }))
//     void vi.assert.isTrue(ex_05({ stu: undefined }))
//     void vi.assert.isTrue(ex_05({ mno: undefined, stu: undefined }))
//   })

//   vi.it("〖🚑〗› ❲S.partial❳: supports exactOptionalPropertyTypes", () => {
//     const ex_06 = S.partial({
//       mno: S.string,
//       pqr: S.boolean,
//       stu: S.optional(S.string),
//     }, { exactOptionalPropertyTypes: true })

//     void vi.assert.isTrue(ex_06({}))
//     void vi.assert.isTrue(ex_06({ pqr: true }))
//     void vi.assert.isTrue(ex_06({ pqr: false, mno: "true" }))
//     void vi.assert.isFalse(ex_06({ mno: undefined }))
//     void vi.assert.isFalse(ex_06({ pqr: undefined }))
//     void vi.assert.isFalse(ex_06({ stu: undefined }))
//     void vi.assert.isFalse(ex_06({ mno: undefined, pqr: undefined }))
//     void vi.assert.isFalse(ex_06({ mno: undefined, pqr: undefined, stu: undefined }))
//     void vi.assert.isFalse(ex_06({ pqr: undefined, stu: undefined }))
//     void vi.assert.isFalse(ex_06({ mno: undefined, stu: undefined }))
//   })
// })

// vi.describe("〖🚑〗‹‹‹ ❲@traversable/core/guard❳: ", () => {
//   vi.it("〖🚑〗› ❲S.tuple❳: validates required fields", () => {
//     const ex_07 = S.tuple(
//       S.const("ABC"),
//       S.tuple(S.const("DEF"), S.tuple(S.number, S.tuple(S.anything))),
//       S.anyOf(S.const("G"), S.const("H"), S.const("I")),
//     )
//     void vi.assert.isTrue(ex_07([ "ABC", ["DEF", [9000, [new Date()]]], "G"]))
//     void vi.assert.isTrue(ex_07([ "ABC", ["DEF", [9001, [/pattern/g]]], "G"]))
//   })

//   vi.it("〖🚑〗› ❲S.tuple❳: handles optional fields", () => {
//     const ex_08 = S.tuple(
//       S.string,
//       S.number,
//       S.optional(S.number),
//     )
//     vi.assert.isTrue(ex_08(["succeeds when optional element is not provided", 0]))
//     vi.assert.isTrue(ex_08(["succeeds when optional element is provided", 0, 1]))
//     vi.assert.isFalse(ex_08(["should fail", 0, "because of this element"]))
//   })

//   vi.it("〖🚑〗› ❲S.tuple❳: throws when given non-consecutive optionals", () => {
//     vi.assert.throw(() => S.tuple(
//       S.string,
//       S.optional(S.anything),
//       S.string,
//       S.optional(S.anything),
//       S.string,
//     ))

//     vi.assert.throw(() => S.tuple(
//       S.optional(S.anything),
//       S.string,
//       S.optional(S.anything),
//     ))
//   })
// })

