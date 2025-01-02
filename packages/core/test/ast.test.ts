import * as vi from "vitest"

import { fn } from "@traversable/data"
import type { 
  Entries,
  Functor,
  HKT,
  Option,
  Result,
} from "@traversable/registry"

import { symbol } from "@traversable/registry"
import type { TagTreeMap } from "@traversable/core"
import {
  t,
  fc,
  fromSeed,
  show,
  TagTree,
  test,
  toPaths,
} from "@traversable/core"

type Options = Partial<fc.OneOfConstraints>
const defaults = {
  depthIdentifier: { depth: 1 },
  depthSize: "medium",
  maxDepth: 10,
  withCrossShrink: false,
} satisfies Required<Options>

/**
 * @example
 * {
 *   _tag: "object",
 *   _type: {
 *     "129409273": { _tag: "null" },
 *     "1471494498": { _tag: "tuple", _type: [] },
 *     "1954123919": {
 *       _tag: "optional",
 *       _type: {
 *         _tag: "tuple",
 *         _type: [
 *           { _tag: "string" },
 *           { _tag: "number" },
 *           { _tag: "string" },
 *           { _tag: "integer" },
 *           { _tag: "string" },
 *           {
 *             _tag: "record",
 *             _type: {
 *               _tag: "object",
 *               _type: {
 *                 "410423187": { _tag: "object", _type: {} },
 *                 "607303968": {
 *                   _tag: "record",
 *                   _type: { _tag: "string" }
 *                 },
 *                 "1811518562": { _tag: "number" },
 *                 __: { _tag: "string" }
 *               }
 *             }
 *           }
 *         ]
 *       }
 *     },
 *     _m$__q$_: { _tag: "integer" },
 *     $_g5l: {
 *       _tag: "record",
 *       _type: {
 *         _tag: "optional",
 *         _type: {
 *           _tag: "record",
 *           _type: { _tag: "number" }
 *         }
 *       }
 *     },
 *     r1$k2l4: {
 *       _tag: "record",
 *       _type: { _tag: "number" }
 *     },
 *     x8_68___$3: {
 *       _tag: "tuple",
 *       _type: [
 *         { _tag: "record", _type: { _tag: "string" } },
 *         { _tag: "number" },
 *         { _tag: "number" },
 *         { _tag: "number" }
 *       ]
 *     },
 *     _$7_$9k: { _tag: "integer" },
 *     $g$7_$: { _tag: "string" }
 *   }
 * }
 *
 * [
 *   [ "129409273", Leaf<"null"> ],
 *   [ "1954123919", Symbol(@Optional), 0, Leaf<"string"> ],
 *   [ "1954123919", Symbol(@Optional), 1, Leaf<"number"> ],
 *   [ "1954123919", Symbol(@Optional), 2, Leaf<"string"> ],
 *   [ "1954123919", Symbol(@Optional), 3, Leaf<"integer"> ],
 *   [ "1954123919", Symbol(@Optional), 4, Leaf<"string"> ],
 *   [ "1954123919", Symbol(@Optional), 5, Symbol(@Record), "607303968", Symbol(@Record), Leaf<"string"> ],
 *   [ "1954123919", Symbol(@Optional), 5, Symbol(@Record), "1811518562", Leaf<"number"> ],
 *   [ "1954123919", Symbol(@Optional), 5, Symbol(@Record), "__", Leaf<"string"> ],
 *   [ "_m$__q$_", Leaf<"integer"> ],
 *   [ "$_g5l", Symbol(@Record), Symbol(@Optional), Symbol(@Record), Leaf<"number"> ],
 *   [ "r1$k2l4", Symbol(@Record), Leaf<"number"> ],
 *   [ "x8_68___$3", 0, Symbol(@Record), Leaf<"string"> ],
 *   [ "x8_68___$3", 1, Leaf<"number"> ],
 *   [ "x8_68___$3", 2, Leaf<"number"> ],
 *   [ "x8_68___$3", 3, Leaf<"number"> ],
 *   [ "_$7_$9k", Leaf<"integer"> ],
 *   [ "$g$7_$", Leaf<"string"> ],
 * ]
 */

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

const obj = seed({ maxDepth: 10, depthSize: "large" }).tree





