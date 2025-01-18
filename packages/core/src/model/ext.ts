import type { newtype } from "@traversable/registry"
import type { key, prop } from "@traversable/data"
import { fn } from "@traversable/data"

import * as Traversable from "./traversable.js"

export { Extension }

/** @internal */
type Object_keys<T, K extends keyof T = prop.and<keyof T>> = never | ([K] extends [never] ? string : K)[]
/** @internal */
const Object_keys 
  : <T extends object>(object: T) => Object_keys<T>
  = globalThis.Object.keys



declare namespace Union {
  type toIntersection<U> 
    = (U extends U ? (_: U) => any : never) extends
    (_: infer T) => any ? T : never
  type enumerate<U, Last = Union.toThunk<U> extends () => infer X ? X : never> = Union.enumerate.loop<U, [], Last>
  namespace enumerate {
    type loop<U, Out extends readonly unknown[], H = Union.toThunk<U> extends () => infer X ? X : never> 
      = [H] extends [never] ? Out : Union.enumerate.loop<Exclude<U, H>, [H, ...Out]>
  }
  type toThunk<U> = (U extends U ? (_: () => U) => void : never) extends (_: infer I) => void ? I : never;
}

type UserDefinitions = Omit<Extension, keyof Traversable.Map<any>>
type Precedence<U extends UserDefinitions = UserDefinitions> = [...Union.enumerate<U[keyof U]> , ...Traversable.Traversables]
type Entries<K extends keyof Extension = keyof Extension> = (K extends K ? [extName: K, ext: Extension[K]] : never)[]
type TargetOf<S> = S extends (_: any) => _ is infer T ? T : S 

// export declare const init: <Ix>(context: Ix) => Map.prototype

const Map: StructureMapConstructor = globalThis.Map as never
interface StructureMapConstructor {
  new (): StructureMap;
  readonly prototype: StructureMap
}

interface StructureMap<Ix = {}, _ = { [K in keyof UserDefinitions]: UserDefinitions[K] }> {
  get<K extends keyof Extension>(extName: K): Extension[K]
  forEach(f: (ext: Extension[keyof Extension]) => void): void
  entries(): Entries
  has<K extends keyof Extension>(extName: K): true
  has<K extends key.finite<K>>(extName: K): false
  has<K extends keyof any>(extName: K): boolean
  has<K extends keyof Extension>(extName: K): true
  keys(): (keyof Extension)[]
  values(): { [K in keyof Precedence]: Precedence[K] }
  /** 
   * ### {@link Map._order `registry._order`} 
   * **Note:** {@link Map._order `registry._order`} is a type-level 
   * property; it does not exist at runtime.
   */
  get _order(): Precedence
  /** 
   * ### {@link Map._size `registry._size`} 
   * **Note:** {@link Map._size `registry._size`} is a type-level 
   * property; it does not exist at runtime.
   */
  get _size(): Precedence["length"]
  /** 
   * ### {@link Map._context `registry._context`} 
   * **Note:** {@link Map._context `registry._context`} is a type-level 
   * property; it does not exist at runtime.
   */
  get _context(): Ix
}

/** @internal - exported for testing purposes */
export const registry = new Map()

/** 
 * ## {@link Extension `Extension`}
 * 
 * The {@link Extension `Extension`} module contains constructors and
 * interfaces that allow users to dynamically extend the built-in 
 * {@link Traversable `Traversable`} type.
 * 
 * @example
 * import { Extension, is, tree } from "@traversable/core"
 * 
 * interface Foo { type: "Foo" }
 * interface Bar { type: "Bar" }
 * interface Baz { type: "Baz" }
 * 
 * const myExt = Extension.register({
 *   Foo: (u: unknown): u is Foo => tree.has("type", is.literally("Foo"))
 *   Bar: (u: unknown): u is Bar => tree.has("type", is.literally("Bar"))
 *   Baz: (u: unknown): u is Baz => tree.has("type", is.literally("Baz"))
 * })
 * 
 * declare module "@traversable/core" { interface Extension extends Extension.register<typeof myExt> {} }
 */

