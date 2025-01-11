import { t } from "../guard/index.js"
import type { Meta_Base as Base } from "./traversable.js"

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
  absolutePath: `/${string}`
  T?: T
}
export declare namespace Context {
  export interface withMeta<T = any, Meta = {}> extends Context<T> { meta?: Meta }
}

declare namespace Meta { export { Base } }
declare namespace Meta { 
  type has<T> = { meta?: T }

  interface Traversable<_ = unknown> extends Meta.Base {}
  interface JsonSchema<_ = unknown> { originalIndex?: number }

  interface Meta_integer<_ = unknown> extends Meta.Base, Meta.Numeric {}
  interface Meta_number<_ = unknown> extends Meta.Base, Meta.Numeric {}
  interface Meta_string<_ = unknown> extends Meta.Base { format?: string }

  interface Meta_tuple<_ = unknown> extends Meta.Base {}
  interface Meta_record<_ = unknown> extends Meta.Base {}
  interface Meta_array<_ = unknown> extends Meta.Base {}
  interface Meta_allOf<_ = unknown> extends Meta.Base {}
  interface Meta_anyOf<_ = unknown> extends Meta.Base {}
  interface Meta_oneOf<_ = unknown> extends Meta.Base {}
  interface Meta_object<_ = unknown> extends Meta.Base {}
  interface Numeric {
    format?: string
    minimum?: number
    maximum?: number
  }
  interface Enumerable {
    minLength?: number
    maxLength?: number 
  }
}

Meta.is = Meta().is
interface Meta extends t.typeof<ReturnType<typeof Meta>> {}
function Meta() {
  return t.object({
    originalIndex: t.optional(t.number()),
  })
}
