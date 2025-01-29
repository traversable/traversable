import { TagTree as TagTree_, fc, t } from "@traversable/core"
import { array, fn, order } from "@traversable/data"
import { Functor, symbol } from "@traversable/registry"

export function Arbitrary() {}

export namespace Arbitrary {
  export type Options = Partial<typeof defaults>
  export type Config = { 
    exclude: (keyof TagTree)[], 
    sortBias: {
      (l: NodeType, r: NodeType): -1 | 0 | 1
      (l: NodeType, r: NodeType): number
      (l: NodeType, r: NodeType): -1 | 0 | 1
    }
  }

  export type OneOfDefaults<
    T extends
      & typeof oneOfDefaults 
      & fc.OneOfConstraints 
    = & typeof oneOfDefaults 
      & fc.OneOfConstraints
  > = T

  const oneOfDefaults = {
    /** 
     * ## {@link oneOfDefaults.depthIdentifier `Options.depthIdentifier`} 
     * > ✍ **Note:** JSDocs below from {@link fc.OneOfConstraints `fc.OneOfConstraints.depthIdentifier`}
     * -----
     */
    depthIdentifier: <fc.OneOfConstraints["depthIdentifier"]>{ depth: 1 },
    /** 
     * ## {@link oneOfDefaults.depthSize `Options.depthSize`} 
     * > ✍ **Note:** JSDocs below from {@link fc.OneOfConstraints `fc.OneOfConstraints.depthSize`}
     * -----
     */
    depthSize: "medium",
    /** 
     * ## {@link oneOfDefaults.maxDepth `Options.maxDepth`} 
     * > ✍ **Note:** JSDocs below from {@link fc.OneOfConstraints `fc.OneOfConstraints.maxDepth`}
     * -----
     */
    maxDepth: 10,
    /** 
     * ## {@link oneOfDefaults.withCrossShrink `Options.withCrossShrink`} 
     * > ✍ **Note:** JSDocs below from {@link fc.OneOfConstraints `fc.OneOfConstraints.withCrossShrink`}
     * -----
     */
    withCrossShrink: false,
  }

  const localOptions = {
    /** 
     * ## {@link localOptions.exclude `Options.exclude`} 
     * 
     * If you'd like to exclude a particular node from the generated tree,
     * pass the node type by name here.
     * 
     * See also:
     * - {@link localOptions.sortBias `Options.sortBias`}
     * - {@link oneOfDefaults.depthIdentifier `Options.depthIdentifier`}
     * - {@link oneOfDefaults.depthSize `Options.depthSize`}
     */
    exclude: <(keyof TagTree)[]>[],
    /** 
     * ## {@link localOptions.sortBias `Options.sortBias`} 
     * 
     * If you'd like to change the frequency that a particular node is generated
     * relative to other nodes, you can provide a sorting function that will
     * change the order that the node is passed to fast-check's 
     * {@link fc.letrec `letrec`} arbitrary.
     * 
     * **Directionality:** lower indices have a higher chance of being generated compared
     * with the nodes with higher indices.
     * 
     * See also:
     * - {@link localOptions.exclude `Options.exclude`}
     * - {@link oneOfDefaults.depthIdentifier `Options.depthIdentifier`}
     * - {@link oneOfDefaults.depthSize `Options.depthSize`}
     */
    sortBias: <Config["sortBias"]>(() => 0),
  } satisfies Config

  export const defaults = {
    ...oneOfDefaults as OneOfDefaults,
    ...localOptions,
  } satisfies (
    & Config 
    & fc.OneOfConstraints
  )

  /** 
   * Order in this array determines default bias; change the order by 
   * providing {@link Options.sortBias}.
   * 
   * TODO: turn `allOf` and `const` back on
   */
  export const NodeTypeEntries = [
    ["null", symbol.null],
    ["anyOf", symbol.anyOf],
    ["boolean", symbol.boolean],
    ["array", symbol.array],
    ["object", symbol.object],
    ["record", symbol.record],
    ["tuple", symbol.tuple],
    ["integer", symbol.integer],
    ["number", symbol.number],
    ["string", symbol.string],
    ["optional", symbol.optional],
    ["const", symbol.constant],
    /** TODO: turn back on */
    // ["allOf", symbol.allOf],
  ] as const satisfies ([keyof TagTree, symbol])[]
  export type NodeTypeEntries = typeof NodeTypeEntries

  export type NodeType = typeof NodeTypes[number]
  export const NodeTypes = array.heads(NodeTypeEntries)
  //           ^?

  export type NodeTag = typeof NodeTags[number]
  export const NodeTags = array.snds(NodeTypeEntries)
  //           ^?

  export type TagTree = {
    any: TagTree_.any
    allOf: TagTree_.allOfF<readonly TagTree_[]>
    anyOf: TagTree_.anyOfF<readonly TagTree_[]>
    array: TagTree_.arrayF<TagTree_>
    boolean: TagTree_.boolean
    const: TagTree_.const
    integer: TagTree_.integer
    null: TagTree_.null
    number: TagTree_.number
    object: TagTree_.objectF<Record<string, TagTree_>>
    optional: TagTree_.optionalF<TagTree_>
    record: TagTree_.recordF<Record<string, TagTree_>>
    string: TagTree_.string
    tuple: TagTree_.tupleF<readonly TagTree_[]>
    tree: TagTree_.F<unknown>
  }

