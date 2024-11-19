export { test, test as it } from "@fast-check/vitest"

export * as is from "./is.js"
export * from "./version.js";
export * as zip from "./zip.js"

export type { JSON } from "./json.js"
export { JsonPointer } from "./json-pointer.js"
export { fc, Property } from "./arbitrary/index.js"
export { 
  and, 
  has, 
  not, 
  or,
} from "./guard.js"

