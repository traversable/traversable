import { core, tree } from "@traversable/core"
import { array, fn, object } from "@traversable/data"
import type { any } from "any-ts"

export {
  type AnyStatusCode as any,
  StatusCodes as all,
  isAnyStatusCode as isAny,
  isSpecificStatusCode as is,
  hasAnyStatusCode as hasAny,
  hasSpecificStatusCode as has,
  Info,
  Success,
  Redirect,
  ClientError,
  ServerError,
  Lookup,
  ReverseLookup,
  Lookup as enum,
}

/** @internal */
const lit: <T extends any.primitive>(value: T) => T = fn.identity

const define: <const T extends { [x: number]: string }>(value: T) => { -readonly [K in keyof T]: T[K] } = (
  value,
) => value

const y = define({
  abc: "hey",
})

type Info = typeof Info
//    ^?
/**
 * ### {@link Info `http.Status.Info`}
 *
 * A lookup table that maps every `1xx` {@link AnyStatusCode `http.Status`} to its
 * corresponding {@link StatusText `http.StatusText`} name.
 *
 * Originally specified in [RFC-9110](https://httpwg.org/specs/rfc9110.html#status.1xx):
 *
 * > The 1xx (Informational) class of status code indicates an interim response for communicating
 * > connection status or request progress prior to completing the requested action and sending a
 * > final response. Since HTTP/1.0 did not define any 1xx status codes, a server MUST NOT send a
 * > 1xx response to an HTTP/1.0 client.
 */
const Info = define({
  /** #### [`100` Status Code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/100) */
  [100]: "Continue",
  /** #### [`101` Status Code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/101) */
  [101]: "Switching Protocols",
  /** #### [`102` Status Code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/102) */
  [102]: "Processing",
  /** #### [`103` Status Code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/103) */
  [103]: "Early Hints",
})

type Success = typeof Success
//    ^?
/**
 * ### {@link Success `http.Success`}
 *
 * A lookup table that maps every `2xx` {@link AnyStatusCode `http.Status`} to its
 * corresponding {@link StatusText `http.StatusText`} name.
 *
 * Originally specified in [RFC-9110](https://httpwg.org/specs/rfc9110.html#status.2xx):
 *
 * > The 2xx (Successful) class of status code indicates that the client's request was successfully
 * > received, understood, and accepted.
 */
const Success = define({
  /** #### [`200` Status Code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/200) */
  [200]: "OK",
  /** #### [`201` Status Code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/201) */
  [201]: "Created",
  /** #### [`202` Status Code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/202) */
  [202]: "Accepted",
  /** #### [`203` Status Code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/203) */
  [203]: "Non-Authoritative Information",
  /** #### [`204` Status Code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/204) */
  [204]: "No Content",
  /** #### [`205` Status Code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/205) */
  [205]: "Reset Content",
  /** #### [`206` Status Code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/206) */
  [206]: "Partial Content",
  /** #### [`207` Status Code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/207) */
  [207]: "Multi-Status",
  /** #### [`208` Status Code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/208) */
  [208]: "Already Reported",
  /** #### [`226` Status Code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/226) */
  [226]: "IM Used",
})

type Redirect = typeof Redirect
//    ^?
/**
 * ### {@link Redirect `http.Redirect`}
 *
 * A lookup table that maps every `3xx` {@link AnyStatusCode `http.Status`} to its
 * corresponding {@link StatusText `http.StatusText`} name.
 *
 * Originally specified in [RFC-9110](https://httpwg.org/specs/rfc9110.html#status.3xx):
 *
 * > The 3xx (Redirection) class of status code indicates that further action needs to be taken
 * > by the user agent in order to fulfill the request.
 */
const Redirect = define({
  /** #### [`300` Status Code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/300) */
  [300]: "Multiple Choices",
  /** #### [`301` Status Code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/301) */
  [301]: "Moved Permanently",
  /** #### [`302` Status Code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/302) */
  [302]: "Found",
  /** #### [`303` Status Code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/303) */
  [303]: "See Other",
  /** #### [`304` Status Code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/304) */
  [304]: "Not Modified",
  /** #### [`307` Status Code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/307) */
  [307]: "Temporary Redirect",
  /** #### [`308` Status Code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/308) */
  [308]: "Permanent Redirect",
})

type ClientError = typeof ClientError
//    ^?
/**
 * ### {@link ClientError `http.ClientError`}
 *
 * A lookup table that maps every `4xx` {@link AnyStatusCode `http.Status`} to its
 * corresponding {@link StatusText `http.StatusText`} name.
 *
 * Originally specified in [RFC-9110](https://httpwg.org/specs/rfc9110.html#status.4xx):
 *
 * > The 4xx (Client Error) class of status code indicates that the client seems to have erred.
 * > Except when responding to a HEAD request, the server SHOULD send a representation containing
 * > an explanation of the error situation, and whether it is a temporary or permanent condition.
 * > These status codes are applicable to any request method. User agents SHOULD display any
 * > included representation to the user.
 */
