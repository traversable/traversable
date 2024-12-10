export type { JSON }

type inline<T> = T
interface JSON_object { [x: number]: JSON }
// interface JSON_array extends globalThis.ReadonlyArray<JSON> {}
// type JSON_array = readonly JSON[]
type JSON_scalar =   
  | undefined
  | null
  | boolean
  | number
  | string
  ;

type JSON = 
  | JSON_scalar
  | readonly JSON[]
  | JSON_object
  | {}
  ;

declare namespace JSON {
  export {
    JSON as any,
    // JSON_array as array,
    JSON_object as object,
    JSON_scalar as scalar,
  }
}

export type Json =
  | undefined
  | Scalar
  | JsonArray
  | JsonObject
  | { toString(): string }
export interface JsonObject extends inline<{ [K in string]: Json }> {}
export interface JsonArray extends globalThis.ReadonlyArray<Json> {}
export type Scalar =
  | null
  | boolean
  | number
  | string
