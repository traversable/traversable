import type { Wane, Wax } from "@traversable/registry"
import { is, type t } from './guard/exports.js'

/** @internal */
const Array_isArray = globalThis.Array.isArray
/** @internal */
const Array_of = globalThis.Array.of
/** @internal */
const Object_keys = globalThis.Object.keys

/** 
 * ## {@link merge `merge`}
 * 
 * Given a schema, {@link merge `merge`} returns a merging function
 * that expects its first argument to be the object you're merging
 * _into_, and its second argument as the object you're merging
 * _from_.
 * 
 * The case we have for {@link merge `merge`} is usually merging 
 * some preferred (but not required) set of user-definitions over
 * a larger set of default definitions/implementations.
 */
export function merge<S extends t.type, Max extends number>(schema: S, maxDepth?: Max) {
  return (
    defaults: Wax<t.typeof<S>, Max>, 
    userDef?: Wane<t.typeof<S>, Max>
  ): t.typeof<S> => {
    const loop = (def: any, sch: any, user: any) => {
      if (user === undefined) return def
      else if (!!sch && '_tag' in sch && sch._tag === 'array' && Array_isArray(def)) 
        return Array_isArray(user) ? user : def
      else if (Array_isArray(def)) {
        let out = Array_of()
        let len = def.length
        for (let ix = 0; ix < len; ix++) 
          out.push(loop(def[ix], sch.def[ix], user[ix]))
        return out
      }
      else if (!!def && typeof def === 'object') {
        let keys = Object_keys(def)
        let len = keys.length
        let out: { [x: string]: any } = {}
        for (let ix = 0; ix < len; ix++) {
          let k = keys[ix]
          out[k] = loop(def[k], sch.def[k], user[k])
        }
        return out
      }
      else if (is.primitive(def)) return is.primitive(user) ? user : def
      else return user
    }
    return loop(defaults, schema, userDef)
  }
}
