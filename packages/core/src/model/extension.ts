import type { key, prop } from "@traversable/data"
import { fn } from "@traversable/data"
import type { Array, Capitalize, Functor, newtype } from "@traversable/registry"

import type { Config } from "./config.js"
import * as Traversable from "./traversable.js"

/** @internal */
type Object_keys<T, K extends keyof T = prop.and<keyof T>> = never | Array<[K] extends [never] ? string : K>
/** @internal */
const Object_keys 
  : <T extends object>(object: T) => Object_keys<T>
  = globalThis.Object.keys

export type TargetOf<S> = S extends (_: any) => _ is infer T ? T : S 

export type UserDefinition<Ext, Out> = {
  predicate(u: unknown): u is Ext, 
  handler(n: Ext): Out
}

export type BuiltIns<T> = { [K in keyof Traversable.Map<T>]: (n: Traversable.Map<T>[K]) => T }
export type UserDefinitions<T> = { [K in Exclude<keyof Extension, keyof Traversable.Map<T>>]+?: UserDefinition<Extension[K], T> }

export type Handlers<T> =
  & UserDefinitions<T>
  & BuiltIns<T>

export type Predicates<T> = { [K in keyof T as `is${Capitalize<K>}`]: (u: unknown) => u is T[K] }

type ExtractUserDefinitions<F> 
  = [keyof Omit<Extension.Handlers<F>, keyof Traversable.Map<F>>] extends [never] 
  /** 
   * CASE: the {@link Extension `Extension`} interface _has not_ been augmented in userland
   */
  ? Record<string, UserDefinition<unknown, F>> 
  /** 
   * CASE: the {@link Extension `Extension`} interface _has_ been augmented in userland
   */
  : Omit<Extension.Handlers<F>, keyof Traversable.Map<F>>

/**
 * ### {@link Extension_register `Extension.register`}
 * 
 * This interface is meant to be augmented.
 * 
 * @example
 * import { Extension } from "@traversable/core"
 * 
 * interface Foo { type: "Foo" }
 * interface Bar { type: "Bar" }
 * interface Baz { type: "Baz" }
 * 
 * const myExt = Extension.register({
 *   Foo: (_: unknown): _ is Foo => Math.random() > 1,
 *   Bar: (_: unknown): _ is Bar => Math.random() > 1,
 *   Baz: (_: unknown): _ is Baz => Math.random() > 1,
 * })
 * 
 * declare module "@traversable/core" {
 *   interface Extension extends Extension.register<typeof myExt> {}
 * }
 */
export interface Extension_register<T> extends newtype<{ [K in keyof T]: TargetOf<T[K]> }> {}

export function Extension_register<T extends { [ext: string]: (u: any) => u is any }>(exts: T): Extension_register<T>
export function Extension_register<T extends { [ext: string]: (u: any) => u is any }>(exts: T) { return exts }

export function Extension_hooks<F>(config: Config<F>, builtins: BuiltIns<F>): [
  ExtractUserDefinitions<F>,
  { [K in keyof Traversable.Map<F>]: (ext: Traversable.Map<F>[K]) => F }
]
export function Extension_hooks<F>(config: Config<F>, builtins: BuiltIns<F>) {
  const ks = Object_keys(config.handlers)
  let def: Record<string, unknown> = {},
      map: Record<string, unknown> = {}
  for (let ix = 0, len = ks.length; ix < len; ix++) {
    const k = ks[ix]
    if (Traversable.Known.includes(k)) void (map[k] = config.handlers[k])
    else void (def[k] = config.handlers[k] ?? builtins[k])
  }
  return [def, map]
}