vi.describe(`〖⛳️️〗‹‹‹ ❲@traversable/core/ast❳`, () => {
  vi.it(`〖️⛳️️〗 ›  ❲ast.toPaths❳: empty object case`, () => {
    const zz = [ symbol.array, [symbol.string]] satisfies TagTree
    // const ex_01 = fromSeed([ symbol.array, [symbol.string]])
    const ex_01 = fromSeed([ symbol.object, [["a", [symbol.object, []]]]])
    const paths_01 = toPaths(ex_01)
    vi.assert.deepEqual(ex_01, { _tag: "object", _() { return { a: { _tag: "object", _type: {} } } } })
    vi.assert.deepEqual( paths_01, [["a", { leaf: {} }]])
  })
  vi.it(`〖️⛳️️〗 ›  ❲ast.toPaths❳: empty tuple case`, () => {
    const ex_02 = fromSeed([ symbol.object, [["a", [symbol.tuple, []]]]])
    const paths_02 = toPaths(ex_02)
    vi.assert.deepEqual(ex_02, { _tag: "object", _type: { a: { _tag: "tuple", _type: [] } } })
    vi.assert.deepEqual(paths_02, [["a", { leaf: [] }]])
  })
  vi.it(`〖️⛳️️〗 ›  ❲ast.path.interpreter❳`, () => {
    const ex_01 = [
      "aBc",
      "j",
      1,
      "k",
      0,
      symbol.record,
      symbol.array,
      "deF",
      symbol.optional,
      symbol.optional,
      "GHi",
      { leaf: "null" },
    ] as const

    vi.assert.equal(
      t.path.interpreter(
        t.path.docs,
        ex_01
      ).join(""),
      "aBc.j[1].k[0][string][number].deF?.GHi"
    )
  })

  test.prop([obj], {})("generated", (obj) => {
    const ast = t.Lite.fromSeed(obj)
    const paths = toPaths(ast)

    console.log("\n\nAST\n", show.serialize(ast, "leuven"))
    console.log(t.Lite.fromSeed([ symbol.object, [['a', [symbol.object, []]]] ]))
    console.log(toPaths(t.Lite.fromSeed([ symbol.object, [['a', [symbol.object, []]]] ])))
    console.log("\n\ntoPaths\n", show.serialize(paths, "leuven"))

    for (const ks of paths) {
      console.log("ks", ks)
      console.log("interpreted", t.path.interpreter(t.path.docs, ks))
    }

  // aBc[1][0][string].deF?.GHi

  })


})

// type Entry<T> = readonly [k: string, v: T]
// type Entries<T> = readonly Entry<T>[]

// namespace map {
//   export function array<S, T>(f: (s: S) => T): (F: readonly S[]) => readonly T[]
//   export function array<S, T>(f: (s: S) => T): (F: readonly S[]) => readonly T[] { return (F: readonly S[]) => F.map(f) }
//   ///
//   export function entries<S, T>(f: (s: S) => T): (F: Entries<S>) => Entries<T>
//   export function entries<S, T>(f: (s: S) => T) { return (F: Entries<S>) => F.map(([k, v]) => [k, f(v)] satisfies [string, any]) }
//   ///
//   export function record<S, T>(f: (s: S) => T): (F: Record<string, S>) => Record<string, T>
//   export function record<S, T>(f: (s: S) => T): (F: Record<string, S>) => Record<string, T>
//     { return (F: Record<string, S>) => Object.fromEntries(map.entries(f)(Object.entries(F))) }
//   ///
//   export function object<S, T>(f: (s: S) => T): <const R extends { [x: string]: S }>(repr: R) => { [K in keyof R]: T }
//   export function object<S, T>(f: (s: S) => T) { return map.record(f) }
//   ///
//   export function tuple<S, T>(f: (s: S) => T): <const R extends { [x: number]: S }>(repr: R) => { [K in keyof R]: T }
//   export function tuple<S, T>(f: (s: S) => T) { return map.array(f) }
//   ///
//   export function option<S, T>(f: (s: S) => T): (F: Option<S>) => Option<T>
//   export function option<S, T>(f: (s: S) => T) { return (F: Option<S>) => F._tag === URI.None ? F : f(F.value) }
//   ///
//   export function result<S, T>(f: (s: S) => T): <E>(F: Result<S, E>) => Result<T, E>
//   export function result<S, T>(f: (s: S) => T) { return <E>(F: Result<S, E>) => F._tag === URI.Err ? F : f(F.ok) }
// }

// interface json<T extends t.AST.Node = t.AST.Node> {
//   null: ReturnType<typeof t.null>
//   boolean: ReturnType<typeof t.boolean>
//   number: ReturnType<typeof t.number>
//   string: ReturnType<typeof t.string>
//   array: ReturnType<typeof t.array<T>>
//   object: ReturnType<typeof t.object<{ [x: string]: T }>>
//   optional: ReturnType<typeof t.optional<T>>
//   tree:
//     | this["null"]
//     | this["boolean"]
//     | this["number"]
//     | this["string"]
//     | this["array"]
//     | this["object"]
//     | this["optional"]
// }

// interface Wrap<Sym extends symbol> extends HKT { [-1]: [Sym, this[0]] }

// type Const<T> = [symbol.constant, T]
// interface Opt extends Wrap<symbol.optional> {}
// interface Arr extends Wrap<symbol.array> {}
// interface Obj extends Wrap<symbol.object> {}

