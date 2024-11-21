export { test, test as it } from "@fast-check/vitest"

export * as is from "./is.js"
export * from "./version.js";
export * as zip from "./zip.js"

export type { JSON } from "./json.js"
export { JsonPointer } from "./json-pointer.js"
export { fc, Property } from "./arbitrary/index.js"
export * as tree from "./tree.js"
export { symbol } from "./symbol.js"
export { 
  allOf,
  oneOf,
  and, 
  anyOf,
  array,
  object,
  not, 
  or,
} from "./guard.js"

