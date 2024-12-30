import * as _ from "./_internal.js"

export {
  allof$,
  and$,
  anyof$,
  array$,
  nullable$,
  optional$,
  or$,
  record$,
} from "./_internal.js"

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
  nullable: _.nullable,
  null: _.null_,
  number: _.number,
  object: _.object,
  primitive: _.primitive,
  showable: _.showable,
  string: _.string,
  symbol: _.symbol,
  true: _.true_,
  undefined: _.undefined_,
}