// type TagTree =
//   | [_tag: symbol.null]
//   | [_tag: symbol.boolean]
//   | [_tag: symbol.integer]
//   | [_tag: symbol.number]
//   | [_tag: symbol.string]
//   | [_tag: symbol.constant, _type: Json]
//   | [_tag: symbol.array, _type: TagTree]
//   | [_tag: symbol.optional, _type: TagTree]
//   | [_tag: symbol.object, _type: Entries<TagTree>]

// interface TagTree_lambda extends HKT { [-1]: TagTreeF<this[0]> }

// type TagTreeF<T> =
//   | [_tag: symbol.null]
//   | [_tag: symbol.boolean]
//   | [_tag: symbol.integer]
//   | [_tag: symbol.number]
//   | [_tag: symbol.string]
//   | [_tag: symbol.constant, _type: Json]
//   | [_tag: symbol.array, _type: T]
//   | [_tag: symbol.optional, _type: T]
//   | [_tag: symbol.object, _type: Entries<T>]


// const Functor: Functor<TagTree_lambda, t.AST.Node> = {
//   map(f) {
//     return (pair) => {
//       switch (true) {
//         default: return fn.exhaustive(pair)
//         case pair[0] === symbol.null:
//         case pair[0] === symbol.boolean:
//         case pair[0] === symbol.integer:
//         case pair[0] === symbol.number:
//         case pair[0] === symbol.string:
//         case pair[0] === symbol.boolean:
//         case pair[0] === symbol.constant: return pair
//         case pair[0] === symbol.array: return [pair[0], f(pair[1])]
//         case pair[0] === symbol.optional: return [pair[0], f(pair[1])]
//         case pair[0] === symbol.object: return [pair[0], map.entries(f)(pair[1])]
//       }
//     }
//   }
// }

// // interface

// const coalgebra: Functor.Coalgebra<TagTree_lambda, TagTree> = (pair) => {
//   switch (true) {
//     default: return fn.exhaustive(pair)
//     case pair[0] === symbol.null: return pair
//     case pair[0] === symbol.boolean: return pair
//     case pair[0] === symbol.integer: return pair
//     case pair[0] === symbol.number: return pair
//     case pair[0] === symbol.string: return pair
//     case pair[0] === symbol.constant: return pair
//     case pair[0] === symbol.array: return t.array(pair[1])
//     case pair[0] === symbol.optional: return t.optional(pair[1])
//     case pair[0] === symbol.object: return t.object(Object.fromEntries(pair[1]))
//     // case pair[0] === symbol.object: return t.object(Object.fromEntries(pair[1]))
//   }
// }

// const build = fn.ana(Functor)(coalgebra)


//   // const Traversable_Functor: Functor<Traversable_lambda, Traversable> = {
//   //   map(f) {
//   //     return (x) => {
//   //       switch (true) {
//   //         default: return fn.softExhaustiveCheck(x)
//   //         case Traversable_is.enum(x): return x
//   //         case Traversable_is.null(x): return x
//   //         case Traversable_is.boolean(x): return x
//   //         case Traversable_is.integer(x): return x
//   //         case Traversable_is.number(x): return x
//   //         case Traversable_is.string(x): return x
//   //         case Traversable_is.array(x): return { ...x, items: f(x.items) }
//   //         case Traversable_is.allOf(x): return { ...x, allOf: x.allOf.map(f) }
//   //         case Traversable_is.anyOf(x): return { ...x, anyOf: x.anyOf.map(f) }
//   //         case Traversable_is.oneOf(x): return { ...x, oneOf: x.oneOf.map(f) }
//   //         case Traversable_is.tuple(x): return { ...x, items: x.items.map(f) }
//   //         case Traversable_is.record(x): return { ...x, additionalProperties: f(x.additionalProperties) }
//   //         case Traversable_is.object(x): {
//   //           const { additionalProperties: a, properties: p, ...y } = x
//   //           const entries = Object_entries(p).map(([k, v]) => [k, f(v)])
//   //           return {
//   //             ...y,
//   //             properties: Object_fromEntries(entries),
//   //             ...a && { additionalProperties: f(a) },
//   //           }
//   //         }
//   //       }
//   //     }
//   //   }
//   // }

// // const coalgebra: Functor.Coalgebra<TagTreeLambda,

// // fn.ana

//   // interface Traversable_lambda extends HKT { [-1]: Traversable_F<this[0]> }
// // type Traversable_F<T> =
// //   | Traversable_Scalar
// //   | Traversable_Special
// //   | Traversable_allOfF<T>
// //   | Traversable_anyOfF<T>
// //   | Traversable_oneOfF<T>
// //   | Traversable_arrayF<T>
// //   | Traversable_tupleF<T>
// //   | Traversable_recordF<T>
// //   | Traversable_objectF<T>
// //   ;


