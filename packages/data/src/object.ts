import type { any } from "./_internal/_any.js"

import {
  type object_invertible as invertible,
  type object_knownPart as knownPart,
  type object_omitLax as omitLax,
  type object_optional as optional,
  type object_optionalKeys as optionalKeys,
  type object_required as required,
  type object_requiredKeys as requiredKeys,
  object_bind as bind,
  object_camel as camel,
  object_capitalize as capitalize,
  object_complement as complement,
  object_const,
  object_createLookup as createLookup,
  object_emptyOf as emptyOf,
  object_entries as entries,
  object_filter as filter,
  object_filterKeys as filterKeys,
  object_find as find,
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
  object_is as is,
  object_isComposite as isComposite,
  object_isKeyOf as isKeyOf,
  object_isNonEmpty as isNonEmpty,
  object_isRecord as isRecord,
  object_kebab as kebab,
  object_keys as keys,
  object_let,
  object_lookup as lookup,
  object_lowercase as lowercase,
  object_mapKeys as mapKeys,
  object_omit as omit,
  object_parseEntry as parseEntry,
  object_parseKey as parseKey,
  object_pascal as pascal,
  object_pick as pick,
  object_pluck as pluck,
  object_postfix as postfix,
  object_prefix as prefix,
  object_snake as snake,
  object_stringifyValues as stringifyValues,
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
    stringifyValues,
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
  object.keys = keys
  object.fromPath = fromPath
  object.isRecord = isRecord
  object.isComposite = isComposite
  object.has = has
  object.bind = bind
  object.titlecase = titlecase
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
  object.stringifyValues = stringifyValues
  object.lowercase = lowercase
  object.uppercase = uppercase
  object.transform = transform
  object.uncapitalize = uncapitalize
  object.unpostfix = unpostfix,
  object.unprefix = unprefix
  object.values = values
}
