import { t } from "../guard/index.js"
import type { Meta_Base as Base } from "./traversable.js"

export { Meta }

declare namespace Meta {
  export {
    Meta_object as object,
    Meta_number as number,
    Meta_string as string,
  }
}

declare namespace Meta { export { Base } }
declare namespace Meta { 
  type has<T> = { meta?: T }

  interface Traversable<_ = unknown> extends Meta.Base {}
  interface JsonSchema<_ = unknown> { originalIndex?: number }

  interface tuple<_ = unknown> extends Meta.Base {}
  interface record<_ = unknown> extends Meta.Base {}
  interface array<_ = unknown> extends Meta.Base {}
  interface allOf<_ = unknown> extends Meta.Base {}
  interface anyOf<_ = unknown> extends Meta.Base {}
  interface oneOf<_ = unknown> extends Meta.Base {}
  interface Meta_object<_ = unknown> extends Meta.Base {}
  interface Meta_string<_ = unknown> extends Meta.Base { format?: string }
  interface Numeric {
    format?: string
    minimum?: number
    maximum?: number
  }
  interface Enumerable {
    minLength?: number
    maxLength?: number 
  }

  interface integer<_ = unknown> extends Meta.Base, Meta.Numeric {}
  interface Meta_number<_ = unknown> extends Meta.Base, Meta.Numeric {}
}

function Meta() {
  return t.object({
    originalIndex: t.optional(t.number()),
  })
}

Meta.is = Meta().is

interface Meta extends t.typeof<ReturnType<typeof Meta>> {}