// const scalar = fc.oneof(
//   fc.constant(null),
//   fc.boolean(),
//   fc.integer(),
//   fc.float(),
//   fc.lorem(),
// )

// const tagTree = ($: Options = defaults) => fc.letrec((loop) => ({
//     null: fc.tuple(fc.constant(symbol.null)),
//     boolean: fc.tuple(fc.constant(symbol.boolean)),
//     integer: fc.tuple(fc.constant(symbol.integer)),
//     number: fc.tuple(fc.constant(symbol.number)),
//     string: fc.tuple(fc.constant(symbol.string)),
//     const: fc.tuple(fc.constant(symbol.constant), scalar),
//     optional: fc.tuple(fc.constant(symbol.optional), loop("tree")),
//     array: fc.tuple(fc.constant(symbol.array), loop("tree")),
//     object: fc.tuple(fc.constant(symbol.object), fc.entries(loop("tree"))),
//     tree: fc.oneof(
//       $,
//       loop("null"),
//       loop("boolean"),
//       loop("integer"),
//       loop("number"),
//       loop("string"),
//       loop("const"),
//       loop("array"),
//       loop("object"),
//     )
//   })
// )


// // type TagTree =
// //   | "null"
// //   | "boolean"
// //   | "number"
// //   | "string"
// //   | { _tag: "array", _type: TagTree }
// //   | { _tag: "object", _type: { [x: string]: TagTree } }

// // type Null = ["null", null]
// // type Bool = ["boolean", boolean]
// // type Int = ["integer", number]
// // type Num = ["number", number]
// // type Str = ["string", string]
// // type Const<T = unknown> = ["const", T]
// // type Arr<T = unknown> = ["array", T]
// // type Opt<T = unknown> = ["optional", T]
// // type Obj<T = unknown> = ["object", T]



// const ex_01 = [
//   "Symbol(@traversable/registry/URI::Array)",
//   [
//     "Symbol(@traversable/registry/URI::Object)",
//     [
//       [
//         "Symbol($$)",
//         [
//           "Symbol(@traversable/registry/URI::Array)",
//           "Symbol(@traversable/registry/URI::Null)"
//         ]
//       ],
//       [
//         741627657,
//         "Symbol(@traversable/registry/URI::Boolean)"
//       ],
//       [
//         1986858931,
//         "Symbol(@traversable/registry/URI::Boolean)"
//       ],
//       [
//         "e__$wo1_5",
//         [
//           "Symbol(@traversable/registry/URI::Array)",
//           "Symbol(@traversable/registry/URI::Boolean)"
//         ]
//       ],
//       [
//         357214829,
//         [
//           "Symbol(@traversable/registry/URI::Object),",
//           [
//             [
//               "$$_$_",
//               [
//                 "Symbol(@traversable/registry/URI::Constant)",
//                 null
//               ]
//             ],
//             [
//               626655484,
//               "Symbol(@traversable/registry/URI::Null)"
//             ],
//             [
//               "Symbol($_)",
//               "Symbol(@traversable/registry/URI::Null)"
//             ],
//             [
//               "j_f__",
//               "Symbol(@traversable/registry/URI::Null)"
//             ],
//             [
//               "$",
//               [
//                 "Symbol(@traversable/registry/URI::Object)",
//                 []
//               ]
//             ],
//             [
//               575879163,
//               [
//                 "Symbol(@traversable/registry/URI::Object)",
//                 [
//                   [
//                     "$244_$$_w",
//                     "Symbol(@traversable/registry/URI::Null)"
//                   ],
//                   [
//                     1176375432,
//                     "Symbol(@traversable/registry/URI::Null)"
//                   ],
//                   [
//                     1495690468,
//                     "Symbol(@traversable/registry/URI::Null)"
//                   ],
//                   [
//                     "Symbol(u$__j)",
//                     "Symbol(@traversable/registry/URI::Number)"
//                   ]
//                 ]
//               ]
//             ],
//             [
//               "Symbol(m98q)",
//               "Symbol(@traversable/registry/URI::Null)"
//             ],
//             [
//               303007956,
//               "Symbol(@traversable/registry/URI::Integer)"
//             ],
//             [
//               888643434,
//               "Symbol(@traversable/registry/URI::Null)"
//             ],
//             [
//               738843720,
//               "Symbol(@traversable/registry/URI::Null)"
//             ]
//           ]
//         ]
//       ]
//     ]
//   ]
// ]





// declare namespace arbitrary {
//   interface Constraints extends fc.OneOfConstraints {}
// }

// namespace arbitrary {
//   export const defaults = {
//     withCrossShrink: false,
//     depthIdentifier: { depth: 0 },
//     depthSize: "small",
//     maxDepth: globalThis.Number.POSITIVE_INFINITY,
//   } satisfies globalThis.Required<arbitrary.Constraints>
// }

