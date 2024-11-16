import type { any } from "./_internal/_any.js"

import {
  bind,
  camel,

  // functions
  object_capitalize as capitalize,
  object_capitalizeValues as capitalizeValues,
  object_complement as complement,
  object_createLookup as createLookup,
  object_empty as empty,
  object_emptyOf as emptyOf,
  object_entries as entries,
  object_filter as filter,
  filterKeys,
  object_find as find,
  object_flatten as flatten,
  object_fromArray as fromArray,
  object_fromEntries as fromEntries,
  object_fromKeys as fromKeys,
  object_fromPairs as fromPairs,
  fromPath,
  fromPaths,
  object_get as get,
  has,
  object_includes as includes,
  object_intersect as intersect,
  object_invert as invert,

  // types
  type object_invertible as invertible,

  object_is as is,
  object_isKeyOf as isKeyOf,
  object_isNonEmpty as isNonEmpty,
  isNonPrimitiveObject,
  isRecord,
  kebab,
  keys,
  type object_knownPart as knownPart,
  object_lookup as lookup,
  object_lowercaseValues as lowercaseValues,
  object_mapKeys as mapKeys,
  object_const,
  // functions
  object_let,
  object_omit as omit,
  type object_omitLax as omitLax,
  type object_optional as optional,
  type object_optionalKeys as optionalKeys,
  object_parseEntry as parseEntry,
  object_parseKey as parseKey,
  pascal,
  object_pick as pick,
  object_pluck as pluck,
  object_postfix as postfix,
  object_postfixValues as postfixValues,
  object_prefix as prefix,
  object_prefixValues as prefixValues,
  type object_required as required,
  type object_requiredKeys as requiredKeys,
  object_serialize as serialize,
  snake,
  object_stringifyValues as stringifyValues,
  titlecase,
  object_titlecaseValues as titlecaseValues,
  object_toLower as toLower,
  toPaths,
  object_toUpper as toUpper,
  object_transform as transform,
  object_uncapitalize as uncapitalize,
  object_uncapitalizeValues as uncapitalizeValues,
  object_unpostfix as unpostfix,
  object_unpostfixValues as unpostfixValues,
  object_unprefix as unprefix,
  object_unprefixValues as unprefixValues,
  object_uppercaseValues as uppercaseValues,
  object_values as values,
} from "./_internal/_object.js"

export declare namespace object {
  export { 
    object_any as any,
    invertible,
    knownPart,
    omitLax,
    optional,
    optionalKeys,
    required,
    requiredKeys,
    keys,
    fromPath,
    fromPaths,
    toPaths,
    isRecord,
    isNonPrimitiveObject,
    has,

    object_let as let,
    object_const as const,
    // functions
    bind,
    camel,
    capitalize,
    capitalizeValues,
    complement,
    createLookup,
    empty,
    emptyOf,
    entries,
    filter,
    filterKeys,
    find,
    flatten,
    fromArray,
    fromEntries,
    fromKeys,
    fromPairs,
    get,
    includes,
    intersect,
    invert,
    is,
    isKeyOf,
    isNonEmpty,
    kebab,
    lookup,
    lowercaseValues,
    mapKeys,
    omit,
    parseEntry,
    parseKey,
    pascal,
    pick,
    pluck,
    postfix,
    postfixValues,
    prefix,
    prefixValues,
    serialize,
    snake,
    stringifyValues,
    titlecase,
    toLower,
    toUpper,
    transform,
    uncapitalize,
    uncapitalizeValues,
    unpostfix,
    unpostfixValues,
    unprefix,
    unprefixValues,
    uppercaseValues,
    values,
  }

  export type object_any<
    T extends 
    | object.type
    = object.type
  > = T
}
export declare namespace object {
  export interface of<T> extends object.any<{ [x: string]: T }> {}
  export type and<T> = object & T
  export type from<
    T, 
    U extends 
    | T extends object & infer V ? V : never
    = T extends object & infer V ? V : never
  > = U
  type identity<T> = T
  export interface type extends identity<any.object> {}
}

export function object() {}
export namespace object{
  object.keys = keys
  object.fromPath = fromPath
  object.fromPaths = fromPaths
  object.toPaths = toPaths
  object.isRecord = isRecord
  object.isNonPrimitiveObject = isNonPrimitiveObject
  object.has = has
  object.bind = bind
  object.titlecase = titlecase
  object.camel = camel
  object.capitalize = capitalize
  object.capitalizeValues = capitalizeValues
  object.complement = complement
  object.const = object_const
  object.createLookup = createLookup
  object.empty = empty
  object.emptyOf = emptyOf
  object.entries = entries
  object.filter = filter
  object.filterKeys = filterKeys
  object.find = find
  object.flatten = flatten
  object.fromArray = fromArray
  object.fromEntries = fromEntries
  object.fromKeys = fromKeys
  object.fromPairs = fromPairs
  object.get = get
  object.includes = includes
  object.intersect = intersect
  object.invert = invert
  object.is = is
  object.isKeyOf = isKeyOf
  object.isNonEmpty = isNonEmpty
  object.kebab = kebab
  object.let = object_let
  object.lookup = lookup
  object.lowercaseValues = lowercaseValues
  object.mapKeys = mapKeys
  object.omit = omit
  object.parseEntry = parseEntry
  object.parseKey = parseKey
  object.pascal = pascal
  object.pick = pick
  object.pluck = pluck
  object.postfix = postfix
  object.postfixValues = postfixValues
  object.prefix = prefix
  object.prefixValues = prefixValues
  object.serialize = serialize
  object.snake = snake
  object.stringifyValues = stringifyValues
  object.toLower = toLower
  object.toUpper = toUpper
  object.transform = transform
  object.uncapitalize = uncapitalize
  object.uncapitalizeValues = uncapitalizeValues
  object.unpostfix = unpostfix,
  object.unpostfixValues = unpostfixValues
  object.unprefix = unprefix
  object.unprefixValues = unprefixValues
  object.uppercaseValues = uppercaseValues
  object.values = values
}
