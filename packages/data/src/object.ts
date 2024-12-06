import type { any } from "./_internal/_any.js"

import {
  object_bind as bind,
  object_camel as camel,
  object_capitalize as capitalize,
  object_complement as complement,
  object_createLookup as createLookup,
  object_emptyOf as emptyOf,
  object_entries as entries,
  object_filter as filter,
  object_filterKeys as filterKeys,
  object_find as find,
  object_forEach as forEach,
  object_fromArray as fromArray,
  object_fromEntries as fromEntries,
  object_fromKeys as fromKeys,
  object_fromPairs as fromPairs,
  object_fromPath as fromPath,
  object_get as get,
  object_has as has,
  object_includes as includes,
  object_intersect as intersect,
  object_invert as invert,
  type object_invertible as invertible,
  object_is as is,
  object_isComposite as isComposite,
  object_isEmpty as isEmpty,
  object_isKeyOf as isKeyOf,
  object_isNonEmpty as isNonEmpty,
  object_isRecord as isRecord,
  object_kebab as kebab,
  object_keys as keys,
  type object_knownPart as knownPart,
  object_lookup as lookup,
  object_lowercase as lowercase,
  object_mapKeys as mapKeys,
  object_const,
  object_let,
  object_omit as omit,
  type object_omitLax as omitLax,
  type object_optional as optional,
  type object_optionalKeys as optionalKeys,
  object_parseEntry as parseEntry,
  object_parseKey as parseKey,
  object_pascal as pascal,
  object_pick as pick,
  object_pluck as pluck,
  object_postfix as postfix,
  object_prefix as prefix,
  type object_required as required,
  type object_requiredKeys as requiredKeys,
  object_snake as snake,
  object_some as some,
  object_stringifyValues as stringifyValues,
  object_symbols as symbols,
  object_titlecase as titlecase,
  object_transform as transform,
  object_uncapitalize as uncapitalize,
  object_unpostfix as unpostfix,
  object_unprefix as unprefix,
  object_uppercase as uppercase,
  object_values as values,
} from "./_internal/_object.js"

export declare namespace object {
  export {
    object_any as any,
    object_const as const,
    object_let as let,
  }
  export { 
    bind,
    camel,
    capitalize,
    complement,
    createLookup,
    emptyOf,
    entries,
    filter,
    filterKeys,
    find,
    forEach,
    fromArray,
    fromEntries,
    fromKeys,
    fromPairs,
    fromPath,
    get,
    has,
    includes,
    intersect,
    invert,
    invertible,
    is,
    isComposite,
    isEmpty,
    isKeyOf,
    isNonEmpty,
    isRecord,
    kebab,
    keys,
    knownPart,
    lookup,
    lowercase,
    mapKeys,
    omit,
    omitLax,
    optional,
    optionalKeys,
    parseEntry,
    parseKey,
    pascal,
    pick,
    pluck,
    postfix,
    prefix,
    required,
    requiredKeys,
    snake,
    some,
    stringifyValues,
    symbols,
    titlecase,
    transform,
    uncapitalize,
    unpostfix,
    unprefix,
    uppercase,
    values,
  }
}

export declare namespace object {
  /**
   * ## {@link nonfinite `object.nonfinite`}
   * 
   * {@link nonfinite `object.nonfinite`} constrains a type parameter to be an
   * object whose index is non-finite.
   * 
   * For example, the following examples all satisfy `object.nonfinite`:
   * 
   * ```typescript
   *  import type { object } from "@traversable/data"
   * 
   *  type NonFinite_01 = globalThis.Record<string | symbol, unknown>
   *  type Ok1 = object.nonfinite<NonFinite_01> 
   *  //   ^? type Ok1 = {}
   * 
   *  type NonFinite_02 = { [K in string]?: unknown }
   *  type Ok2 = object.nonfinite<NonFinite_02>
   * 
   *  interface NonFinite_03 { [x: number]: unknown }
   *  type Ok3 = object.nonfinite<NonFinite_03>
   * ```
   * 
   * Because these examples have known/knowable index signatures, they do not:
   * 
   * ```typescript
   *  import type { object } from "@traversable/data"
   * 
   *  type Finite_01 = globalThis.Record<"a" | "b", unknown>
   *  type Never_01 = object.nonfinite<Finite_01>
   *  //   ^? type Never1 = never
   *   
   *  type Finite_02 = { [Symbol.iterator](): Iterator<unknown> }
   *  type Never_02 = object.nonfinite<Finite_02>
   *  //   ^? type Never2 = never
   * ```
   * 
   * See also:
   * - {@link finite `object.finite`}
   * 
   * @example
   *  import type { object } from "@traversable/data"
   * 
   *  function nonfinite<T extends object.nonfinite<T>>(object: T) { return object }
   *  
   *  const ex_01 = nonfinite({ [Math.random() + ""]: Math.random() })   // ✅ No TypeError
   *  //    ^? const ex_01: { [x: string]: number }
   * 
   *  const ex_02 = nonfinite({ [Math.random()]: 1, [Symbol.for()]: 2 }) // ✅ No TypeError
   *  //    ^? const ex_02: { [x: number]: number, [x: symbol]: number }
   * 
   *  const ex_03 = nonfinite({ a: 1 })      // 🚫 [TypeError]: '{ a: number }` is not 
   *  //    ^? const ex_03: never            //    assignable to parameter of type 'never'
   */
  type nonfinite<T, K extends keyof T = keyof T> 
    = { [x: symbol]: never } extends T ? { [x: symbol]: unknown }
    : number extends K ? { [x: number]: unknown } 
    : symbol extends K ? { [x: symbol]: unknown }
    : never
    ;