// function null_(constraints?: arbitrary.Constraints)
//   : fc.Arbitrary<ReturnType<typeof t.null>>
// function null_(_: arbitrary.Constraints = arbitrary.defaults)
//   : fc.Arbitrary<ReturnType<typeof t.null>>
//   { return fc.constant(t.null()) }

// function boolean_(constraints?: arbitrary.Constraints)
//   : fc.Arbitrary<ReturnType<typeof t.boolean>>
// function boolean_(_: arbitrary.Constraints = arbitrary.defaults)
//   : fc.Arbitrary<ReturnType<typeof t.boolean>>
//   { return fc.constant(t.boolean()) }

// function number_(constraints?: arbitrary.Constraints)
//   : fc.Arbitrary<ReturnType<typeof t.number>>
// function number_(_: arbitrary.Constraints = arbitrary.defaults)
//   : fc.Arbitrary<ReturnType<typeof t.number>>
//   { return fc.constant(t.number()) }

// function string_(constraints?: arbitrary.Constraints)
//   : fc.Arbitrary<ReturnType<typeof t.string>>
// function string_(_: arbitrary.Constraints = arbitrary.defaults)
//   : fc.Arbitrary<ReturnType<typeof t.string>>
//   { return fc.constant(t.string()) }

// function array_<T extends t.AST.Node>(
//   model: fc.Arbitrary<T>,
//   constraints?: arbitrary.Constraints
// ): fc.Arbitrary<ReturnType<typeof t.array<T>>>
// function array_<T extends t.AST.Node>(
//   node: fc.Arbitrary<T>,
//   _: arbitrary.Constraints = arbitrary.defaults
// ): fc.Arbitrary<ReturnType<typeof t.array<T>>>
//   { return node.map((x) => t.array(x)) }

// function optional_<T extends t.AST.Node>(
//   model: fc.Arbitrary<T>,
//   constraints?: arbitrary.Constraints
// ): fc.Arbitrary<ReturnType<typeof t.optional<T>>>
// function optional_<T extends t.AST.Node>(
//   node: fc.Arbitrary<T>,
//   _: arbitrary.Constraints = arbitrary.defaults
// ): fc.Arbitrary<ReturnType<typeof t.optional<T>>>
//   { return node.map<ReturnType<typeof t.optional<T>>>(t.optional) }

// // function object_<T extends { [x: string]: t.AST.Node } = {}>
// //   (model: fc.Arbitrary<T>, constraints?: arbitrary.Constraints)
// //   : fc.Arbitrary<ReturnType<typeof t.object<T>>>

// // function object_<T extends { [x: string]: t.AST.Node } = {}>(
// //   model: fc.Arbitrary<T>,
// //   _: arbitrary.Constraints = arbitrary.defaults
// // ): fc.Arbitrary<ReturnType<typeof t.object<T>>>
// //   { return fc.dictionary(model).map((xs) => t.object(xs)) }

// // function object_(model: fc.Arbitrary<t.AST.Node>, _: arbitrary.Constraints = arbitrary.defaults):
// //   fc.Arbitrary<ReturnType<typeof t.object>>
// //   { return fc.dictionary(model).map((xs) => t.object(xs)) }






// //   {
// //   null: fc.constant("null"),
// //   boolean: fc.constant("boolean"),
// //   integer: fc.constant("number"),
// //   number: fc.constant("number"),
// //   string: fc.constant("string"),
// //   // scalar: fc.constantFrom("null", "boolean", "number", "string").map((_) => ({ _tag: _ })),
// //   array: loop("tree").map((_) => ["array", _]),
// //   optional: loop("tree").map((_) => ["optional", _]),
// //   const: scalar.map((_) => ["const", _]), // loop("tree").map((_) => ["const", ]),
// //   object: fc.entries(loop("tree"), { maxLength: 10 }).map((_) => ["object", _]), // .map((_) => ({ _tag: "object", _type: Object.fromEntries(_) })),
// //   tree: fc.oneof(
// //     $,
// //     loop("string"),
// //     loop("object"),
// //     loop("array"),
// //     loop("const"),
// //     loop("optional"),
// //     loop("number"),
// //     loop("null"),
// //     loop("boolean"),
// //   ),
// // }))

// type Options = Partial<
//   fc.OneOfConstraints
//   & {

//   }
// >

// const defaults = {
//   depthIdentifier: { depth: 1 },
//   depthSize: "medium",
//   maxDepth: 10,
//   withCrossShrink: false,
// } satisfies Required<Options>

// declare namespace tagTree {
// }


