export { doc } from "./document.js"
export * from "./document.js"
export * as Interpreter from "./interpreter.js"
export * as Weight from "./weighted.js"

export { Functor, type Target, ana, cata, hylo, forget } from "./algebra.js"
export { fromJSON, toJSON } from "./json-adapter.js"
export { normalize } from "./normalize.js"
export { Schema } from "./schema/exports.js"
export { accessors, find, filter, query } from "./query.js"
export { tag, untag } from "./tag.js"
export { VERSION } from "./version.js"