interface Extension_register<S> extends newtype<{ [K in keyof S]: RegisteredExtension<K, TargetOf<S[K]>> }> {}
function Extension_register<S extends { [ext: string]: (u: any) => u is any }>(exts: S): Extension_register<S>
function Extension_register<S extends { [ext: string]: (u: any) => u is any }>(exts: S) { 
  void Object.entries(exts).forEach(([k, v]) => (registry as never as globalThis.Map<any, any>).set(k, v)) 
  return exts
}

interface RegisteredExtension<Tag extends keyof any, T> { (u: unknown): u is T; tag: Tag }
declare namespace RegisteredExtension {
  type infer<T> = T extends RegisteredExtension<any, infer Ext> ? Ext : never
}

interface Extension<S = unknown> extends Extension_register<Traversable.Map<S>> {}
declare namespace Extension { 
  export { 
    Extension_match as match,
    Extension_product as product,
    Extension_register as register,
    ExtensionSet as Set,
    StructureMap,
    RegisteredExtension as Registered,
    BuiltIns,
    Handlers,
    UserDef,
    UserDefs,
  }
}

namespace Extension {
  Extension.product = Extension_product
  Extension.match = Extension_match
  Extension.register = Extension_register
}


type BuiltIns<S, Ix> = { [K in keyof Traversable.Map<S>]: (x: Traversable.Map<S>[K], ix: Ix) => S }
type ExtensionSet<S> = Omit<Extension, keyof Traversable.Map<S>>
type ExtensionName = keyof ExtensionSet<any>

type UserDef<S, Out> = { 
  predicate(u: unknown): u is S; 
  handler(n: S): Out 
}
type UserDefs<S, Ix> = { [K in ExtensionName]: (x: RegisteredExtension.infer<TargetOf<UserDef<Extension[K], S>["predicate"]>>, ix: Ix) => S } // UserDef<Extension[K], S> }

type Handlers<S, Ix> = (
  & UserDefs<S, Ix>
  & BuiltIns<S, Ix>
)

/** TODO: replace this with `Config` or `ConfigwithContext` in "./config.ts" */
interface Config<S, Ix> { handlers: Partial<Handlers<S, Ix>> }

function Extension_product<S, Ix>(config: Config<S, Ix>)
  : [keyof UserDefs<S, Ix>] extends [never] 
  ? [Record<string, UserDef<unknown, S>>, BuiltIns<S, Ix>]
  : [UserDefs<S, Ix>, BuiltIns<S, Ix>]

function Extension_product<S, Ix>(config: Config<S, Ix>) {
  const ks = Object_keys(config.handlers)
  let userDefs: Record<string, unknown> = {},
      builtIns: Record<string, unknown> = {}
  for (let ix = 0, len = ks.length; ix < len; ix++) {
    const k = ks[ix]
    if (Traversable.Known.includes(k)) 
      void (builtIns[k] = config.handlers[k])
    else 
      void (userDefs[k] = config.handlers[k])
  }
  return [userDefs, builtIns]
}

/** @internal */
let count = 0

function Extension_match<S, Ix>(config: Config<S, Ix>) {
  return (ix: Ix, n: Traversable.F<S>): S => {
    const meta = { count: count++ }
    const [userDefs, $] = Extension_product(config)
    const key = Object_keys(userDefs)
    //    ^?
    for (let ix = 0, len = key.length; ix < len; ix++) {
      const { predicate, handler } = userDefs[key[ix]]
      if (predicate(n)) return handler({ ...n, ...meta })
    }

    switch (true) {
      default: return fn.softExhaustiveCheck(n)
      case Traversable.is.enum(n): return $.enum(n, ix)
      case Traversable.is.null(n): return $.null(n, ix)
      case Traversable.is.boolean(n): return $.boolean(n, ix)
      case Traversable.is.integer(n): return $.integer(n, ix)
      case Traversable.is.number(n): return $.number(n, ix)
      case Traversable.is.string(n): return $.string(n, ix)
      case Traversable.is.allOf(n): return $.allOf(n, ix)
      case Traversable.is.anyOf(n): return $.anyOf(n, ix)
      case Traversable.is.oneOf(n): return $.oneOf(n, ix)
      case Traversable.is.array(n): return $.array(n, ix)
      case Traversable.is.tuple(n): return $.tuple(n, ix)
      case Traversable.is.record(n): return $.record(n, ix)
      case Traversable.is.object(n): return $.object(n, ix)
    }
  }
}
