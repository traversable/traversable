import { object } from "@traversable/data"
import { KnownFormat } from "@traversable/registry"

/** 
 * ### {@link string `core.JsonSchema.Format.string`}
 * The set of 
 * [defined string formats](https://json-schema.org/draft/2020-12/draft-bhutton-json-schema-validation-00#rfc.section.7.3)
 * specified by JSON Schema 2020-12.
 */
const string = object.pick(
  KnownFormat.string,
  "date",
  "datetime",
  "duration",
  "email",
  "hostname",
  "idn_hostname",
  "idn_email",
  "ipv4",
  "ipv6",
  "iri_reference",
  "json_pointer",
  "regex",
  "relative_json_pointer",
  "time",
  "uri",
  "uri_reference",
  "uri_template",
  "uuid",
)

/** 
 * ## {@link Format `core.JsonSchema.Format`}
 * 
 * The set of 
 * [defined formats](https://json-schema.org/draft/2020-12/draft-bhutton-json-schema-validation-00#rfc.section.7.3)
 * specified by JSON Schema 2020-12, organized by data type.
 */
export const Format = {
  string,
}
