export { doc } from "./document.js"
export * from "./document.js"
export * as Interpreter from "./legacy/interpreter.js"
export * as Weight from "./weighted.js"

export type { $ref } from "./types.js"
export { Functor, type Target, ana, cata, hylo, forget } from "./algebra.js"
export { fromJSON, toJSON } from "./json-adapter.js"
export { normalize } from "./normalize.js"
export { Schema } from "./schema/exports.js"
export { accessors, find, filter, query } from "./query.js"
export { composeExamples } from "./examples.js"
export { tag, untag } from "./tag.js"
export { VERSION } from "./version.js"
export { deref } from "./deref.js"
export { OpenAPI } from "./spec.js"
