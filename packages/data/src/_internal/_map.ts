import type * as array from "../array.js"

const Object_getOwnPropertySymbols = globalThis.Object.getOwnPropertySymbols
const Object_keys = globalThis.Object.keys
const Object_defineProperty = globalThis.Object.defineProperty
const Array_isArray = globalThis.Array.isArray

const reservedPropertyNames = [
  "__proto__",
  "toString",
] as const

type KeyOf<
  T, 
  K extends 
  | [T] extends [array.any] ? Extract<keyof T, `${number}`> : keyof T & (string | number)
  = [T] extends [array.any] ? Extract<keyof T, `${number}`> : keyof T & (string | number)
> = K

/** 
 * {@link map `map [overload 1/2]`} ("data-last")
 * 
 * [TypeScript playground](https://tsplay.dev/weA2Yw)
 * 
 * {@link map `map`} takes two arguments:
 * 1. a function
 * 2. a composite data structure that contains one or more targets to apply the function to
 * 
 * A unique feature of this implementation is its polymorphism: it doesn't care whether the
 * composite data structure is an array, or whether it's an object. It will apply the argument
 * to each of the children, and will preserve the structure of the original shape.
 * 
 * **Trade-off:** the data-last overload of {@link map `map`} is optimized for function composition. 
 * It works best when used inside a call to {@link fn.pipe `fn.pipe`} or {@link fn.flow `fn.flow`}.
 * It comes with greater potential for code re-use, at the cost of slightly slower performance.
 * 
 * **Ergonomics:** if you'd prefer to provide both arguments at the same time, see overload #2.
 */
export function map<const T, V>
  (fn: (value: T[KeyOf<T>], key: KeyOf<T>, object: T) => V): (object: T) => { -readonly [K in keyof T]: V }
  // (fn: (prev: T[some.keyof<T>], key: some.keyof<T>, xs: T) => V): (xs: T) => { [key in keyof T]: V }

/** 
 * {@link map `map [overload 2/2]`} ("data-first")
 * 
 * [TypeScript playground](https://tsplay.dev/weA2Yw)
 *
 * {@link map `map`} is a polymorphic function that accepts a function and a data structure (such 
 * as an array or object) to apply the function to.
 * 
 * A unique feature of this implementation is its ability to abstract away the type of the data 
 * structure it maps the function over; whether you pass it an object or an array, it will handle 
 * applying the function to the data strucuture's values and returning a data structure whose type 
 * corresponds 1-1 with the type of input.
 * 
 * **Trade-off:** the data-first overload of {@link map `map`} evaluates eagerly. It comes with 
 * slightly better performance than the data-last overload, but is not reusable.
 * 
 * **Ergonomics:** if you'd prefer to use {@link map `map`} in a pipeline, see overload #1.
 */
export function map<const T, V>
  (object: T, fn: (value: T[KeyOf<T>], key: KeyOf<T>, object: T) => V): { -readonly [K in keyof T]: V }
// impl.
export function map<const T, V>(
  ...args:
    | [fn: (value: T[KeyOf<T>], key: KeyOf<T>, object: T) => V]
    | [object: T, fn: (value: T[KeyOf<T>], key: KeyOf<T>, object: T) => V]
) {
  if(args.length === 1) return (object: T) => map(object, args[0]) 
  else {
    const [object, fn] = args
    if(Array_isArray(object)) return object.map(fn as never)
    else {
      let out: { [x: string]: unknown } = {}
      for (const k in object) 
        void bindDontPoison(out, k, fn(object[k] as never, k as never, object))
        // void unsafeBind(out, k, fn(object[k] as never, k as never, object))
        // void (out[k] = fn(object[k] as never, k as never, object))
      return out
    }
  }
}

export function mapPreserveIndex<const T, V>
  (fn: (value: T[KeyOf<T>], key: KeyOf<T>, object: T) => V): (object: T) => { -readonly [K in keyof T]: V }
  // (fn: (prev: T[some.keyof<T>], key: some.keyof<T>, xs: T) => V): (xs: T) => { [key in keyof T]: V }

export function mapPreserveIndex<const T, V>
  (object: T, fn: (value: T[KeyOf<T>], key: KeyOf<T>, object: T) => V): { -readonly [K in keyof T]: V }
// impl.
export function mapPreserveIndex<const T extends { [x: symbol | string]: unknown }, V>(
  ...args:
    | [fn: (value: T[keyof T], key: KeyOf<T>, object: T) => V]
    | [object: T, fn: (value: T[keyof T], key: KeyOf<T>, object: T) => V]
) {
  if(args.length === 1) return (object: T) => mapPreserveIndex(object, args[0]) 
  else {
    const [object, fn] = args
    if(Array_isArray(object)) return object.map(fn as never)
    else {
      const syms = Object_getOwnPropertySymbols(object)
      const ks = Object_keys(object)
      let out: { [x: string | symbol]: unknown } = {}
      for (let ix = 0, len = ks.length; ix < len; ix++) {
        const k = ks[ix]
        const x = object[k]
        out[k] = fn(x as never, k as never, object)
      }
      for (let ix = 0, len = syms.length; ix < len; ix++) {
        const sym = syms[ix]
        out[sym] = object[sym]
      }
      return out
    }
  }
}

// function unsafeBind<T, K extends keyof any, V>(object: T, key: K, value: V): { [P in K]: V } & T
// /// impl.
// function unsafeBind<T extends {}, K extends keyof any, V>(
//   object: T, 
//   key: K, 
//   value: V
// ) {
//   return (
//     void Object_defineProperty(object, key, { 
//       value, configurable: true, 
//       enumerable: true, 
//       writable: true 
//     }), 
//     object
//   )
// }

function bindDontPoison<T, K extends keyof any, V>(object: T, key: K, value: V): { [P in K]: V } & T
/// impl.
function bindDontPoison<T extends {}, K extends keyof any, V>(
  object: T, 
  key: K, 
  value: V
) {
  return (reservedPropertyNames as readonly (keyof any)[]).includes(key) 
    ? (
      void Object_defineProperty(object, key, { 
        value, configurable: true, 
        enumerable: true, 
        writable: true 
      }), 
      object
    )
    : void (
      object[key as never] = value as never, 
      object
    )
}
