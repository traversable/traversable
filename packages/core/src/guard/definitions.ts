import * as t from './ast.js'

/** @internal */
const Object_keys = globalThis.Object.keys

/** 
 * ## {@link key `t.key`}
 */
export const key = t.anyOf(t.string(), t.number(), t.symbol())

/** 
 * ## {@link indexedBy `t.indexedBy`}
 * 
 * Given a running array of keys and an optional value schema, returns
 * a schema that describes an object indexed by all of the keys, and whose
 * values satisfy the value schema.
 */
export function indexedBy<K extends readonly (keyof any)[], T extends t.type>(...args: [...K, T]): t.object<{ [P in K[number]]: T }>
export function indexedBy<K extends readonly (keyof any)[]>(...indexSignature: [...index: K]): t.object<{ [P in K[number]]: t.any }>
export function indexedBy<K extends readonly (keyof any)[], const T extends t.type>(...args: | [...K] | [...K, T]): {} {
  const [ks, v = t.any()] = t.parseArgs(...args);
  let properties: { [x: string]: T | t.any } = {}
  for(const k of ks) properties[String(k)] = v
  return t.object(properties)
}

export function keyOf<K extends keyof T, T extends { [x: string]: unknown }>(object: T): t.Schema<K>
export function keyOf<T extends { [x: string]: unknown }>(object: T) {
  return t.fromGuard((u): u is keyof T => Object_keys(object).includes(u as never))
}
