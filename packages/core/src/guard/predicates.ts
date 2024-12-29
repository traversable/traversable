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
  function: _.function_,
  integer: _.integer,
  literally: _.literally,
  never: _.never,
  null: _.null_,
  number: _.number,
  object: _.object,
  primitive: _.primitive,
  showable: _.showable,
  string: _.string,
  symbol: _.symbol,
  undefined: _.undefined_,
}