  export const createTagTree 
    : (options?: Arbitrary.Options) => fc.LetrecValue<TagTree>
    = ({ 
      sortBias = Arbitrary.defaults.sortBias, 
      exclude = Arbitrary.defaults.exclude,
      ...$
    } = Arbitrary.defaults) => 
      fc.letrec((loop: fc.LetrecTypedTie<TagTree>) => {
        const loops = NodeTypeEntries
          //  ^?
          .filter(([nodeType]) => !exclude.includes(nodeType))
          .sort(order.mapInput(sortBias, ([k]) => k))
          .map(([k]) => loop(k))

        return {
          any: fc.constant(TagTree_.byName.any()),
          allOf: fc.array(loop("tree")).map(TagTree_.byName.allOf),
          anyOf: fc.array(loop("tree")).map(TagTree_.byName.anyOf),
          array: loop("tree").map(TagTree_.byName.array),
          boolean: fc.constant(TagTree_.byName.boolean()),
          const: fc.constant(TagTree_.byName.constant()),
          integer: fc.constant(TagTree_.byName.integer()),
          null: fc.constant(TagTree_.byName.null()),
          number: fc.constant(TagTree_.byName.number()),
          object: fc.entries(loop("tree")).map(TagTree_.byName.object),
          optional: loop("tree").map(TagTree_.byName.optional),
          record: loop("tree").map(TagTree_.byName.record),
          string: fc.constant(TagTree_.byName.string()),
          tuple: fc.array(loop("tree")).map(TagTree_.byName.tuple),
          tree: fc.oneof(
            $,
            loop("any"),
            ...loops,
          )
        }
      });

  const TagTreeMap = {
    [symbol.boolean]: fc.constant(TagTree_.byName.boolean()),
    [symbol.null]: fc.constant(TagTree_.byName.null())

  } as const

  // export const arbitraryFromTagTree
  //   : Functor.Coalgebra<t.AST.lambda, TagTree_.F<TagTree_>>
  //   = (tag) => {
  //     switch (tag[0]) {
  //       case symbol.boolean: return fc.constant(TagTree_.byName.boolean())
  //       case symbol.null: return fc.constant(TagTree_.byName.null())
  //     }
  //   }

  export const TagTree = createTagTree({ 
    depthIdentifier: Arbitrary.defaults.depthIdentifier,
    depthSize: Arbitrary.defaults.depthSize,
    maxDepth: Arbitrary.defaults.maxDepth,
    withCrossShrink: Arbitrary.defaults.withCrossShrink,
    exclude: Arbitrary.defaults.exclude,
    sortBias: Arbitrary.defaults.sortBias,
  })

  // export const terminal
  //   : fc.Arbitrary<t.Terminal>
  //   = fc.constantFrom(...t.Terminals)
  // export type LetrecShort = (
  //   & { tree: t.AST.Short }
  //   & {
  //     booleans: "boolean" | "boolean[]" | "boolean{}";
  //     symbols: "symbol" | "symbol[]" | "symbol{}";
  //     integers: "integer" | "integer[]" | "integer{}";
  //     numbers: "number" | "number[]" | "number{}";
  //     strings: "string" | "string[]" | "string{}";
  //   }
  //   & {
  //     allOf: readonly ["&", t.AST.Short[]]
  //     anyOf: readonly ["|", t.AST.Short[]]
  //     array: readonly ["[]", t.AST.Short]
  //     record: readonly ["{}", t.AST.Short]
  //     tuple: readonly t.AST.Short[]
  //     object: Record<string, t.AST.Short>
  //   } 
  // )

  export const maybeOptionalProperty = fc
    .tuple(fc.identifier(), fc.boolean())
    .map(([prop, isRequired]) => isRequired ? prop : `${prop}?`)

  export const optionalsDictionary = <T>(model: fc.Arbitrary<T>) => 
    fc.dictionary(maybeOptionalProperty, model)

  // export const letrecShort
  //   : (options?: Arbitrary.Options) => fc.LetrecValue<LetrecShort>
  //   = ($ = Arbitrary.defaults) => fc.letrec(
  //     (loop) => ({
  //       booleans: fc.constantFrom("boolean", "boolean[]", "boolean{}"),
  //       symbols: fc.constantFrom("symbol", "symbol[]", "symbol{}"),
  //       integers: fc.constantFrom("integer", "integer[]", "integer{}"),
  //       numbers: fc.constantFrom("number", "number[]", "number{}"),
  //       strings: fc.constantFrom("string", "string[]", "string{}"),
  //       allOf: fc.tuple(fc.constant("&"), fc.array(loop("tree"))),
  //       anyOf: fc.tuple(fc.constant("|"), fc.array(loop("tree"))),
  //       array: fc.tuple(fc.constant("[]"), loop("tree")),
  //       record: fc.tuple(fc.constant("{}"), loop("tree")),
  //       tuple: fc.array(loop("tree")),
  //       object: optionalsDictionary(loop("tree")),
  //       tree: fc.oneof(
  //         $,
  //         loop("booleans"),
  //         loop("symbols"),
  //         loop("integers"),
  //         loop("numbers"),
  //         loop("strings"),
  //         loop("allOf"),
  //         loop("anyOf"),
  //         loop("array"),
  //         loop("record"),
  //         loop("tuple"),
  //         loop("object"),
  //       ),
  //     })
  //   )

  // export const makeAstNode = fn.flow(
  //   Arbitrary.letrecShort,
  //   (xs) => xs.tree.map(t.fromSeed),
  // )

  // export const node = makeAstNode({ 
  //   depthIdentifier: Arbitrary.defaults.depthIdentifier,
  //   depthSize: "xsmall",
  //   maxDepth: 3,
  //   withCrossShrink: Arbitrary.defaults.withCrossShrink,
  //   exclude: Arbitrary.defaults.exclude,
  //   sortBias: Arbitrary.defaults.sortBias,
  // })
}
