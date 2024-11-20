export type { JSON }

type inline<T> = T
interface JSON_object<T extends JSON = JSON> extends inline<{ [x: string]: T }> {}
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
  ;

declare namespace JSON {
  export {
    JSON as any,
    // JSON_array as array,
    JSON_object as object,
    JSON_scalar as scalar,
  }
}
