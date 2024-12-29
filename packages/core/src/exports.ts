export { test, test as it } from "@fast-check/vitest"

// export * as is from "./is.js"
export * as tree from "./tree.js"
export * as zip from "./zip.js"
export * from "./version.js";

export { fc, Property } from "./arbitrary/index.js"
export { JsonPointer } from "./json-pointer.js"
export { Json } from "./json.js"
export * as show from "./show.js"

export type Traversable = import("./model/traversable.js").Traversable
export type JsonSchema = import("./model/json-schema.js").any
export type { Extension_register } from "./model/index.js"
export { JsonSchema, Traversable, Extension } from "./model/index.js"

// export { 
//   type intersect,
//   allOf,
//   and, 
//   anyOf,
//   array,
//   deriveFromTagged,
//   deriveFromTags,
//   inferFromTagged,
//   not,
//   object,
//   oneOf,
//   or,
// } from "./guard.js"
// export * as S from "./guard.js"

export * from "./guard/index.js"