const ClientError = define({
  /** #### [`400` Status Code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/400) */
  [400]: "Bad Request",
  /** #### [`401` Status Code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/401) */
  [401]: "Unauthorized",
  /** #### [`402` Status Code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/402) */
  [402]: "Payment Required",
  /** #### [`403` Status Code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/403) */
  [403]: "Forbidden",
  /** #### [`404` Status Code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/404) */
  [404]: "Not Found",
  /** #### [`405` Status Code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/405) */
  [405]: "Method Not Allowed",
  /** #### [`406` Status Code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/406) */
  [406]: "Not Acceptable",
  /** #### [`407` Status Code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/407) */
  [407]: "Proxy Authentication Required",
  /** #### [`408` Status Code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/408) */
  [408]: "Request Timeout",
  /** #### [`409` Status Code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/409) */
  [409]: "Conflict",
  /** #### [`410` Status Code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/410) */
  [410]: "Gone",
  /** #### [`411` Status Code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/411) */
  [411]: "Length Required",
  /** #### [`412` Status Code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/412) */
  [412]: "Precondition Failed",
  /** #### [`413` Status Code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/413) */
  [413]: "Content Too Large",
  /** #### [`414` Status Code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/414) */
  [414]: "URI Too Long",
  /** #### [`415` Status Code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/415) */
  [415]: "Unsupported Media Type",
  /** #### [`416` Status Code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/416) */
  [416]: "Range Not Satisfiable",
  /** #### [`417` Status Code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/417) */
  [417]: "Expectation Failed",
  /** #### [`418` Status Code](https://www.youtube.com/watch?v=dQw4w9WgXcQ) */
  [418]: "I'm a teapot",
  /** #### [`421` Status Code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/421) */
  [421]: "Misdirected Request",
  /** #### [`422` Status Code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/422) */
  [422]: "Unprocessable Content",
  /** #### [`423` Status Code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/423) */
  [423]: "Locked",
  /** #### [`424` Status Code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/424) */
  [424]: "Failed Dependency",
  /** #### [`425` Status Code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/425) */
  [425]: "Too Early",
  /** #### [`426` Status Code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/426) */
  [426]: "Upgrade Required",
  /** #### [`428` Status Code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/428) */
  [428]: "Precondition Required",
  /** #### [`429` Status Code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/429) */
  [429]: "Too Many Requests",
  /** #### [`431` Status Code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/431) */
  [431]: "Request Header Fields Too Large",
  /** #### [`451` Status Code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/451) */
  [451]: "Unavailable For Legal Reasons",
})

type ServerError = typeof ServerError
//    ^?
/**
 * ### {@link ServerError `http.ServerError`}
 *
 * A lookup table that maps every `5xx` {@link AnyStatusCode `http.Status`} to its
 * corresponding {@link StatusText `http.StatusText`} name.
 *
 * Originally specified in [RFC-9110](https://httpwg.org/specs/rfc9110.html#status.5xx):
 *
 * > The 5xx (Server Error) class of status code indicates that the server is aware that it
 * > has erred or is incapable of performing the requested method. Except when responding to
 * > a HEAD request, the server SHOULD send a representation containing an explanation of
 * > the error situation, and whether it is a temporary or permanent condition. A user agent
 * > SHOULD display any included representation to the user. These status codes are applicable
 * > to any request method.
 */
const ServerError = define({
  /** ### [`500` Status Code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/500) */
  [500]: "Internal Server Error",
  /** #### [`501` Status Code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/501) */
  [501]: "Not Implemented",
  /** #### [`502` Status Code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/502) */
  [502]: "Bad Gateway",
  /** #### [`503` Status Code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/503) */
  [503]: "Service Unavailable",
  /** #### [`504` Status Code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/504) */
  [504]: "Gateway Timeout",
  /** #### [`505` Status Code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/505) */
  [505]: "HTTP Version Not Supported",
  /** #### [`506` Status Code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/506) */
  [506]: "Variant Also Negotiates",
  /** #### [`507` Status Code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/507) */
  [507]: "Insufficient Storage",
  /** #### [`508` Status Code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/508) */
  [508]: "Loop Detected",
  /** #### [`510` Status Code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/510) */
  [510]: "Not Extended",
  /** #### [`511` Status Code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/511) */
  [511]: "Network Authentication Required",
})

