import { newtype } from "any-ts"

/** 
 * "/api/v1/search"
 *  ^^^^^^^ path_prefix
 * 
 * "/api/v1/search/continue"
 *          ^^^^^^ path_ns
 * 
 * "/api/v1/search/continue"
 *                 ^^^^^^^^ segment
 * 
 * "/api/v1/search/recent"
 *                 ^^^^^^ segment
 * 
 * "/api/v1/search/recent/{sid}"
 *                        ^^^^ param
 * 
 * "/api/v1/search/recent/{sid}/"
 *                        ^^^^ param
 * 
 * "/api/v2/invoices/{iid}"
 * 
 * "/api/v2/invoices/{iid}.pdf"
 * 
 * "/api/v2/invoices/{iid}/contracts"
 * 
 * "/api/v2/invoices/{iid}/contracts/{cid}"
 * 
 * "/api/v2/properties/{pid}/images/{iix}"
 * 
 * 
 * 
 * 
 * 
 * "/api/v1/search/{id}/continue"
 * 
 * pathPrefix
 * string[].join("/")
 * 
 * resourceNs
 */


// BNF

type path = [
  prefix: path.prefix, 
  ns: path.ns,
  ...segments: [path.qualifier, ...(path.qualifier | path.param)[]]
]

declare namespace path {
  const prefix: `/${string}`
  const param: `${string}{${string}}${string}` 
  const segment: path.qualifier | path.param
  const path: [prefix: path.prefix, ns: path.ns, first?: path.segment, ...rest: path.segment[]]

  interface prefix
    <_ extends typeof prefix = typeof prefix> extends 
    newtype<prefix> {}

  interface ns
    <_ extends string = string> extends 
    newtype<string> {}

  interface qualifier
    <_ extends string = string> extends 
    newtype<string> {}

  interface param
    <_ extends typeof param = typeof param> extends 
    newtype<typeof param> {}
  
  interface segment<_ extends typeof segment = typeof segment> extends 
    newtype<typeof segment> {}

  interface path<_ extends typeof path = typeof path> extends
    newtype<typeof path> {}
  
}

// declare const seg: path.segments
declare const pat: path.path

// const z = pat[3]




