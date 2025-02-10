export type { symbol } from "@traversable/registry"

export { 
  is,
  allOf$,
  anyOf$,
  and$,
  array$,
  keyOf$,
  nullable$,
  object$,
  optional$,
  or$,
  record$,
  tuple$,
} from "./predicates.js"

export * as path from "./toPaths.js"
export { toPaths } from "./toPaths.js"
export { toJSON } from "./toJSON.js"
export { toString, toTypeString } from "./toString.js"
export type { TagTreeMap } from "./fromSeed.js"
export { fromSeed, TagTree } from "./fromSeed.js"
export { 
  /** @deprecated use {@link t `t`} instead */
  short, 
} from "./short.js"