// vi.describe("〖⛳️〗‹‹‹ ❲@traversable/core/ast❳", () => {
//   test.prop([tagTree().tree], {})(
//     "test", (gen) => {
//       // console.group("\n\nGEN\n")
//       console.log("\n\n\n\nGEN:\n\n", show.serialize(gen, "leuven"), "\n\n")
//       // console.log("\n\ngen.toJSON():\n", gen.toJSON())
//       // console.log("\n\ngen.toString():\n", gen.toString())
//       // console.log("gen", JSON.stringify(gen.toJSON(), null, 2))
//       // console.groupEnd()

//     }
//   )

//   // vi.it("〖⛳️〗› ❲t.object❳", () => {
//   //   const gen = fc.peek(json().tree)
//   //   console.group("\n\nGEN\n")
//   //   console.log("\n\ngen\n:", gen)
//   //   console.log("\n\ngen.toJSON():\n", gen.toJSON())
//   //   console.log("\n\ngen.toString():\n", gen.toString())
//   //   // console.log("gen", JSON.stringify(gen.toJSON(), null, 2))
//   //   console.groupEnd()
//   // })
// })

//       // anyOf: AnyOfNode(fc.array(loop("tree")) as never, _),
//       // integer: IntegerNode(_),
//       // allOf: AllOfNode(loop("object") as never, _),
// // test.prop([json().tree], {})("testing guard", (guard) => {
// //   console.log(guard)
// //   vi.assert.isTrue(guard)
// // })


// // function IntegerNode(constraints?: arbitrary.Constraints): fc.Arbitrary<typeof t.integer>
// // function IntegerNode(_: arbitrary.Constraints = arbitrary.defaults): fc.Arbitrary<typeof S.integer>
// //   /// impl.
// //   { return fc.constant(S.integer) }

//   // S extends S.object.from<T> = S.object.from<T>

// // void (object_.options = ObjectNode_options)

// // function object_options(): fc.Arbitrary<S.object.Options> {
// //   return fc.record({
// //     exactOptionalPropertyTypes: fc.boolean(),
// //   }, { requiredKeys: [] })
// // }

// // function BigIntNode(constraints?: arbitrary.Constraints): fc.Arbitrary<typeof S.bigint>
// // function BigIntNode(_: arbitrary.Constraints = arbitrary.defaults): fc.Arbitrary<typeof S.bigint>
// //   /// impl.
// //   { return fc.constant(S.bigint) }

// // function ObjectNode<
// //   T extends { [x: string]: (u: any) => u is unknown },
// //   S extends S.object.from<T> = S.object.from<T>
// //   >(
// //   model: fc.Arbitrary<T>,
// //   constraints?: arbitrary.Constraints
// // ): fc.Arbitrary<typeof S.object<T, S>>


// // function AnyOfNode<
// // // T extends readonly unknown[]
// //   const T extends { [x: string]: (u: any) => u is unknown },
// //   S extends S.object.from<T> = S.object.from<T>
// // >(
// //   model: fc.Arbitrary<T>,
// //   constraints: arbitrary.Constraints = arbitrary.defaults
// // ): fc.Arbitrary<(u: unknown) => u is S.object<S>> { return model.map((fns) => S.anyOf(...fns)) }

// // function AnyOfNode<T>(
// //   model: fc.Arbitrary<((u: unknown) => u is T)[]>,
// //   constraints?: arbitrary.Constraints
// // ): fc.Arbitrary<(u: unknown) => u is T>

// // function AnyOfNode<T>(
// //   model: fc.Arbitrary<unknown>,
// //   constraints?: arbitrary.Constraints
// // ): fc.Arbitrary<(u: unknown) => u is T>

// // function AnyOfNode<T>(
// //   model: fc.Arbitrary<((u: unknown) => u is T)[]>,
// //   _: arbitrary.Constraints = arbitrary.defaults
// // ): fc.Arbitrary<(u: unknown) => u is T>
// //   /// impl.
// //   { return model.map((fns) => S.anyOf(...fns)) }

// // function AllOfNode<T extends { [x: string]: unknown }>(
// //   model: fc.Arbitrary<(u: unknown) => u is T> ,
// //   constraints?: arbitrary.Constraints
// // ): fc.Arbitrary<(u: unknown) => u is S.allOf<readonly T[]>>

// // function AllOfNode<T>(
// //   model: fc.Arbitrary<(u: unknown) => u is T> ,
// //   _: arbitrary.Constraints = arbitrary.defaults
// // ): fc.Arbitrary<(u: unknown) => u is S.allOf<readonly T[]>>
// //   /// impl.
// //   { return fc.array(model).map((fns) => S.allOf(...fns)) }


// /**
//  * =========================
//  *    EXAMPLE-BASED TESTS
//  * =========================
//  *
//  * These tests are included as a form of documentation only.
//  *
//  * The actual tests (the ones that give us confidence)
//  * are located in the `describe` block directly below this one.
//  */
// // vi.describe("〖🚑〗‹‹‹ ❲@traversable/core/guard❳", () => {
// //   vi.it("〖🚑〗› ❲S.object❳", () => {
// //     vi.assert.isTrue(S.object.any({}))
// //     vi.assert.isFalse(S.object.any([]))
// //   })

