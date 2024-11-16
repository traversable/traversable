export type { JSON }

interface JSON_object { [x: string]: JSON }
interface JSON_array extends globalThis.ReadonlyArray<JSON> {}
type JSON_scalar =   
  | null
  | boolean
  | number
  | string
  ;

type JSON = 
  | JSON_scalar
  | JSON_array
  | JSON_object
  ;

declare namespace JSON {
  export {
    JSON as any,
    JSON_array as array,
    JSON_object as object,
    JSON_scalar as scalar,
  }
}
