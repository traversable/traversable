import * as vi from "vitest"
import type { integer } from "@traversable/registry"
import { symbol } from "@traversable/registry"

import type { TagTreeMap } from "@traversable/core"
import { ast as t, fc, test, TagTree } from "@traversable/core"

type Options = Partial<fc.OneOfConstraints>
const defaults = {
  depthIdentifier: { depth: 1 },
  depthSize: "medium",
  maxDepth: 10,
  withCrossShrink: false,
} satisfies Required<Options>

const seed = ($: Options = defaults) => fc.letrec(
  (loop: fc.LetrecTypedTie<TagTreeMap>) => ({
    null: fc.constant(TagTree.make[symbol.null]()),
    anyOf: fc.array(loop("tree")).map(TagTree.make[symbol.anyOf]),
    boolean: fc.constant(TagTree.make[symbol.boolean]()),
    integer: fc.constant(TagTree.make[symbol.integer]()),
    number: fc.constant(TagTree.make[symbol.number]()),
    string: fc.constant(TagTree.make[symbol.string]()),
    optional: loop("tree").map(TagTree.make[symbol.optional]),
    array: loop("tree").map(TagTree.make[symbol.array]),
    record: loop("tree").map(TagTree.make[symbol.record]),
    tuple: fc.array(loop("tree")).map(TagTree.make[symbol.tuple]),
    object: fc.entries(loop("tree")).map(TagTree.make[symbol.object]),
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

vi.describe("〖🧙〗‹‹‹ ❲@traversable/core/ast❳", () => {
  vi.it("〖🧙〗› ❲ast.short❳", () => {
    vi.assertType<t.null>(t.short(null))
    vi.assertType<t.const<"'abc'">>(t.short("'abc'"))
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
    vi.assertType<t.tuple<[t.boolean, t.string, t.number]>>(t.short(["boolean", "string", "number"]))
    vi.assertType<t.array<t.null>>(t.short("[]", null))
    vi.assertType<t.record<t.null>>(t.short("{}", null))

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

    vi.assertType
    <
      t.allOf<[
        t.object<{
          a: t.array<t.string>
          b: t.array<t.number>
          c: t.record<t.array<t.boolean>>
          d: t.optional<
            t.allOf<[
              t.object<{ x: t.optional<t.number> }>,
              t.object<{ y: t.optional<t.number> }>,
              t.object<{ z: t.optional<t.number> }>
            ]>
          >
          e: t.anyOf<[
            t.object<{ xs: t.anyOf<[t.null, t.array<t.number>]> }>, 
            t.object<{ ys: t.anyOf<[t.null, t.array<t.number>]> }>, 
            t.object<{ zs: t.anyOf<[t.null, t.array<t.number>]> }>
          ]>
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

  vi.it("〖🧙〗› ❲ast.toType❳", () => {
    vi.assertType<null>(t.toType(t.short(null)))
    vi.assertType<"abc">(t.toType(t.short("'abc'")))
    vi.assertType<boolean>(t.toType(t.short("boolean")))
    vi.assertType<symbol>(t.toType(t.short("symbol")))
    vi.assertType<integer>(t.toType(t.short("integer")))
    vi.assertType<number>(t.toType(t.short("number")))
    vi.assertType<string>(t.toType(t.short("string")))
    vi.assertType<boolean[]>(t.toType(t.short("boolean[]")))
    vi.assertType<symbol[]>(t.toType(t.short("symbol[]")))
    vi.assertType<integer[]>(t.toType(t.short("integer[]")))
    vi.assertType<number[]>(t.toType(t.short("number[]")))
    vi.assertType<string[]>(t.toType(t.short("string[]")))
    vi.assertType<Record<string, boolean>>(t.toType(t.short("boolean{}")))
    vi.assertType<Record<string, symbol>>(t.toType(t.short("symbol{}")))
    vi.assertType<Record<string, integer>>(t.toType(t.short("integer{}")))
    vi.assertType<Record<string, number>>(t.toType(t.short("number{}")))
    vi.assertType<Record<string, string>>(t.toType(t.short("string{}")))
    vi.assertType<[boolean, string, number]>(t.toType(t.short(["boolean", "string", "number"])))

    vi.assertType
    <
      {
        a: boolean[],
        b: {
          c: [Record<string, string>]
        }
      }
    >
    (t.toType(t.short(
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
    (t.toType(t.short(
      "&",
      { a: "boolean" },
      { b: "string[]" },
    )))

    vi.assertType
    <
      | { a: string }
      | { b: null }
    >
    (t.toType(t.short(
      "|",
      { a: "string" },
      { b: null },
    )))

    vi.assertType<{ a: { b: string[] } }[]>(t.toType(t.short("[]", { a: { b: "string[]" } })))

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
    (t.toType(t.short(
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
      t.toType(
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

