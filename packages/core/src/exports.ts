export { test, test as it } from "@fast-check/vitest"

export type { JSON } from "./json.js"
export * as is from "./is.js"
export * as tree from "./tree.js"
export * as zip from "./zip.js"
export * from "./version.js";

export { fc, Property } from "./arbitrary/index.js"
export { JsonPointer } from "./json-pointer.js"

export { 
  type intersect,
  allOf,
  oneOf,
  and, 
  anyOf,
  array,
  object,
  or,
} from "./guard.js"
