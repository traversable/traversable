import type { newtype, some } from "any-ts"
import type { entries, entry } from "./_entry.js"

const reservedPropertyNames = [
  "__proto__",
  "toString",
] as const

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
  (fn: (value: T[some.keyof<T>], key: some.keyof<T>, object: T) => V): (object: T) => { -readonly [K in keyof T]: V }
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
  (object: T, fn: (value: T[some.keyof<T>], key: some.keyof<T>, object: T) => V): { -readonly [K in keyof T]: V }
// impl.
export function map<const T, V>(
  ...args:
    | [fn: (value: T[some.keyof<T>], key: some.keyof<T>, object: T) => V]
    | [object: T, fn: (value: T[some.keyof<T>], key: some.keyof<T>, object: T) => V]
) {
  if(args.length === 1) return (object: T) => map(object, args[0]) 
  else {
    const [object, fn] = args
    if(globalThis.Array.isArray(object)) return object.map(fn as never)
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

function unsafeBind<T, K extends keyof any, V>(object: T, key: K, value: V): { [P in K]: V } & T
/// impl.
function unsafeBind<T extends {}, K extends keyof any, V>(
  object: T, 
  key: K, 
  value: V
) {
  return (
    void globalThis.Object.defineProperty(object, key, { 
      value, configurable: true, 
      enumerable: true, 
      writable: true 
    }), 
    object
  )
}

function bindDontPoison<T, K extends keyof any, V>(object: T, key: K, value: V): { [P in K]: V } & T
/// impl.
function bindDontPoison<T extends {}, K extends keyof any, V>(
  object: T, 
  key: K, 
  value: V
) {
  return (reservedPropertyNames as readonly (keyof any)[]).includes(key) 
    ? (
      void globalThis.Object.defineProperty(object, key, { 
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