/** 
 * ## {@link Extension_match `Extension.match`}
 * 
 * Given a configuration object optionally containing user-defined handlers for some subset of the built-in
 * node types + userland extensions, returns an {@link Functor.Algebra `Algebra`} for the operations on
 * those nodes.
 * 
 * An algebra is like a set of post-order traversal instructions that can be
 * understood by {@link fn.cata `fn.cata`} / {@link fn.para `fn.para`}
 * to generate recursive, type-safe operations capable of folding
 * arbitrary {@link Traversable `Traversable`} trees.
 * 
 * **Note:** You don't need to know or care about any of this to use {@link Extension_match `Extension.match`}.
 * If you're curious, a few thoughts:
 * 
 * {@link Extension_match `Extension_match`} combines TypeScript's increasingly 
 * excellent support for [dependent types](https://en.wikipedia.org/wiki/Dependent_type)
 * with a few ideas from an obscure branch of math called category theory that are
 * particularly well-suited for describing "reducing" operations (a.k.a. _folds_) over 
 * tree-like data structures.
 * 
 * If you're interested in learning more, I recommend
 * [Introduction to Recursion Schemes](https://blog.sumtypeofway.com/posts/introduction-to-recursion-schemes.html).
 * 
 * Unfortunately there aren't really any good resources written in JavaScript/TypeScript, at least
 * not that I've found. If you know of any, feel free to open a pull-request, or send it my way and I'll add it
 * to the docs :)
 */
export function Extension_match<F, T extends Extension.Handlers<F>>(config: Config<F>, builtins: T): Functor.Algebra<Traversable.lambda, F>
export function Extension_match<F, T extends Extension.Handlers<F>>(config: Config<F>, builtins: T) {
  return (n: Traversable.F<F>): F => {
    const [ext, $] = Extension.hooks(config, builtins)
    const key = Object_keys(ext)
    //    ^?
    for (let ix = 0, len = key.length; ix < len; ix++) {
      const k = key[ix]
      //    ^?
      const { predicate, handler } = ext[k]
      if (predicate(n)) return handler(n)
    }

    switch (true) {
      default: return fn.exhaustive(n)
      case Traversable.is.enum(n): return $.enum(n)
      case Traversable.is.null(n): return $.null(n)
      case Traversable.is.boolean(n): return $.boolean(n)
      case Traversable.is.integer(n): return $.integer(n)
      case Traversable.is.number(n): return $.number(n)
      case Traversable.is.string(n): return $.string(n)
      case Traversable.is.allOf(n): return $.allOf(n)
      case Traversable.is.anyOf(n): return $.anyOf(n)
      case Traversable.is.oneOf(n): return $.oneOf(n)
      case Traversable.is.array(n): return $.array(n)
      case Traversable.is.tuple(n): return $.tuple(n)
      case Traversable.is.record(n): return $.record(n)
      case Traversable.is.object(n): return $.object(n)
    }
  }
}

/** 
 * ## {@link Extension `Extension`}
 * 
 * The {@link Extension `Extension`} module contains constructors and
 * interfaces that allow users to dynamically extend the built-in 
 * {@link Traversable `Traversable`} type.
 * 
 * @example
 * import { Extension } from "@traversable/core"
 * 
 * interface Foo { type: "Foo" }
 * interface Bar { type: "Bar" }
 * interface Baz { type: "Baz" }
 * 
 * const myExt = Extension.register({
 *   Foo: (_: unknown): _ is Foo => true,
 *   Bar: (_: unknown): _ is Bar => true,
 *   Baz: (_: unknown): _ is Baz => true,
 * })
 * 
 * declare module "@traversable/core" {
 *   interface Extension extends Extension.register<typeof myExt> {}
 * }
 */
export interface Extension<F = unknown> extends Extension_register<Traversable.Map<F>> {}
export declare namespace Extension { 
  export { 
    Extension_hooks as hooks,
    Extension_match as match,
    Extension_register as register,
    Handlers,
    BuiltIns,
    UserDefinition,
    UserDefinitions,
  }
}
export namespace Extension { 
  Extension.hooks = Extension_hooks
  Extension.match = Extension_match
  Extension.register = Extension_register 
}
