import type { integer } from "@traversable/registry"
import * as vi from "vitest"

import { TagTree, fc, fromSeed, show, t, test } from "@traversable/core"
import { fn, map } from "@traversable/data"

namespace Arbitrary {
  export type Options = Partial<fc.OneOfConstraints>
  export const defaults = {
    depthIdentifier: { depth: 1 },
    depthSize: "medium",
    maxDepth: 10,
    withCrossShrink: false,
  } satisfies Required<Arbitrary.Options>

  export type LetrecTagTree = {
    any: TagTree.any
    allOf: TagTree.allOfF<readonly TagTree[]>
    anyOf: TagTree.anyOfF<readonly TagTree[]>
    array: TagTree.arrayF<TagTree>
    boolean: TagTree.boolean
    const: TagTree.const
    integer: TagTree.integer
    null: TagTree.null
    number: TagTree.number
    object: TagTree.objectF<Record<string, TagTree>>
    optional: TagTree.optionalF<TagTree>
    record: TagTree.recordF<Record<string, TagTree>>
    string: TagTree.string
    tuple: TagTree.tupleF<readonly TagTree[]>
    tree: TagTree.F<unknown>
  }

  export const letrecTagTree 
    : (options?: Arbitrary.Options) => fc.LetrecValue<LetrecTagTree>
    = ($ = Arbitrary.defaults) => fc.letrec(
      (loop: fc.LetrecTypedTie<LetrecTagTree>) => ({
        any: fc.constant(TagTree.byName.any()),
        allOf: fc.array(loop("tree")).map(TagTree.byName.allOf),
        anyOf: fc.array(loop("tree")).map(TagTree.byName.anyOf),
        array: loop("tree").map(TagTree.byName.array),
        boolean: fc.constant(TagTree.byName.boolean()),
        const: fc.constant(TagTree.byName.constant()),
        integer: fc.constant(TagTree.byName.integer()),
        null: fc.constant(TagTree.byName.null()),
        number: fc.constant(TagTree.byName.number()),
        object: fc.entries(loop("tree")).map(TagTree.byName.object),
        optional: loop("tree").map(TagTree.byName.optional),
        record: loop("tree").map(TagTree.byName.record),
        string: fc.constant(TagTree.byName.string()),
        tuple: fc.array(loop("tree")).map(TagTree.byName.tuple),
        tree: fc.oneof(
          $,
          loop("any"),
          loop("null"),
          loop("anyOf"),
          loop("boolean"),
          loop("array"),
          loop("object"),
          loop("record"),
          loop("tuple"),
          loop("integer"),
          loop("number"),
          loop("string"),
          loop("optional"),
        )
      })
    )

  export const terminal
    : fc.Arbitrary<t.Terminal>
    = fc.constantFrom(...t.Terminals)
  
  export type LetrecShort = (
    & { tree: t.AST.Short }
    & {
      booleans: "boolean" | "boolean[]" | "boolean{}";
      symbols: "symbol" | "symbol[]" | "symbol{}";
      integers: "integer" | "integer[]" | "integer{}";
      numbers: "number" | "number[]" | "number{}";
      strings: "string" | "string[]" | "string{}";
    }
    & {
      allOf: readonly ["&", t.AST.Short[]]
      anyOf: readonly ["|", t.AST.Short[]]
      array: readonly ["[]", t.AST.Short]
      record: readonly ["{}", t.AST.Short]
      tuple: readonly t.AST.Short[]
      object: Record<string, t.AST.Short>
    } 
  )

  export const maybeOptionalProperty = fc
    .tuple(fc.identifier(), fc.boolean())
    .map(([prop, isRequired]) => isRequired ? prop : `${prop}?`)

  export const optionalsDictionary = <T>(model: fc.Arbitrary<T>) => 
    fc.dictionary(maybeOptionalProperty, model)

  export const letrecShort
    : (options?: Arbitrary.Options) => fc.LetrecValue<LetrecShort>
    = ($ = Arbitrary.defaults) => fc.letrec(
      (loop) => ({
        booleans: fc.constantFrom("boolean", "boolean[]", "boolean{}"),
        symbols: fc.constantFrom("symbol", "symbol[]", "symbol{}"),
        integers: fc.constantFrom("integer", "integer[]", "integer{}"),
        numbers: fc.constantFrom("number", "number[]", "number{}"),
        strings: fc.constantFrom("string", "string[]", "string{}"),
        allOf: fc.tuple(fc.constant("&"), fc.array(loop("tree"))),
        anyOf: fc.tuple(fc.constant("|"), fc.array(loop("tree"))),
        array: fc.tuple(fc.constant("[]"), loop("tree")),
        record: fc.tuple(fc.constant("{}"), loop("tree")),
        tuple: fc.array(loop("tree")),
        object: optionalsDictionary(loop("tree")),
        tree: fc.oneof(
          $,
          loop("booleans"),
          loop("symbols"),
          loop("integers"),
          loop("numbers"),
          loop("strings"),
          loop("allOf"),
          loop("anyOf"),
          loop("array"),
          loop("record"),
          loop("tuple"),
          loop("object"),
        ),
      })
    )
}

