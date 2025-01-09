export { 
  integer_ as integer,
  number_ as number,
  string_ as string,
}

type integer_ = { -readonly [K in keyof typeof integer_]: typeof integer_[K]  }
namespace integer_ {
  /**
   * ## {@link int32 `KnownFormat.integer_.int32`}
   * Signed 32-bit integers (commonly used integer type).
   */
  export const int32 = "int32" as const
  export type int32 = typeof integer_.int32
  /////
  /**
   * ## {@link int64 `KnownFormat.integer_.int64`}
   * Signed 64-bit integers (long type).
   */
  export const int64 = "int64" as const
  export type int64 = typeof integer_.int64
}

type number_ = { -readonly [K in keyof typeof number_]: typeof number_[K] }
namespace number_ {
  /**
   * ### {@link number_.float `KnownFormat.number.float`}
   * Floating-point numbers.
   */
  export const float = "float" as const
  export type float = typeof number_.float
  /////
  /**
   * ### {@link number_.double `KnownFormat.number.double`}
   * Floating-point numbers with double precision.
   */
  export const double = "double" as const
  export type double = typeof number_.double
}

type string_ = { -readonly [K in keyof typeof string_]: typeof string_[K]  }
namespace string_ {
  /**
   * ### {@link date `KnownFormat.string.date`} 
   * As specified by ISO-8601 in
   * [RFC-3339 section 5.6](https://datatracker.ietf.org/doc/html/rfc3339#section-5.6)
   * @example
   * 2018-11-13
   */
  export const date = "date" as const
  export type date = typeof string_.date
  /////
  /** 
   * ### {@link datetime `KnownFormat.string.datetime`} 
   * As specified by ISO-8601 in
   * [RFC-3339 section 5.6](https://datatracker.ietf.org/doc/html/rfc3339#section-5.6)
   * @example
   * 2025-01-07T20:20:39+00:00
   */
  export const datetime = "date-time" as const
  export type datetime = typeof string_.datetime
  /////
  /**
   * ### {@link duration `KnownFormat.string.duration`} 
   * Semantics should satisfy the ABNR grammar specified in
   * [RFC-3339, appendix A](https://datatracker.ietf.org/doc/html/rfc3339#appendix-A)
   * @example
   * P3D // 3 days
   */
  export const duration = "duration" as const
  export type duration = typeof string_.duration
  /////
  /**
   * ### {@link email `KnownFormat.string.email`}
   * As specified by 
   * [RFC-5321, section 4.1.2](https://datatracker.ietf.org/doc/html/rfc5321#section-4.1.2)
   */
  export const email = "email" as const
  export type email = typeof string_.email
  /////
  /**
   * ### {@link emoji `KnownFormat.string.emoji`}
   */
  export const emoji = "emoji" as const
  export type emoji = typeof string_.emoji
  /////
  /**
   * ### {@link hostname `KnownFormat.string.hostname`}
   * As specified by 
   * [RFC-1123, section 2.1](https://datatracker.ietf.org/doc/html/rfc1123#section-2.1)
   */
  export const hostname = "hostname" as const
  export type hostname = typeof string_.hostname
  /////
  /**
   * ### {@link idn_hostname `KnownFormat.string.idn_hostname`}
   * As specified by 
   * [RFC-5890 section 2.3.2.3](https://datatracker.ietf.org/doc/html/rfc5890#section-2.3.2.3)
   */
  export const idn_hostname = "idn-hostname" as const
  export type idn_hostname = typeof string_.idn_hostname
  /////
  /**
   * ### {@link idn_email `KnownFormat.string.idn_email`}
   * Internationalized form of an email address, as specified by 
   * [RFC-6531](https://datatracker.ietf.org/doc/html/rfc6531)
   */
  export const idn_email = "idn-email" as const
  export type idn_email = typeof string_.idn_email
  /////
  /** 
   * ### {@link ipv4 `KnownFormat.string.ipv4`} 
   * Specified by [RFC-2373 section 3.2](https://datatracker.ietf.org/doc/html/rfc2373#section-3.2)
   */
  export const ipv4 = "ipv4" as const
  export type ipv4 = typeof string_.ipv4
  /////
  /** 
   * ### {@link ipv6 `KnownFormat.string.ipv6`} 
   * Specified by [RFC-2373 section 2.2](https://datatracker.ietf.org/doc/html/rfc2373#section-2.2)
   */
  export const ipv6 = "ipv6" as const
  export type ipv6 = typeof string_.ipv6
  /////
  /** 
   * ### {@link iri `KnownFormat.string.iri`} 
   * Specified by [RFC-3987](https://datatracker.ietf.org/doc/html/rfc3987)
   */
  export const iri = "iri" as const
  export type iri = typeof string_.iri
  /////
  /** 
   * ### {@link iri_reference `KnownFormat.string.iri_reference`} 
   * Specified by [RFC-3987](https://datatracker.ietf.org/doc/html/rfc3987)
   */
  export const iri_reference = "iri-reference" as const
  export type iri_reference = typeof string_.iri_reference
  /////
  /**
   * ### {@link json_pointer `KnownFormat.string.json_pointer`} 
   * As specified by [RFC-6901](https://datatracker.ietf.org/doc/html/rfc6901)
   */
  export const json_pointer = "json-pointer" as const
  export type json_pointer = typeof string_.json_pointer
  /////
  /**
   * ### {@link password `KnownFormat.string.password`}
   * Intended to be used as a hint for redaction tooling.
   */
  export const password = "password" as const
  export type password = typeof string_.password
  /////
  /**
   * ### {@link regex `KnownFormat.string.regex`}
   * As specified by [ECMA-262](https://tc39.es/ecma262/#sec-lexical-and-regexp-grammars)
   */
  export const regex = "regex" as const
  export type regex = typeof string_.regex
  /////
  /**
   * ### {@link relative_json_pointer `KnownFormat.string.relative_json_pointer`} 
   * As specified by the 
   * [RFC (draft form)](https://datatracker.ietf.org/doc/html/draft-handrews-relative-json-pointer-01)
   */
  export const relative_json_pointer = "relative-json-pointer" as const
  export type relative_json_pointer = typeof string_.relative_json_pointer
  /////
  /**
   * ### {@link time `KnownFormat.string.time`} 
   * As specified by ISO-8601 in
   * [RFC-3339, appendix A](https://datatracker.ietf.org/doc/html/rfc3339#appendix-A)
   * @example
   * 20:20:39+00:00
   */
  export const time = "time"
  export type time = typeof string_.time
  /////
  /**
   * ### {@link ulid `KnownFormat.string.ulid`} 
   * An elegant, univerally unique identifier optimized for sortability and readability.
   * Implementations must satisfy the [spec](https://github.com/ulid/spec)
   */
  export const ulid = "ulid" as const
  export type ulid = typeof string_.ulid
  /////
  /**
   * ### {@link uri `KnownFormat.string.uri`} 
   * As specified by [RFC-3986](https://datatracker.ietf.org/doc/html/rfc3986)
   */
  export const uri = "uri" as const
  export type uri = typeof string_.uri
  /////
  /**
   * ### {@link uri_reference `KnownFormat.string.uri_reference`} 
   * As specified by [RFC-3986 section 4.1](https://datatracker.ietf.org/doc/html/rfc3986#section-4.1)
   */
  export const uri_reference = "uri-reference" as const
  export type uri_reference = typeof string_.uri_reference
  /////
  /**
   * ### {@link uri_template `KnownFormat.string.uri_template`} 
   * As specified by [RFC-6570](https://datatracker.ietf.org/doc/html/rfc6570)
   */
  export const uri_template = "uri-template" as const
  export type uri_template = typeof string_.uri_template
  /////
  /**
   * ### {@link uuid `KnownFormat.string.uuid`}
   * As specified by [RFC-4122](https://datatracker.ietf.org/doc/html/rfc4122)
   */
  export const uuid = "uuid" as const
  export type uuid = typeof string_.uuid
}



