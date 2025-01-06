import { TagTree as Tag, fc, t } from "@traversable/core"
import { fn } from "@traversable/data"

export function Arbitrary() {}

export namespace Arbitrary {
  export type Options = Partial<fc.OneOfConstraints>
  export const defaults = {
    depthIdentifier: { depth: 1 },
    depthSize: "medium",
    maxDepth: 10,
    withCrossShrink: false,
  } satisfies Required<Arbitrary.Options>

  export type TagTree = {
    any: Tag.any
    allOf: Tag.allOfF<readonly Tag[]>
    anyOf: Tag.anyOfF<readonly Tag[]>
    array: Tag.arrayF<Tag>
    boolean: Tag.boolean
    const: Tag.const
    integer: Tag.integer
    null: Tag.null
    number: Tag.number
    object: Tag.objectF<Record<string, Tag>>
    optional: Tag.optionalF<Tag>
    record: Tag.recordF<Record<string, Tag>>
    string: Tag.string
    tuple: Tag.tupleF<readonly Tag[]>
    tree: Tag.F<unknown>
  }

  export const createTagTree 
    : (options?: Arbitrary.Options) => fc.LetrecValue<TagTree>
    = ($ = Arbitrary.defaults) => fc.letrec(
      (loop: fc.LetrecTypedTie<TagTree>) => ({
        any: fc.constant(Tag.byName.any()),
        allOf: fc.array(loop("tree")).map(Tag.byName.allOf),
        anyOf: fc.array(loop("tree")).map(Tag.byName.anyOf),
        array: loop("tree").map(Tag.byName.array),
        boolean: fc.constant(Tag.byName.boolean()),
        const: fc.constant(Tag.byName.constant()),
        integer: fc.constant(Tag.byName.integer()),
        null: fc.constant(Tag.byName.null()),
        number: fc.constant(Tag.byName.number()),
        object: fc.entries(loop("tree")).map(Tag.byName.object),
        optional: loop("tree").map(Tag.byName.optional),
        record: loop("tree").map(Tag.byName.record),
        string: fc.constant(Tag.byName.string()),
        tuple: fc.array(loop("tree")).map(Tag.byName.tuple),
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

  export const TagTree = createTagTree({ 
    depthIdentifier: Arbitrary.defaults.depthIdentifier,
    depthSize: Arbitrary.defaults.depthSize,
    maxDepth: Arbitrary.defaults.maxDepth,
    withCrossShrink: Arbitrary.defaults.withCrossShrink,
  })

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

  export const makeAstNode = fn.flow(
    Arbitrary.letrecShort,
    (xs) => xs.tree.map(t.fromSeed),
  )

  export const node = makeAstNode({ 
    depthIdentifier: Arbitrary.defaults.depthIdentifier,
    depthSize: "xsmall",
    maxDepth: 3,
    withCrossShrink: Arbitrary.defaults.withCrossShrink,
  })
}