const tagTree = Arbitrary.letrecTagTree({ 
  depthIdentifier: Arbitrary.defaults.depthIdentifier,
  depthSize: Arbitrary.defaults.depthSize,
  maxDepth: Arbitrary.defaults.maxDepth,
  withCrossShrink: Arbitrary.defaults.withCrossShrink,
})

const makeAstNode = fn.flow(
  Arbitrary.letrecShort,
  (xs) => xs.tree.map(t.fromSeed),
)

const nodeArbitrary = makeAstNode({ 
  depthIdentifier: Arbitrary.defaults.depthIdentifier,
  depthSize: "xsmall",
  maxDepth: 3,
  withCrossShrink: Arbitrary.defaults.withCrossShrink,
})

// Arbitrary.letrecShort({ 
//   depthIdentifier: Arbitrary.defaults.depthIdentifier,
//   depthSize: "xsmall",
//   maxDepth: 3,
//   withCrossShrink: Arbitrary.defaults.withCrossShrink,
// })


  // : fc.Arbitrary<t.AST.Short>

vi.describe(`〖⛳️〗‹‹‹ ❲@traversable/core/ast❳`, () => {

  test.prop([nodeArbitrary], { endOnFailure: false })(
    `〖⛳️〗› ❲ast: constructors❳`, (node) => {
      // console.log("tagTree", tagTree)
      console.log("astNode", node)
      // console.log("fromSeed(tagTree)", fromSeed(tagTree))
      // console.log("t.fromSeed(short)", show.serialize(t.fromSeed(short), "leuven"))
      // console.log("fromSeed(seed)", fromSeed(seed))
      vi.assert.isTrue(true)
      
    }
  )

	// vi.it(`〖⛳️〗› ❲ast: fromShorthand❳`, () => {
  //   console.log("null", t.short(null)())
  //   console.log("boolean", t.short("boolean")())
  //   console.log("boolean[]", t.short("boolean[]")())
  //   console.log("boolean{}", t.short("boolean{}")())

  //   console.log("number", t.short("number")())
  //   console.log("number[]", t.short("number[]")())
  //   console.log("number{}", t.short("number{}")())

  //   console.log("integer", t.short("integer")())
  //   console.log("integer[]", t.short("integer[]")())
  //   console.log("integer{}", t.short("integer{}")())

  //   console.log("string", t.short("string")())
  //   console.log("string[]", t.short("string[]")())
  //   console.log("string{}", t.short("string{}")())

  //   console.log("tuple", t.short(["number", "string", "boolean"])())
  //   console.log("object", t.short({ a: "number", b: "string", c: "boolean" })())

  //   console.log("object", t.short({ a: "number", b: "string", c: "boolean" })())

  //   console.log("record", t.short("{}", "string")())

  //   t.fromSeed()

    // console.log("string[]", t.short("string[]")())
    // console.log("string{}", t.short("string{}")())

    // console.log("string", t.short("&", {})())
    // console.log("string[]", t.short("string[]")())
    // console.log("string{}", t.short("string{}")())
  // })

    
})