// //   vi.it("〖🚑〗› ❲S.object❳: validates required fields", () => {
// //     const ex_01 = S.object({
// //       abc: S.const("ABC"),
// //       def: S.array(S.const("DEF")),
// //       ghi: S.anyOf(S.const("G"), S.const("H"), S.const("I")),
// //     })

// //     void vi.assert.isTrue(
// //       ex_01({
// //         abc: "ABC",
// //         def: ["DEF"],
// //         ghi: "I",
// //       })
// //     )
// //   })

// //   vi.it("〖🚑〗› ❲S.object❳: validates optional fields", () => {
// //     const ex_02 = S.object({
// //       mno: S.optional(S.string),
// //       pqr: S.optional(S.boolean),
// //       stu: S.optional(S.string),
// //     })
// //     void vi.assert.isTrue(ex_02({}))
// //     void vi.assert.isTrue(ex_02({ pqr: true }))
// //     void vi.assert.isTrue(ex_02({ pqr: false, mno: "true" }))
// //     void vi.assert.isFalse(ex_02({ mno: true }))
// //     void vi.assert.isFalse(ex_02({ pqr: "true" }))
// //     /**
// //      * "stu" field here can be `undefined` because
// //      * `exactOptionalPropertyTypes` has not been set
// //      * (defaults to false)
// //      */
// //     void vi.assert.isTrue(ex_02({ stu: undefined }))
// //   })

// //   vi.it("〖🚑〗› ❲S.object❳: supports exactOptionalPropertyTypes", () => {
// //     const ex_03 = S.object({
// //       mno: S.optional(S.string),
// //       pqr: S.optional(S.boolean),
// //       stu: S.optional(S.string),
// //     }, { exactOptionalPropertyTypes: true })

// //     void vi.assert.isTrue(ex_03({}))
// //     void vi.assert.isTrue(ex_03({ pqr: true }))
// //     void vi.assert.isTrue(ex_03({ pqr: false, mno: "true" }))
// //     void vi.assert.isFalse(ex_03({ mno: undefined }))
// //     void vi.assert.isFalse(ex_03({ pqr: undefined }))
// //     void vi.assert.isFalse(ex_03({ stu: undefined }))
// //     void vi.assert.isFalse(ex_03({ mno: undefined, pqr: undefined }))
// //     void vi.assert.isFalse(ex_03({ mno: undefined, pqr: undefined, stu: undefined }))
// //     void vi.assert.isFalse(ex_03({ pqr: undefined, stu: undefined }))
// //     void vi.assert.isFalse(ex_03({ mno: undefined, stu: undefined }))
// //   })

// //   vi.it("〖🚑〗› ❲S.object❳: validates mixed fields", () => {
// //     const ex_04 = S.object({
// //       vwx: S.number,
// //     })
// //     void vi.assert.isTrue(ex_04({ vwx: 10 }))
// //     void vi.assert.isTrue(ex_04({ vwx: 100, stu: true }))
// //     void vi.assert.isFalse(ex_04({}))
// //     void vi.assert.isFalse(ex_04({ yz: "true" }))
// //   })
// // })

// // vi.describe("〖🚑〗‹‹‹ ❲@traversable/core/guard❳: ", () => {
// //   vi.it("〖🚑〗› ❲S.partial❳: validates optional fields", () => {
// //     const ex_05 = S.partial({
// //       mno: S.string,
// //       pqr: S.boolean,
// //       stu: S.string,
// //     })
// //     void vi.assert.isTrue(ex_05({}))
// //     void vi.assert.isTrue(ex_05({ pqr: true }))
// //     void vi.assert.isTrue(ex_05({ pqr: false, mno: "true" }))
// //     void vi.assert.isFalse(ex_05({ mno: true }))
// //     void vi.assert.isFalse(ex_05({ pqr: "true" }))
// //     void vi.assert.isTrue(ex_05({ stu: undefined }))
// //     void vi.assert.isTrue(ex_05({ mno: undefined, stu: undefined }))
// //   })

// //   vi.it("〖🚑〗› ❲S.partial❳: supports exactOptionalPropertyTypes", () => {
// //     const ex_06 = S.partial({
// //       mno: S.string,
// //       pqr: S.boolean,
// //       stu: S.optional(S.string),
// //     }, { exactOptionalPropertyTypes: true })

