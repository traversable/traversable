export { 
  is,
  allOf$,
  anyOf$,
  and$,
  array$,
  nullable$,
  object$,
  optional$,
  or$,
  record$,
  tuple$,
} from "./predicates.js"

export * as ast from "./ast-3.js"

export type { Guard } from "./guard.js"
export * as t from "./guard.js"

// {
//   // type infer,
//   any,
//   anyOf,
//   null,
//   const,
//   boolean,
//   integer,
//   number,
//   record,
//   string,
//   array,
//   object,
//   optional,
//   symbol,
// } from "./guard.js"

export * as path from "./toPaths.js"
export { toPaths } from "./toPaths.js"
export { toJSON } from "./toJSON.js"
export { toString } from "./toString.js"
export type { TagTreeMap } from "./fromSeed.js"
export { fromSeed, TagTree } from "./fromSeed.js"

import type { AST, Config, Tag } from "./ast.js"
declare module "@traversable/core" {
  const _: typeof import("./ast.js").t
  const Tag: typeof import("./ast.js").Tag
  const Tags: typeof import("./ast.js").Tags
  const isComposite: typeof import("./ast.js").isComposite
  const isOptional: typeof import("./ast.js").isOptional
  const isOptionalNotUndefined: typeof import("./ast.js").isOptionalNotUndefined
  type type<T extends Config> = import("./ast.js").type<T>
  type leaf<Tag extends Tag.Scalar, T> = import("./ast.js").leaf<Tag, T>
  const null_: typeof import("./ast.js").null_
  type null$ = import("./ast.js").null$
  type array_<T extends AST.Node> = import("./ast.js").array_<T>
  type array_toJSON<T extends AST.Node> = import("./ast.js").array_toJSON<T>
  type array_toString<T extends AST.Node> = import("./ast.js").array_toString<T>
  type object_<T extends { [x: string]: AST.Node }> = import("./ast.js").object_<T>
  type object_toString = import("./ast.js").object_toString
  type object_toJSON<T extends { [x: string]: AST.Node; } = { [x: string]: AST.Node; }> = import("./ast.js").object_toJSON<T>
  type object_is<T extends { [x: string]: AST.Node }> = import("./ast.js").object_is<T>
  const object_is: typeof import("./ast.js").object_is
  const objectDefault: typeof import("./ast.js").objectDefault
  const objectEOPT: typeof import("./ast.js").objectEOPT
  const object_isEOPT: typeof import("./ast.js").object_isEOPT
  type optional_<T extends AST.Node> = import("./ast.js").optional_<T>
  const optional_: typeof import("./ast.js").optional_
  type optional_toJSON<T extends AST.Node = AST.Node> = import("./ast.js").optional_toJSON<T>
  type optional_toString<T extends AST.Node = AST.Node> = import("./ast.js").optional_toString<T>
}

// export * as path from "./toPaths.js"
// const toJSON: typeof import("./ast.js").toJSON
// const toString: typeof import("./ast.js").toString
// export type { AST, Config, Meta, infer } from "./ast.js"
// export type { AST } from "./ast-lite.js"
// export { toJSON, toString } from "./ast.js"
/** @deprecated use `allOf$` instead */
// allof$,
/** @deprecated use `anyOf$` instead */
// anyof$,
