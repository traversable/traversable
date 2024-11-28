import * as vi from "vitest"

import { Property, type core, fc, is, test } from "@traversable/core"
import type { newtype } from "any-ts"

interface json<T = unknown> {
  null: core.is.null
  boolean: core.is.boolean
  integer: core.is.integer
  number: core.is.number
  string: core.is.string
  // allOf: (u: unknown) => u is {}
  anyOf: (u: unknown) => u is T
  array: (u: unknown) => u is readonly T[];
  object: (u: unknown) => u is is.object<{ [x: string]: T }>;
  tree: Omit<this, "tree">[keyof Omit<this, "tree">]
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


/** 
 * ## {@link json `json`}
 */ 
function json<T extends json>(constraints?: arbitrary.Constraints): fc.LetrecValue<T>
function json(_: arbitrary.Constraints = arbitrary.defaults) {
  return fc.letrec(
    (loop) => ({
      null: NullNode(_),
      boolean: BooleanNode(_),
      integer: IntegerNode(_),
      number: NumberNode(_),
      string: StringNode(_),
      array: ArrayNode(loop("tree") as never, _),
      object: ObjectNode(fc.dictionary(loop("tree")), _),
      anyOf: AnyOfNode(fc.array(loop("tree")) as never, _),
      // allOf: AllOfNode(loop("object") as never, _),
      tree: fc.oneof(
        _,
        loop("null"),
        loop("boolean"),
        loop("integer"),
        loop("number"),
        loop("string"),
        loop("array"),
        loop("object"),
        loop("anyOf"),
        // loop("allOf"),
      ),
    })
  ) 
}

// test.prop([json().tree], {})("testing guard", (guard) => {
//   console.log(guard)
//   vi.assert.isTrue(guard)
// })

function NullNode<T>(constraints?: arbitrary.Constraints): fc.Arbitrary<typeof is.null>
function NullNode(_: arbitrary.Constraints = arbitrary.defaults): fc.Arbitrary<typeof is.null> 
  /// impl.
  { return fc.constant(is.null) }

function BooleanNode(constraints?: arbitrary.Constraints): fc.Arbitrary<typeof is.boolean> 
function BooleanNode(_: arbitrary.Constraints = arbitrary.defaults): fc.Arbitrary<typeof is.boolean> 
  /// impl.
  { return fc.constant(is.boolean) }

function ArrayNode<T>(
  model: fc.Arbitrary<(u: unknown) => u is T>, 
  constraints?: arbitrary.Constraints 
): fc.Arbitrary<(u: unknown) => u is readonly T[]>

function ArrayNode<T>(
  model: fc.Arbitrary<(u: unknown) => u is T>, 
  _: arbitrary.Constraints = arbitrary.defaults
): fc.Arbitrary<(u: unknown) => u is readonly T[]>
  /// impl.
  { return model.map(is.array) }

function IntegerNode(constraints?: arbitrary.Constraints): fc.Arbitrary<typeof is.integer>
function IntegerNode(_: arbitrary.Constraints = arbitrary.defaults): fc.Arbitrary<typeof is.integer>
  /// impl.
  { return fc.constant(is.integer) }

function NumberNode(constraints?: arbitrary.Constraints): fc.Arbitrary<typeof is.number> 
function NumberNode(_: arbitrary.Constraints = arbitrary.defaults): fc.Arbitrary<typeof is.number> 
  /// impl.
  { return fc.constant(is.number) }

function StringNode(constraints?: arbitrary.Constraints): fc.Arbitrary<typeof is.string> 
function StringNode(_: arbitrary.Constraints = arbitrary.defaults): fc.Arbitrary<typeof is.string> 
  /// impl.
  { return fc.constant(is.string) }

function BigIntNode(constraints?: arbitrary.Constraints): fc.Arbitrary<typeof is.bigint> 
function BigIntNode(_: arbitrary.Constraints = arbitrary.defaults): fc.Arbitrary<typeof is.bigint> 
  /// impl.
  { return fc.constant(is.bigint) }

// function ObjectNode<
//   T extends { [x: string]: (u: any) => u is unknown },
//   S extends is.object.from<T> = is.object.from<T>
//   >(
//   model: fc.Arbitrary<T>, 
//   constraints?: arbitrary.Constraints
// ): fc.Arbitrary<typeof is.object<T, S>> 


// function AnyOfNode<
// // T extends readonly unknown[]
//   const T extends { [x: string]: (u: any) => u is unknown }, 
//   S extends is.object.from<T> = is.object.from<T>
// >(
//   model: fc.Arbitrary<T>,
//   constraints: arbitrary.Constraints = arbitrary.defaults
// ): fc.Arbitrary<(u: unknown) => u is is.object<S>> { return model.map((fns) => is.anyOf(...fns)) }

function AnyOfNode<T>(
  model: fc.Arbitrary<((u: unknown) => u is T)[]>,
  constraints?: arbitrary.Constraints
): fc.Arbitrary<(u: unknown) => u is T> 

// function AnyOfNode<T>(
//   model: fc.Arbitrary<unknown>,
//   constraints?: arbitrary.Constraints
// ): fc.Arbitrary<(u: unknown) => u is T> 

function AnyOfNode<T>(
  model: fc.Arbitrary<((u: unknown) => u is T)[]>,
  _: arbitrary.Constraints = arbitrary.defaults
): fc.Arbitrary<(u: unknown) => u is T> 
  /// impl.
  { return model.map((fns) => is.anyOf(...fns)) }

function AllOfNode<T extends { [x: string]: unknown }>(
  model: fc.Arbitrary<(u: unknown) => u is T> ,
  constraints?: arbitrary.Constraints
): fc.Arbitrary<(u: unknown) => u is is.allOf<readonly T[]>> 

function AllOfNode<T>(
  model: fc.Arbitrary<(u: unknown) => u is T> ,
  _: arbitrary.Constraints = arbitrary.defaults
): fc.Arbitrary<(u: unknown) => u is is.allOf<readonly T[]>> 
  /// impl.
  { return fc.array(model).map((fns) => is.allOf(...fns)) }

function ObjectNode<
  const T extends { [x: string]: (u: any) => u is unknown }, 
  S extends is.object.from<T> = is.object.from<T>
> (model: fc.Arbitrary<T>, constraints?: arbitrary.Constraints): 
  fc.Arbitrary<(u: unknown) => u is is.object<S>> 

function ObjectNode<
  const T extends { [x: string]: unknown }, 
  S extends is.object.from<T> = is.object.from<T>
> (model: fc.Arbitrary<T>, constraints?: arbitrary.Constraints): 
  fc.Arbitrary<(u: unknown) => u is is.object<S>> 

function ObjectNode<
  const T extends { [x: string]: (u: any) => u is unknown }, 
  S extends is.object.from<T> = is.object.from<T>
> (model: fc.Arbitrary<T>, _: arbitrary.Constraints = arbitrary.defaults): 
  fc.Arbitrary<(u: unknown) => u is is.object<S>> 
  /// impl.
  { return model.map(is.object) }

void (ObjectNode.options = ObjectNode_options)
function ObjectNode_options(): fc.Arbitrary<is.object.Options> {
  return fc.record({
    exactOptionalPropertyTypes: fc.boolean(),
  }, { requiredKeys: [] })
}

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
vi.describe("〖🚑〗‹‹‹ ❲@traversable/core/guard❳", () => {
  vi.it("〖🚑〗‹ ❲is.object❳", () => {
    vi.assert.isTrue(is.object.any({}))
    vi.assert.isFalse(is.object.any([]))
  })

  vi.it("〖🚑〗‹ ❲is.object❳: validates required fields", () => {
    const ex_01 = is.object({
      abc: is.literally("ABC"),
      def: is.array(is.literally("DEF")),
      ghi: is.anyOf(is.literally("G"), is.literally("H"), is.literally("I")),
      // jkl: is.integer
    })

    void vi.assert.isTrue(
      ex_01({
        abc: "ABC",
        def: ["DEF"],
        ghi: "I",
      })
    )
  })

  vi.it("〖🚑〗‹ ❲is.object❳: validates optional fields", () => {
    const ex_02 = is.object({
      mno: is.optional(is.string),
      pqr: is.optional(is.boolean),
      stu: is.optional(is.string),
    })
    void vi.assert.isTrue(ex_02({}))
    void vi.assert.isTrue(ex_02({ pqr: true }))
    void vi.assert.isTrue(ex_02({ pqr: false, mno: "true" }))
    void vi.assert.isFalse(ex_02({ mno: true }))
    void vi.assert.isFalse(ex_02({ pqr: "true" }))
    /** 
     * "stu" field here can be `undefined` because 
     * `exactOptionalPropertyTypes` has not been set
     * (defaults to false)
     */
    void vi.assert.isTrue(ex_02({ stu: undefined }))
  })

  vi.it("〖🚑〗‹ ❲is.object❳: supports exactOptionalPropertyTypes", () => {
    const ex_03 = is.object({
      mno: is.optional(is.string),
      pqr: is.optional(is.boolean),
      stu: is.optional(is.string),
    }, { exactOptionalPropertyTypes: true })

    void vi.assert.isTrue(ex_03({}))
    void vi.assert.isTrue(ex_03({ pqr: true }))
    void vi.assert.isTrue(ex_03({ pqr: false, mno: "true" }))
    void vi.assert.isFalse(ex_03({ mno: undefined }))
    void vi.assert.isFalse(ex_03({ pqr: undefined }))
    void vi.assert.isFalse(ex_03({ stu: undefined }))
    void vi.assert.isFalse(ex_03({ mno: undefined, pqr: undefined }))
    void vi.assert.isFalse(ex_03({ mno: undefined, pqr: undefined, stu: undefined }))
    void vi.assert.isFalse(ex_03({ pqr: undefined, stu: undefined }))
    void vi.assert.isFalse(ex_03({ mno: undefined, stu: undefined }))
  })

  vi.it("〖🚑〗‹ ❲is.object❳: validates mixed fields", () => {
    const ex_04 = is.object({
      vwx: is.number,
    })
    void vi.assert.isTrue(ex_04({ vwx: 10 }))
    void vi.assert.isTrue(ex_04({ vwx: 100, stu: true }))
    void vi.assert.isFalse(ex_04({}))
    void vi.assert.isFalse(ex_04({ yz: "true" }))
  })
})

vi.describe("〖🚑〗‹‹‹ ❲@traversable/core/guard❳: ", () => {
  vi.it("〖🚑〗‹ ❲is.partial❳: validates optional fields", () => {
    const ex_05 = is.partial({
      mno: is.string,
      pqr: is.boolean,
      stu: is.string,
    })
    void vi.assert.isTrue(ex_05({}))
    void vi.assert.isTrue(ex_05({ pqr: true }))
    void vi.assert.isTrue(ex_05({ pqr: false, mno: "true" }))
    void vi.assert.isFalse(ex_05({ mno: true }))
    void vi.assert.isFalse(ex_05({ pqr: "true" }))
    void vi.assert.isTrue(ex_05({ stu: undefined }))
    void vi.assert.isTrue(ex_05({ mno: undefined, stu: undefined }))
  })

  vi.it("〖🚑〗‹ ❲is.partial❳: supports exactOptionalPropertyTypes", () => {
    const ex_06 = is.partial({
      mno: is.string,
      pqr: is.boolean,
      stu: is.optional(is.string),
    }, { exactOptionalPropertyTypes: true })

    void vi.assert.isTrue(ex_06({}))
    void vi.assert.isTrue(ex_06({ pqr: true }))
    void vi.assert.isTrue(ex_06({ pqr: false, mno: "true" }))
    void vi.assert.isFalse(ex_06({ mno: undefined }))
    void vi.assert.isFalse(ex_06({ pqr: undefined }))
    void vi.assert.isFalse(ex_06({ stu: undefined }))
    void vi.assert.isFalse(ex_06({ mno: undefined, pqr: undefined }))
    void vi.assert.isFalse(ex_06({ mno: undefined, pqr: undefined, stu: undefined }))
    void vi.assert.isFalse(ex_06({ pqr: undefined, stu: undefined }))
    void vi.assert.isFalse(ex_06({ mno: undefined, stu: undefined }))
  })
})

vi.describe("〖🚑〗‹‹‹ ❲@traversable/core/guard❳: ", () => {
  vi.it("〖🚑〗‹ ❲is.tuple❳: validates required fields", () => {
    const ex_07 = is.tuple(
      is.literally("ABC"),
      is.tuple(is.literally("DEF"), is.tuple(is.number, is.tuple(is.anything))),
      is.anyOf(is.literally("G"), is.literally("H"), is.literally("I")),
    )
    void vi.assert.isTrue(ex_07([ "ABC", ["DEF", [9000, [new Date()]]], "G"]))
    void vi.assert.isTrue(ex_07([ "ABC", ["DEF", [9001, [/pattern/g]]], "G"]))
  })

  vi.it("〖🚑〗‹ ❲is.tuple❳: handles optional fields", () => {
    const ex_08 = is.tuple(
      is.string,
      is.number,
      is.optional(is.number),
    )
    vi.assert.isTrue(ex_08(["succeeds when optional element is not provided", 0]))
    vi.assert.isTrue(ex_08(["succeeds when optional element is provided", 0, 1]))
    vi.assert.isFalse(ex_08(["should fail", 0, "because of this element"]))
  })

  vi.it("〖🚑〗‹ ❲is.tuple❳: throws when given non-consecutive optionals", () => {
    vi.assert.throw(() => is.tuple(
      is.string,
      is.optional(is.anything),
      is.string,
      is.optional(is.anything),
      is.string,
    ))

    vi.assert.throw(() => is.tuple(
      is.optional(is.anything),
      is.string,
      is.optional(is.anything),
    ))
  })
})
