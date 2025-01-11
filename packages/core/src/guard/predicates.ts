import * as _ from "./_internal.js"

export {
  allOf$,
  and$,
  anyOf$,
  array$,
  keyOf$,
  nullable$,
  object$,
  optional$,
  or$,
  record$,
  tuple$,
} from "./combinators.js"

export const is = {
  any: _.any,
  array: _.array,
  bigint: _.bigint,
  boolean: _.boolean,
  defined: _.defined,
  false: _.false_,
  function: _.function_,
  integer: _.integer,
  literally: _.literally,
  never: _.never,
  nonempty: _.nonempty,
  nonnullable: _.nonnullable,
  notnull: _.notnull,
  null: _.null_,
  nullable: _.nullable,
  number: _.number,
  object: _.object,
  primitive: _.primitive,
  showable: _.showable,
  string: _.string,
  symbol: _.symbol,
  true: _.true_,
  undefined: _.undefined_,
}

/** 
 * **deprecated**
 *   😵 😵 😵 😵
 *   😵 😵 😵 😵
 *   😵 😵 😵 😵
 * **deprecated**
 */
export {
  /** @deprecated 💀 use allOf$ instead */
  allOf$ as allof$,
  /** @deprecated 💀 use allOf$ instead */
  anyOf$ as anyof$,
} from "./combinators.js"
