export { test, test as it } from "@fast-check/vitest"

export * as tree from "./tree.js"
export * as zip from "./zip.js"
export * from "./version.js";
export * from "./guard/index.js"
export * as show from "./show.js"

export { fc, Property } from "./arbitrary/index.js"
export { JsonPointer } from "./json-pointer.js"
export { Json } from "./json.js"

export type * from "./model/index.js"
export { JsonSchema, Traversable /* , Extension */ } from "./model/index.js"
export { Extension } from "./model/ext.js"

export type JsonSchema = import("./model/json-schema.js").any
export type Traversable = import("./model/traversable.js").Traversable
