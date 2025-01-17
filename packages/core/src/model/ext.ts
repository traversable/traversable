import type { prop } from "@traversable/data"
import { fn } from "@traversable/data"
import type { Array, Capitalize, Functor, newtype } from "@traversable/registry"

// import type { /* Config /* , ConfigWithContext */ } from "./config.js"
import type { Context } from "./meta.js"
import * as Traversable from "./traversable.js"

export { Extension }

/** @internal */
type Object_keys<T, K extends keyof T = prop.and<keyof T>> = never | ([K] extends [never] ? string : K)[]
/** @internal */
const Object_keys 
  : <T extends object>(object: T) => Object_keys<T>
  = globalThis.Object.keys

type TargetOf<S> = S extends (_: any) => _ is infer T ? T : S 

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

interface Extension_register<S> extends newtype<{ [K in keyof S]: TargetOf<S[K]> }> {}
function Extension_register<S extends { [ext: string]: (u: any) => u is any }>(exts: S): Extension_register<S>
function Extension_register<S extends { [ext: string]: (u: any) => u is any }>(exts: S) { return exts }

interface Extension<S = unknown> extends Extension_register<Traversable.Map<S>> {}
declare namespace Extension { 
  export { 
    Extension_match as match,
    Extension_product as product,
    Extension_register as register,
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

namespace Extension {
  Extension.register = Extension_register
}

type BuiltIns<S, Ix> = { [K in keyof Traversable.Map<S>]: (x: Traversable.Map<S>[K], ix: Ix) => S }
type ExtensionSet<S> = Omit<Extension, keyof Traversable.Map<S>>
type ExtensionName = keyof ExtensionSet<any>

type UserDef<S, Out> = { 
  predicate(u: unknown): u is S; 
  handler(n: S): Out 
}
type UserDefs<S, Ix> = { [K in ExtensionName]+?: (x: UserDef<Extension[K], S>, ix: Ix) => UserDef<Extension[K], S> }

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