vi.describe("〖🧙〗‹‹‹ ❲@traversable/core/ast❳", () => {
  vi.it("〖🧙〗› ❲ast.short❳", () => {
    vi.assertType<t.null>(t.short(null))
    vi.assertType<t.const<"abc">>(t.short("'abc'"))
    vi.assertType<t.boolean>(t.short("boolean"))
    vi.assertType<t.symbol>(t.short("symbol"))
    vi.assertType<t.integer>(t.short("integer"))
    vi.assertType<t.number>(t.short("number"))
    vi.assertType<t.array<t.boolean>>(t.short("boolean[]"))
    vi.assertType<t.record<t.boolean>>(t.short("boolean{}"))
    vi.assertType<t.array<t.symbol>>(t.short("symbol[]"))
    vi.assertType<t.record<t.symbol>>(t.short("symbol{}"))
    vi.assertType<t.array<t.integer>>(t.short("integer[]"))
    vi.assertType<t.record<t.integer>>(t.short("integer{}"))
    vi.assertType<t.array<t.number>>(t.short("number[]"))
    vi.assertType<t.record<t.number>>(t.short("number{}"))
    vi.assertType<t.array<t.string>>(t.short("string[]"))
    vi.assertType<t.record<t.string>>(t.short("string{}"))
    vi.assertType(t.short("[]", null))
    vi.assertType(t.short("[]", null))
    vi.assertType(t.short("{}", null))
    vi.assertType(t.short(["boolean", "string", "number"]))
    vi.assertType(t.short(["boolean", "string", "number"]))

    vi.assertType
    <
      t.object<{
        a: t.array<t.boolean>,
        b: t.object<{
          c: t.tuple<[t.record<t.string>]>
        }>
      }>
    >
    (
      t.short({
        a: "boolean[]",
        b: {
          c: ["string{}"],
        },
      })
    )

    vi.assertType
    <
      t.allOf<[
        t.object<{ a: t.boolean }>,
        t.object<{ b: t.array<t.string> }>
      ]>
    >
    (
      t.short(
        "&",
        { a: "boolean" },
        { b: "string[]" },
      )
    )

    vi.assertType
    <
      t.anyOf<[
        t.object<{ a: t.string }>,
        t.object<{ b: t.null }>
      ]>
    >
    (
      t.short(
        "|",
        { a: "string" },
        { b: null },
      )
    )


    vi.assertType
    <
      t.array<
        t.object<{
          a: t.object<{
            b: t.array<t.string>
          }>
        }>
      >
    >
    (
      t.short(
        "[]",
        {
          a: {
            b: "string[]"
          }
        }
      )
    )


    vi.assertType
    <
      t.object<{
        b: t.optional<t.boolean>
        c: t.optional<t.object<{
          d: t.optional<t.array<t.number>>
        }>>
        a: t.number
      }>
    >(t.short({
        a: "number",
        "b?": "boolean",
        "c?": {
          "d?": "number[]"
        }
      })
    )

    const x = t.short(
      "&",
      {
        a: "string[]",
        b: [ "[]", "number" ],
        c: [ "{}", "boolean[]" ],
        "d?": [ "&", { "x?": "number" }, { "y?": "number" }, { "z?": "number" } ],
        e: [ "|", { xs: ["|", null, "number[]"] }, { ys: ["|", null, "number[]"] }, { zs: ["|", null, "number[]"] } ],
      })

    vi.assertType<
      t.allOf<[
        t.object<{
        d: t.optional<t.allOf<[ t.object<{ x: t.optional<t.number> }>, t.object<{ y: t.optional<t.number> }>, t.object<{ z: t.optional<t.number> }> ]>>
        a: t.array<t.string>
        b: t.array<t.number>
        c: t.record<t.array<t.boolean>>
        e: 
          & t.anyOf<[
              t.object<{ xs: t.anyOf<[t.null, t.array<t.number>]> & { is: (u: unknown) => u is t.array<t.number> | t.null } }>
            , t.object<{ ys: t.anyOf<[t.null, t.array<t.number>]> & { is: (u: unknown) => u is t.array<t.number> | t.null } }>
            , t.object<{ zs: t.anyOf<[t.null, t.array<t.number>]> & { is: (u: unknown) => u is t.array<t.number> | t.null } }> 
          ]> 
          & { is: (u: unknown) => u is 
            | t.object<{ xs: t.anyOf<[t.null, t.array<t.number>]> & { is: (u: unknown) => u is t.array<t.number> | t.null } }> 
            | t.object<{ ys: t.anyOf<[t.null, t.array<t.number>]> & { is: (u: unknown) => u is t.array<t.number> | t.null } }> 
            | t.object<{ zs: t.anyOf<[t.null, t.array<t.number>]> & { is: (u: unknown) => u is t.array<t.number> | t.null } }> 
          }

        }>
      ]>
    >

    (t.short(
      "&",
      {
        a: "string[]",
        b: [ "[]", "number" ],
        c: [ "{}", "boolean[]" ],
        "d?": [ "&", { "x?": "number" }, { "y?": "number" }, { "z?": "number" } ],
        e: [ "|", { xs: ["|", null, "number[]"] }, { ys: ["|", null, "number[]"] }, { zs: ["|", null, "number[]"] } ],
      })

    )
  })

  vi.it("〖🧙〗› ❲ast.typeof❳", () => {
    vi.assertType<null>(t.typeof(t.short(null)))
    vi.assertType<"abc">(t.typeof(t.short("'abc'")))
    vi.assertType<boolean>(t.typeof(t.short("boolean")))
    vi.assertType<symbol>(t.typeof(t.short("symbol")))
    vi.assertType<integer>(t.typeof(t.short("integer")))
    vi.assertType<number>(t.typeof(t.short("number")))
    vi.assertType<string>(t.typeof(t.short("string")))
    vi.assertType<boolean[]>(t.typeof(t.short("boolean[]")))
    vi.assertType<symbol[]>(t.typeof(t.short("symbol[]")))
    vi.assertType<integer[]>(t.typeof(t.short("integer[]")))
    vi.assertType<number[]>(t.typeof(t.short("number[]")))
    vi.assertType<string[]>(t.typeof(t.short("string[]")))
    vi.assertType<Record<string, boolean>>(t.typeof(t.short("boolean{}")))
    vi.assertType<Record<string, symbol>>(t.typeof(t.short("symbol{}")))
    vi.assertType<Record<string, integer>>(t.typeof(t.short("integer{}")))
    vi.assertType<Record<string, number>>(t.typeof(t.short("number{}")))
    vi.assertType<Record<string, string>>(t.typeof(t.short("string{}")))
    vi.assertType<[boolean, string, number]>(t.typeof(t.short(["boolean", "string", "number"])))

    vi.assertType
    <
      {
        a: boolean[],
        b: {
          c: [Record<string, string>]
        }
      }
    >
    (t.typeof(t.short(
      {
        a: "boolean[]",
        b: {
          c: ["string{}"],
        }
      }))
    )

    vi.assertType
    <
      & { a: boolean }
      & { b: string[] }
    >
    (t.typeof(t.short(
      "&",
      { a: "boolean" },
      { b: "string[]" },
    )))

    vi.assertType
    <
      | { a: string }
      | { b: null }
    >
    (t.typeof(t.short(
      "|",
      { a: "string" },
      { b: null },
    )))

    vi.assertType<{ a: { b: string[] } }[]>(t.typeof(t.short("[]", { a: { b: "string[]" } })))

    vi.assertType
    <
      {
        a: number,
        b?: boolean,
        c?: {
          d?: number[]
        }
      }
    >
    (t.typeof(t.short(
      {
        a: "number",
        "b?": "boolean",
        "c?": {
          "d?": "number[]"
        }
      }
    )))

    vi.assertType
    <
      {
        a: string[]
        b: number[]
        c: Record<string, boolean[]>
        d?: 
          & { x?: number } 
          & { y?: number } 
          & { z?: number }
        e: 
          | { xs: null | number[] } 
          | { ys: null | number[] } 
          | { zs: null | number[] }
        f?: { g?: "hi" | undefined }
      }
    >
    (
      t.typeof(
        t.short(
          "&", 
          {
            a: "string[]",
            b: [ "[]", "number" ],
            c: [ "{}", "boolean[]" ],
            "d?": [ 
              "&", 
              { "x?": "number" }, 
              { "y?": "number" }, 
              { "z?": "number" }
            ],
            e: [
              "|", 
              { xs: ["|", null, "number[]"] }, 
              { ys: ["|", null, "number[]"] }, 
              { zs: ["|", null, "number[]"] }
            ],
            "f?": { "g?": "'hi'" }
          },
        )
      )
    )
  })

})


  // export type Terminals = typeof terminals
  // export const terminals = {
  //   boolean: fc.constant("boolean"),
  //   booleans: fc.constant("boolean[]"),
  //   booleanDict: fc.constant("boolean{}"),
  //   symbol: fc.constant("symbol"),
  //   symbols: fc.constant("symbol[]"),
  //   symbolDict: fc.constant("symbol{}"),
  //   integer: fc.constant("integer"),
  //   integers: fc.constant("integer[]"),
  //   integerDict: fc.constant("integer{}"),
  //   number: fc.constant("number"),
  //   numbers: fc.constant("number[]"),
  //   numberDict: fc.constant("number{}"),
  //   string: fc.constant("string"),
  //   strings: fc.constant("string[]"),
  //   stringDict: fc.constant("string{}"),
  // }
  // export const tag = fc.oneof(
  //   fc.constant("|"),
  //   fc.constant("&"),
  //   fc.constant("[]"),
  //   fc.constant("{}"),
  // )
