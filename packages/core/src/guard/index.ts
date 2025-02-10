
export * as schema from "./exports.js"
export { 
  is,
  path,
  TagTree,
} from "./exports.js"

export { Arbitrary } from "./arbitrary.js"

export * as t from "./t.js"
export * as tr from "./tr.js"


/** 
 * # {@link t `core.t`} 
 * 
 * The {@link t `t`} module contains a small set of schema
 * combinators designed for seamless interop with JSON
 * Schema documents and OpenAPI specifications.
 * 
 * Kinda like `zod`, if `zod` were designed from first principles
 * to support ease of reflection / intepretatation.
 *
 * Design goals:
 * 
 * 1. Extensibility
 * 
 *   Great care has been taken to expose a core API that is powerful 
 *   _because_ it does _strictly less_ stuff.
 *
 * 2. Legibility
 *
 *   Human beings have ~3kb of RAM called 
 *   [__working memory__](https://en.wikipedia.org/wiki/Working_memory).
 * 
 *   As software engineers, our job involves making tradeoffs. And as 
 *   an old mentor of mine used to tell me: _everything_ is a tradeoff.
 * 
 *   When we talk about tradeoffs, what we're talking about is limits.
 *   What known limitations are we up against?
 *
 *   Here's a hot take: no matter what problem you're solving, regardless
 *   of the level of abstraction, or degree of complexity, the first
 *   bottleneck you will hit will always be a human limitation. And if
 *   you disagree, consider first that human beings notoriously terrible
 *   at understanding our own limitations (and before you accuse me of
 *   being a pessimist, let me clarify that I think that statement cuts
 *   both ways).
 * 
 *   By now you're probably wondering, where is this all going? When did
 *   this become a conversation about how human beings are bad at stuff?
 *   Fair enough, let me close the loop:
 *
 *   > The point I'm trying to make is that those 3kb are worth optimizing for.
 *
 *   To that end, the complexity that we chose to absorb were mostly
 *   related to legibility. We asked ourselves, again and again, "Does the
 *   user really need to see this information? Do we really need an extra
 *   type parameter, or could we derive it from something we already have? 
 *   Is this feature _truly_ essential, given our current understanding of
 *   the use case, and at this level of abstraction, or would it perhaps be
 *   better suited as an extension / plugin elsewhere?"
 * 
 *   And after we'd cut most of the functionality away, we were pleasantly
 *   surprised: not only were they simpler, more legible, and less magical:
 *   they were also powerful, even on their own, and more extensible than
 *   we'd hoped.
 *
 *   We hope you'll agree.
 * 
 *   =====
 *
 *   Prior art:
 *
 *   There are plenty of schema libraries out there today, each with
 *   its own set of tradeoffs. Of all them, only 
 *   {@link https://github.com/arktypeio/arktype `arktype`} has
 *   made legiblity a first-class concern, and has done an admirable
 *   job not only making their schemas readable and simple, but also
 *   setting a higher standard across the board.
 *
 * @example
 * import { t } from "@traversable/core"
 * 
 * const MyObject = t.object({ abc: t.optional(t.number()) })
 * //    ^? const MySchema: t.object<{ abc: t.optional<t.number> }>
 *
 * type MyObject = t.typeof<typeof MySchema>
 * //   ^? type MyObject = { abc?: number | undefined }
 * 
 * const MyArray = t.array(t.oneOf(t.string(), t.boolean()))
 * type MyArray = t.typeof<typeof MySchema>
 * //   ^? type MyArray = (string | boolean)[]
*/
declare module "./ast.js" {}

/**
 * # {@link schema `core.schema`} 
 */
declare module "./exports.js" {}

//////////////////////////////////
// jsdoc imports, do not remove //
import type * as t from "./ast.js"
import type * as schema from "./ast.js"
// jsdoc imports, do not remove //
//////////////////////////////////

// import type { AST, Config, Tag } from "./ast.js"
// declare module "@traversable/core" {
//   const _: typeof import("./ast.js").t
//   const Tag: typeof import("./ast.js").Tag
//   const Tags: typeof import("./ast.js").Tags
//   const isComposite: typeof import("./ast.js").isComposite
//   const isOptional: typeof import("./ast.js").isOptional
//   const isOptionalNotUndefined: typeof import("./ast.js").isOptionalNotUndefined
//   type type<T extends Config> = import("./ast.js").type<T>
//   type leaf<Tag extends Tag.Scalar, T> = import("./ast.js").leaf<Tag, T>
//   const null_: typeof import("./ast.js").null_
//   type null$ = import("./ast.js").null$
//   type array_<T extends AST.Node> = import("./ast.js").array_<T>
//   type array_toJSON<T extends AST.Node> = import("./ast.js").array_toJSON<T>
//   type array_toString<T extends AST.Node> = import("./ast.js").array_toString<T>
//   type object_<T extends { [x: string]: AST.Node }> = import("./ast.js").object_<T>
//   type object_toString = import("./ast.js").object_toString
//   type object_toJSON<T extends { [x: string]: AST.Node; } = { [x: string]: AST.Node; }> = import("./ast.js").object_toJSON<T>
//   type object_is<T extends { [x: string]: AST.Node }> = import("./ast.js").object_is<T>
//   const object_is: typeof import("./ast.js").object_is
//   const objectDefault: typeof import("./ast.js").objectDefault
//   const objectEOPT: typeof import("./ast.js").objectEOPT
//   const object_isEOPT: typeof import("./ast.js").object_isEOPT
//   type optional_<T extends AST.Node> = import("./ast.js").optional_<T>
//   const optional_: typeof import("./ast.js").optional_
//   type optional_toJSON<T extends AST.Node = AST.Node> = import("./ast.js").optional_toJSON<T>
//   type optional_toString<T extends AST.Node = AST.Node> = import("./ast.js").optional_toString<T>
// }
// export * as path from "./toPaths.js"
// const toJSON: typeof import("./ast.js").toJSON
// const toString: typeof import("./ast.js").toString
// export type { AST, Config, Meta, infer } from "./ast.js"
// export type { AST } from "./ast-lite.js"
// export { toJSON, toString } from "./ast.js"
