import { core } from "@traversable/core"
import { array, object } from "@traversable/data"

export {
  type AnyMediaType as any,
  MediaTypes as all,
  MediaTypeEntries as entries,
  MediaType as enum,
  ReverseLookup,
  isAnyMediaType as isAny,
  isSpecificMediaType as is,
}

type AnyMediaType = (typeof MediaType)[keyof typeof MediaType]

/**
 * Source: https://github.com/purescript-contrib/purescript-media-types
 */
const MediaTypeEntries = [
  ["applicationJSON", "application/json"],
  ["applicationFormURLEncoded", "application/x-www-form-urlencoded"],
  ["applicationJavascript", "application/javascript"],
  ["applicationOctetStream", "application/octet-stream"],
  ["applicationXML", "application/xml"],
  ["imageGIF", "image/gif"],
  ["imageJPEG", "image/jpeg"],
  ["imagePNG", "image/png"],
  ["multipartFormData", "multipart/form-data"],
  ["textCSV", "text/csv"],
  ["textHTML", "text/html"],
  ["textPlain", "text/plain"],
  ["textXML", "text/xml"],
] as const

type MediaType = typeof MediaType
const MediaType = object.fromEntries(MediaTypeEntries)

const ReverseLookup = object.createLookup(object.invert(MediaType))

const MediaTypes = array.snds(MediaTypeEntries)

const isAnyMediaType = array.includes(MediaTypes)
//            ^?

const isSpecificMediaType: <MediaType extends AnyMediaType>(
  mediaType: MediaType,
) => (u: unknown) => u is MediaType = core.is.literally
