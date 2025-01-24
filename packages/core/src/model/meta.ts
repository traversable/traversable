import { t } from "../guard/index.js"

export { Meta }

declare namespace Meta {
  export {
    Meta_object as object,
    Meta_number as number,
    Meta_string as string,
    Meta_integer as integer,
    Meta_array as array,
    Meta_allOf as allOf,
    Meta_anyOf as anyOf,
    Meta_oneOf as oneOf,
    Meta_tuple as tuple,
    Meta_record as record,
  }
}

export interface Context<T = any> {
  path: (keyof any)[]
  depth: number
  indent: number
  typeName: string
  absolutePath: string[]
  siblingCount: number
  T?: T
}

export declare namespace Context {
  export interface withMeta<T = any, Meta = {}> extends Context<T> { meta?: Meta }
}

/** 
 * @internal 
 * 
 * TODO: figure out where to put schemas that are used in many places
 */
const key = t.anyOf(t.string(), t.symbol(), t.number())

declare namespace Meta { 
  type has<T> = { meta?: T }
  interface Traversable<_ = unknown> extends Meta.Base {}
  interface JsonSchema<_ = unknown> { originalIndex?: number }
  ///
  interface Numeric {
    minimum?: number
    maximum?: number
    multipleOf?: number
    exclusiveMinimum?: number | boolean
    exclusiveMaximum?: number | boolean
  }
  interface Enumerable {
    minLength?: number
    maxLength?: number 
  }
  ///
  interface Meta_integer<_ = unknown> extends Meta.Base, Meta.Numeric { format?: string }
  interface Meta_number<_ = unknown> extends Meta.Base, Meta.Numeric { format?: string }
  interface Meta_string<_ = unknown> extends Meta.Base, Meta.Enumerable { 
    format?: string
    pattern?: string
  }

  ///
  interface Meta_tuple<_ = unknown> extends Meta.Base, Meta.Enumerable {}
  interface Meta_record<_ = unknown> extends Meta.Base {}
  interface Meta_array<_ = unknown> extends Meta.Base, Meta.Enumerable {}
  interface Meta_allOf<_ = unknown> extends Meta.Base {}
  interface Meta_anyOf<_ = unknown> extends Meta.Base {}
  interface Meta_oneOf<_ = unknown> extends Meta.Base {}
  interface Meta_object<_ = unknown> extends Meta.Base {}
}

namespace Meta {
  export interface Base extends t.typeof<typeof Base> {}
  export const Base = t.object({
    originalIndex: t.optional(t.number()),
    nullable: t.optional(t.boolean()),
    optional: t.optional(t.boolean()),
    path: t.optional(t.array(key)),
  })
}
