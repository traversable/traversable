export { test, test as it } from "@fast-check/vitest"

export type { JSON } from "./json.js"
export * as is from "./is.js"
export * as tree from "./tree.js"
export * as zip from "./zip.js"
export * from "./version.js";

export { fc, Property } from "./arbitrary/index.js"
export { JsonPointer } from "./json-pointer.js"
export * as show from "./show.js"

export { 
  type intersect,
  allOf,
  and, 
  anyOf,
  array,
  deriveFromTagged,
  deriveFromTags,
  inferFromTagged,
  not,
  object,
  oneOf,
  or,
} from "./guard.js"
