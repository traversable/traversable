export namespace URI {
  export const leaf = "@traversable/data/object/fromPaths::leaf"
  export type leaf = typeof URI.leaf
  export const not_found = "@traversable/core/lens/symbol::not_found"
  export type not_found = typeof URI.not_found
}

export namespace symbol {
  export const not_found = Symbol.for(URI.not_found)
  export type not_found = typeof symbol.not_found
  export const leaf = Symbol.for(URI.leaf)
  export type leaf = typeof symbol.leaf
}