type Lookup = typeof Lookup
//    ^?
/**
 * ### {@link Lookup `http.status.Lookup`}
 *
 * A lookup table that maps every HTTP {@link AnyStatusCode `http.Status`} to its
 * corresponding {@link StatusText `http.StatusText`} name.
 */
const Lookup = {
  ...ServerError,
  ...ClientError,
  ...Redirect,
  ...Success,
  ...Info,
}

/**
 * ### {@link AnyStatusCode `http.Status`}
 *
 * The {@link AnyStatusCode `http.Status`} type is the union of all HTTP status codes.
 *
 * Its value is derived from the keys of the {@link Lookup `http.Status.Lookup`} table.
 *
 * See also:
 * - [RFC 9110](https://httpwg.org/specs/rfc9110.html#overview.of.status.codes)
 * - {@link StatusText `http.Status.StatusText`}
 * - {@link Lookup `http.Status.Lookup`}
 */
type AnyStatusCode = keyof Lookup
//    ^?

/**
 * ### {@link StatusText `http.StatusText`}
 *
 * The {@link StatusText `http.StatusText`} type is the union
 * of all "human-readable" names.
 *
 * Its value is derived from the values of the {@link Lookup `http.Status.Lookup`} table.
 *
 * See also:
 * - [RFC 9110](https://httpwg.org/specs/rfc9110.html#overview.of.status.codes)
 * - {@link AnyStatusCode `http.Status`}
 * - {@link Lookup `http.Status.Lookup`}
 */
type StatusText = Lookup[keyof Lookup]
//    ^?

type ReverseLookup = typeof ReverseLookup
//    ^?
/**
 * ### {@link ReverseLookup `http.ReverseLookup`}
 *
 * A reverse-lookup that maps every HTTP {@link StatusText `http.StatusText`} code
 * to its corresponding {@link AnyStatusCode `http.Status`}.
 *
 * Its value is derived by swapping all the key-value pairs that make up the
 * {@link Lookup `http.Status.Lookup`} table.
 *
 * See also:
 * - [RFC 9110](https://httpwg.org/specs/rfc9110.html#overview.of.status.codes)
 * - {@link Lookup `http.Status.Lookup`}
 */
const ReverseLookup = object.invert(Lookup)
//    ^?

/**
 * ### {@link AllStatusCodes `http.Status.all`}
 *
 * All {@link AnyStatusCode `http.Status`} codes in array form.
 */
const StatusCodes = globalThis.Object.keys(Lookup).map((code) =>
  globalThis.Number.parseInt(code, 10),
) as AnyStatusCode[]

/**
 * ### {@link isAnyStatusCode `http.Status.isAny`}
 *
 * A type-guard that narrows its argument to be a member of the set of {@link AnyStatusCode `http.Status`} codes.
 */
const isAnyStatusCode: (u: unknown) => u is AnyStatusCode = array.includes(StatusCodes)

/**
 * ### {@link isSpecificStatusCode `http.Status.is`}
 *
 * A variadic function that takes one, or any number of {@link AnyStatusCode `http.Status`} codes, and
 * returns a type-guard that narrows its argument to be that _particular_ status code, or
 * _one of those particular_ status codes (respectively).
 */
const isSpecificStatusCode: {
  <Status extends AnyStatusCode>(status: Status): (u: unknown) => u is Status
  <Status extends AnyStatusCode>(...statuses: readonly Status[]): (u: unknown) => u is Status
} = core.is.literally

/**
 * ### {@link hasAnyStatusCode `http.Status.hasAny`}
 *
 * A type-guard that narrows its argument to be an object with a `"status"` property whose value
 * is a member of the set of {@link AnyStatusCode `http.Status`} codes.
 */
const hasAnyStatusCode: (u: unknown) => u is globalThis.Record<"status", AnyStatusCode> = tree.has(
  "status",
  isAnyStatusCode,
)

/**
 * ### {@link hasSpecificStatusCode `http.Status.has`}
 *
 * A vardiadic function that takes one, or any number an {@link AnyStatusCode `http.Status`} codes,
 * and returns a type-guard that narrows its argument to be an object with a `"status"` property
 * whose value is that _particular_ status code, or _one of those particular_ status codes (respectively).
 */
const hasSpecificStatusCode: {
  <Status extends AnyStatusCode>(status: Status): (u: unknown) => u is globalThis.Record<"status", Status>
  <Status extends AnyStatusCode>(
    ...statuses: readonly Status[]
  ): (u: unknown) => u is globalThis.Record<"status", Status>
} = fn.flow(isSpecificStatusCode, (guard) => tree.has("status", guard))
