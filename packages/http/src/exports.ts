export * from "./version.js"
export * from "./toplevel.js"

/**
 * ## {@link Status `http.Status`}
 *
 * Alias for {@link Status.any `http.Status.any`}, {@link Status `http.Status`} is a type
 * alias representing the union of all HTTP status codes, as specified in
 * [RFC-9110](https://httpwg.org/specs/rfc9110.html).
 */
export type Status = import("./status.js").any
export * as Status from "./status.js"

/**
 * ## {@link MediaType `http.MediaType`}
 *
 * Alias for {@link MediaType.any `http.MediaType.any`}, {@link MediaType `http.MediaType`} is a type
 * alias representing the union of the most commonly recognize HTTP media types, as specified in
 * [RFC-6838](https://datatracker.ietf.org/doc/html/rfc6838).
 */
export type MediaType = import("./mediatype.js").any
export * as MediaType from "./mediatype.js"

/**
 * ## {@link Verb `http.Verb`}
 *
 * Alias for {@link Verb.any `http.Verb.any`}, {@link Verb `http.Verb`} is a type
 * alias representing the union of the HTTP methods that the codegen library currently
 * supports.
 */
export type Verb = import("./verb.js").any
export * as Verb from "./verb.js"

/**
 * ## {@link Method `http.Method`}
 *
 * Type alias for {@link Verb.any `http.Verb`}
 */
export type Method = import("./verb.js").any