  /**
   * ## {@link finite `object.finite`}
   * 
   * {@link finite `object.finite`} constrains a type parameter to be a "finite"
   * object (that is, an object whose index signature is comprised of finite
   * keys).
   * 
   * **Note:** For this to work, you need to apply {@link finite `object.finite`}
   * to the type parameter you're _currently_ declaring, see example below.
   * 
   * See also:
   * - {@link nonfinite `object.nonfinite`}
   * 
   * @example
   *  import { object } from "@traversable/data"
   * 
   *  const sym = Symbol.for("HEY")
   * 
   *  const ex_01 = object.finite({ [-1]: 2, "0": 1, [symbol]: 3 })
   *  //    ^? const ex_01: { [-1]: 2, "0": 1, [symbol]: 3 }
   * 
   *  const ex_02 = object.finite({ [Symbol()]: 1 })  // ✅ No TypeError
   *  //    ^? const ex_02: never
   * 
   *  const ex_03 = object.finite({ [sym]: 9 })
   *  //    ^? const ex_03: { [sym]: 9 }
   * 
   *  const ex_04 = object.finite(                    // [🚫 TypeError]: '{ [k: string]: number; }' is 
   *    //  ^? const ex_04: never                     // not assignable to parameter of type 'never'
   *    globalThis.Object.fromEntries(globalThis.Object.entries({ a: 1, b: 2 }))
   *  ) 
   * 
   *  const ex_05 = object.finite(                    // ✅ No TypeError
   *    //  ^? const ex_05: { a: 1, b: 2 }
   *    object.fromEntries(object.entries({ a: 1, b: 2 }))
   *  )
   */
  type finite<T, K extends keyof T = keyof T> 
    = [nonfinite<T>] extends [never] ? { [P in K]+?: unknown } : never

  interface of<T> extends object.any<{ [x: string]: T }> {}
  type and<T> = object & T
  type from<
    T, 
    U extends 
    | T extends object & infer V ? V : never
    = T extends object & infer V ? V : never
  > = U
  type identity<T> = T
  interface type extends identity<any.object> {}
  type object_any<
    T extends 
    | object.type
    = object.type
  > = T
}

export function object() {}
export namespace object {
  object.bind = bind
  object.camel = camel
  object.capitalize = capitalize
  object.complement = complement
  object.const = object_const
  object.createLookup = createLookup
  object.emptyOf = emptyOf
  object.entries = entries
  object.filter = filter
  object.filterKeys = filterKeys
  object.find = find
  object.forEach = forEach
  object.fromArray = fromArray
  object.fromEntries = fromEntries
  object.fromKeys = fromKeys
  object.fromPairs = fromPairs
  object.fromPath = fromPath
  object.get = get
  object.has = has
  object.includes = includes
  object.intersect = intersect
  object.invert = invert
  object.is = is
  object.isComposite = isComposite
  object.isEmpty = isEmpty
  object.isKeyOf = isKeyOf
  object.isNonEmpty = isNonEmpty
  object.isRecord = isRecord
  object.kebab = kebab
  object.keys = keys
  object.let = object_let
  object.lookup = lookup
  object.lowercase = lowercase
  object.mapKeys = mapKeys
  object.omit = omit
  object.parseEntry = parseEntry
  object.parseKey = parseKey
  object.pascal = pascal
  object.pick = pick
  object.pluck = pluck
  object.postfix = postfix
  object.prefix = prefix
  object.snake = snake
  object.some = some
  object.stringifyValues = stringifyValues
  object.symbols = symbols
  object.titlecase = titlecase
  object.transform = transform
  object.uncapitalize = uncapitalize
  object.unpostfix = unpostfix,
  object.unprefix = unprefix
  object.uppercase = uppercase
  object.values = values
}
