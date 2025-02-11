import { fn } from '@traversable/data'
import { is } from './guard/index.js'

export type typeOf<T> 
  = T extends null ? 'null'
  : T extends undefined ? 'undefined'
  : T extends symbol ? 'symbol'
  : T extends boolean ? 'boolean'
  : T extends bigint ? 'bigint'
  : T extends number ? 'number'
  : T extends string ? 'string'
  : T extends readonly any[] ? 'array'
  : T extends (..._: any) => any ? 'function'
  : 'object'
  ;

/** 
 * ## {@link typeOf `core.typeOf`}
 * 
 * Works like the native JavaScript `typeof` operator, but
 * returns `"array"` (given an array), `"null"` (given `null`),
 * and `"undefined"` (given `undefined`).
 * 
 * Typelevel behavior maps to runtime behavior where possible.
 */
export function typeOf<T extends null | undefined | {}>(x: T): typeOf<T> 
export function typeOf<T extends null | undefined | {}>(x: T) {
  switch (true) {
    default: return fn.exhaustive(x)
    case is.null(x): return 'null'
    case is.undefined(x): return 'undefined'
    case is.symbol(x): return 'symbol'
    case is.boolean(x): return 'boolean'
    case is.bigint(x): return 'bigint'
    case is.number(x): return 'number'
    case is.string(x): return 'string'
    case is.array(x): return 'array'
    case is.function(x): return 'function'
    case is.nonnullable(x): return 'object'
  }
}