// //     void vi.assert.isTrue(ex_06({}))
// //     void vi.assert.isTrue(ex_06({ pqr: true }))
// //     void vi.assert.isTrue(ex_06({ pqr: false, mno: "true" }))
// //     void vi.assert.isFalse(ex_06({ mno: undefined }))
// //     void vi.assert.isFalse(ex_06({ pqr: undefined }))
// //     void vi.assert.isFalse(ex_06({ stu: undefined }))
// //     void vi.assert.isFalse(ex_06({ mno: undefined, pqr: undefined }))
// //     void vi.assert.isFalse(ex_06({ mno: undefined, pqr: undefined, stu: undefined }))
// //     void vi.assert.isFalse(ex_06({ pqr: undefined, stu: undefined }))
// //     void vi.assert.isFalse(ex_06({ mno: undefined, stu: undefined }))
// //   })
// // })

// // vi.describe("〖🚑〗‹‹‹ ❲@traversable/core/guard❳: ", () => {
// //   vi.it("〖🚑〗› ❲S.tuple❳: validates required fields", () => {
// //     const ex_07 = S.tuple(
// //       S.const("ABC"),
// //       S.tuple(S.const("DEF"), S.tuple(S.number, S.tuple(S.anything))),
// //       S.anyOf(S.const("G"), S.const("H"), S.const("I")),
// //     )
// //     void vi.assert.isTrue(ex_07([ "ABC", ["DEF", [9000, [new Date()]]], "G"]))
// //     void vi.assert.isTrue(ex_07([ "ABC", ["DEF", [9001, [/pattern/g]]], "G"]))
// //   })

// //   vi.it("〖🚑〗› ❲S.tuple❳: handles optional fields", () => {
// //     const ex_08 = S.tuple(
// //       S.string,
// //       S.number,
// //       S.optional(S.number),
// //     )
// //     vi.assert.isTrue(ex_08(["succeeds when optional element is not provided", 0]))
// //     vi.assert.isTrue(ex_08(["succeeds when optional element is provided", 0, 1]))
// //     vi.assert.isFalse(ex_08(["should fail", 0, "because of this element"]))
// //   })

// //   vi.it("〖🚑〗› ❲S.tuple❳: throws when given non-consecutive optionals", () => {
// //     vi.assert.throw(() => S.tuple(
// //       S.string,
// //       S.optional(S.anything),
// //       S.string,
// //       S.optional(S.anything),
// //       S.string,
// //     ))

// //     vi.assert.throw(() => S.tuple(
// //       S.optional(S.anything),
// //       S.string,
// //       S.optional(S.anything),
// //     ))
// //   })
// // })


// // const tags = [
// //   "null",
// //   "boolean",
// //   "number",
// //   "string",
// //   "optional",
// //   "array",
// //   "object",
// // ] as const satisfies string[]

// // type Tag = typeof tags[number]
// // const tag = fc.constantFrom(...tags)

// // const tree = json().object
// // const tagTreeArbitraries = {
// //   null: fc.tuple(fc.constant("null"), fc.constant(null)),
// //   boolean: fc.tuple(fc.constant("boolean"), fc.boolean()),
// //   integer: fc.tuple(fc.constant("integer"), fc.integer()),
// //   number: fc.tuple(fc.constant("number"), fc.float()),
// //   string: fc.tuple(fc.constant("string"), fc.lorem()),
// //   const: (loop: fc.LetrecLooselyTypedTie) => fc.tuple(fc.constant("const"), loop("tree")),
// //   optional: (loop: fc.LetrecLooselyTypedTie) => fc.tuple(fc.constant("optional"), loop("tree")),
// //   array: (loop: fc.LetrecLooselyTypedTie) => fc.tuple(fc.constant("array"), loop("tree")),
// //   object: (loop: fc.LetrecLooselyTypedTie) => fc.tuple(fc.constant("object"), fc.entries(loop("tree"))),
// //   tree: (loop: fc.LetrecLooselyTypedTie) => fc.oneof(
// //     loop("null"),
// //     loop("boolean"),
// //     loop("integer"),
// //     loop("number"),
// //     loop("string"),
// //     loop("const"),
// //     loop("array"),
// //     loop("object"),
// //   )
// // } as const


// /**
//  * ## {@link json `json`}
//  */
// // function json<T extends json>(constraints?: arbitrary.Constraints): fc.LetrecValue<T>
// // function json(_: arbitrary.Constraints = arbitrary.defaults) {
// //   return fc.letrec(
// //     (loop: fc.LetrecTypedTie<json>) => ({
// //       array: array_(loop("tree"), _),
// //       optional: optional_(loop("tree"), _),
// //       string: string_(_),
// //       number: number_(_),
// //       boolean: boolean_(_),
// //       null: null_(_),
// //       // object: object_(fc.dictionary(loop("tree")), _),
// //       tree: fc.oneof(
// //         _,
// //         // loop("object"),
// //         loop("array"),
// //         loop("optional"),
// //         loop("string"),
// //         loop("number"),
// //         loop("boolean"),
// //         loop("null"),
// //       ),
// //     })
// //   )
// // }
