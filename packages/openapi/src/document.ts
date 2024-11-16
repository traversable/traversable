import { core, fc, zip } from "@traversable/core"
import { array, fn, map, object, string } from "@traversable/data"
import { http } from "@traversable/http"
import type { newtype } from "any-ts"

import { parameter } from "./parameter.js"
import { mapRef, reffer } from "./reffer.js"
import { BooleanNode, ExternalDocumentation, IntegerNode, NumberNode, Schema, StringNode } from "./schema.js"
import { type Arbitrary, applyConstraints, defaults, lit } from "./types.js"

//
// - TODO: handle
//
//   - [x] nested refs
//   - [ ] contain circular refs
//

/** @internal */
type inline<T> = T

export const PATTERN = {
  BearerCaseInsensitive: /^[Bb][Ee][Aa][Rr][Ee][Rr]$/,
  NonemptyAlphaNumericWithDelimiters: /^[a-zA-Z0-9\.\-_]+$/,
  Identifier: /^[$_a-zA-Z][$_a-zA-Z0-9]*$/,
  PrefixedByForwardSlash: /^\/[a-zA-Z0-9_\$]+$/g,
  StatusCode: /^[1-5][0-9][0-9]$/,
  StatusCodeNonInfo: /^[2-5][0-9][0-9]$/,
} as const

// {
//   export namespace is {
//     export const request = (u: openapi.request | openapi.$ref): u is openapi.request => !("$ref" in u)
//   }
// }

export function openapi() {}
openapi.is = {
  request: (u: openapi.requestBody): u is openapi.request => !("$ref" in u),
}

export declare namespace openapi {
  const document: document.meta & {
    openapi: "3.0.1"
    schemas: openapi.schemas
    paths: { ["/api/v1/example/{id}"]?: openapi.pathitem } & {
      [path: string]: {
        // TODO: add TRACE, HEAD, etc.
        [http.Verb.enum.get]?: openapi.operation
        [http.Verb.enum.post]?: openapi.operation
        [http.Verb.enum.put]?: openapi.operation
        [http.Verb.enum.delete]?: openapi.operation
        [http.Verb.enum.patch]?: {
          parameters?: readonly openapi.parameter[]
          responses?: {
            [200]?: openapi.response
            [500]?: openapi.response
          } & {
            /**
             * ### [HTTP status code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)
             */
            [status: number]: {
              content?: {
                [http.MediaType.enum.applicationJSON]?: openapi.mediatype
                [http.MediaType.enum.applicationFormURLEncoded]?: openapi.mediatype
                [http.MediaType.enum.applicationOctetStream]?: openapi.mediatype
                [http.MediaType.enum.applicationXML]?: openapi.mediatype
                [http.MediaType.enum.imageGIF]?: openapi.mediatype
                [http.MediaType.enum.imageJPEG]?: openapi.mediatype
                [http.MediaType.enum.imagePNG]?: openapi.mediatype
                [http.MediaType.enum.multipartFormData]?: openapi.mediatype
                [http.MediaType.enum.textCSV]?: openapi.mediatype
                [http.MediaType.enum.textHTML]?: openapi.mediatype
                [http.MediaType.enum.textPlain]?: openapi.mediatype
                [http.MediaType.enum.textXML]?: openapi.mediatype
              }
              headers?: openapi.headers
            }
          }
        }
      }
    }
  }

  namespace meta {
    interface server {}
    interface contact {}
    interface externalDocs {}
    interface license {}
    interface servers extends inline<readonly openapi.meta.server[]> {}
    interface reqs {}
    interface security extends inline<readonly openapi.meta.reqs[]> {}
    interface callbacks {}
    interface tag {}
    interface tags extends inline<readonly openapi.meta.tag[]> {}
    interface example {}
    interface examples extends inline<{ [name: string]: openapi.meta.example }> {}
    interface info {
      title: string
      version: string
      description?: string
      termsOfService?: string
      contact?: openapi.meta.contact
      license?: openapi.meta.license
    }
  }

  interface document extends document.meta {
    openapi: string
    paths: openapi.paths
    components?: openapi.components
  }
  namespace document {
    interface meta {
      info: openapi.meta.info
      servers?: openapi.meta.servers
      security?: openapi.meta.security
      tags?: openapi.meta.tags
      externalDocs?: openapi.meta.externalDocs
    }
  }

  interface components {
    schemas?: schemas
  }
  interface paths extends inline<{ [path: string]: openapi.pathitem }> {}
  interface $ref<T extends string = string> {
    $ref?: T
  }
  interface pathitem extends pathitem.meta, pathitem.verbs {}

  namespace pathitem {
    /** TODO: implement trace, head, options */
    interface verbs {
      [http.Verb.enum.get]?: openapi.operation
      [http.Verb.enum.get]?: openapi.operation
      [http.Verb.enum.post]?: openapi.operation
      [http.Verb.enum.put]?: openapi.operation
      [http.Verb.enum.delete]?: openapi.operation
      [http.Verb.enum.patch]?: openapi.operation
    }
    interface meta {
      servers?: openapi.meta.servers
      $ref?: string
      summary?: string
      description?: string
      parameters?: openapi.parameters
    }
  }

  interface operation extends operation.meta {
    responses: openapi.responses
    parameters?: openapi.parameters
    requestBody?: openapi.requestBody
  }

  namespace operation {
    interface meta
      extends globalThis.Partial<{
        tags?: string[]
        summary?: string
        description?: string
        operationId?: string
        externalDocs?: openapi.meta.externalDocs
        callbacks?: openapi.meta.callbacks
        deprecated?: boolean
        security?: openapi.meta.security
        servers?: openapi.meta.servers
      }> {}
  }

  type requestBody = openapi.request
  // | openapi.$ref
  interface request {
    description?: string
    required?: boolean
    content?: openapi.content
  }

  interface schemas {
    [x: string]: Schema.any
  }
  interface parameters extends inline<readonly openapi.parameter[]> {}

  interface response {
    content?: openapi.content
    headers?: openapi.headers
  }
  interface responses
    extends inline<{ [x: `1${number}`]: openapi.response }>,
      inline<{ [x: `2${number}`]: openapi.response }>,
      inline<{ [x: `3${number}`]: openapi.response }>,
      inline<{ [x: `4${number}`]: openapi.response }>,
      inline<{ [x: `5${number}`]: openapi.response }> {}

  interface content {
    [http.MediaType.enum.applicationJSON]?: openapi.mediatype
    [http.MediaType.enum.applicationFormURLEncoded]?: openapi.mediatype
    [http.MediaType.enum.applicationOctetStream]?: openapi.mediatype
    [http.MediaType.enum.applicationXML]?: openapi.mediatype
    [http.MediaType.enum.applicationJavascript]?: openapi.mediatype
    [http.MediaType.enum.imageGIF]?: openapi.mediatype
    [http.MediaType.enum.imageJPEG]?: openapi.mediatype
    [http.MediaType.enum.imagePNG]?: openapi.mediatype
    [http.MediaType.enum.multipartFormData]?: openapi.mediatype
    [http.MediaType.enum.textCSV]?: openapi.mediatype
    [http.MediaType.enum.textHTML]?: openapi.mediatype
    [http.MediaType.enum.textPlain]?: openapi.mediatype
    [http.MediaType.enum.textXML]?: openapi.mediatype
  }

  type header = openapi.header.any
  // | openapi.$ref
  interface headers extends inline<{ [name: string]: openapi.header }> {}
  namespace header {
    export { header_any as any }
    export interface header_any {}
  }

  interface mediatype<T = unknown> {
    schema?: Schema.any // | openapi.$ref
    examples?: openapi.meta.examples
    example?: T
    encoding?: openapi.encoding
  }

  interface encoding {
    contentType?: string
    headers?: openapi.headers
    style?: string
    explode?: boolean
    allowReserved?: boolean
  }
}
export declare namespace openapi {
  export { parameter }
}

export declare namespace arbitrary {
  interface Countable {
    maxCount?: number
    minCount?: number
  }
  interface Schemas extends arbitrary.Countable {}
  interface Paths extends arbitrary.Countable {}
  interface PathParams extends arbitrary.Countable {}
  interface PathSegments extends arbitrary.Countable {}
  interface Request extends arbitrary.Countable {}
  interface Responses extends arbitrary.Countable {
    maxContentTypeCount?: number
    minContentTypeCount?: number
  }
  interface Include {
    example?: boolean
    examples?: boolean
    description?: boolean
    const?: boolean
  }
  interface Constraints {
    include?: arbitrary.Include
    schemas?: arbitrary.Schemas
    paths?: arbitrary.Paths
    pathParams?: arbitrary.PathParams
    pathSegments?: arbitrary.PathSegments
    responses?: arbitrary.Responses
  }
}

/**
 * ## {@link arbitrary `openapi.arbitrary`}
 *
 * {@link arbitrary `openapi.arbitrary`} is the primary export of this module. It implements a
 * `fast-check` arbitrary that knows how to generate an arbitrary,
 * [_pseudo-random_](https://en.wikipedia.org/wiki/Pseudorandomness) **OpenAPI document**.
 *
 * @example
 * import * as fc from "fast-check"
 * import { arbitrary } from "@traversable/openapi"
 *
 * const oneHundredOpenAPISpecs = fc.sample(oas.arbitrary, 100)
 */
export function arbitrary(constraints?: arbitrary.Constraints): fc.Arbitrary<openapi.document>
export function arbitrary(_: arbitrary.Constraints = defaults): fc.Arbitrary<{}> {
  const constraints = applyConstraints(_)
  return fc
    .record(
      {
        openapi: fc.constantFrom("3.0.1"),
        components: components(constraints),
        paths: paths(constraints),
        info: Info,
      },
      {
        requiredKeys: ["components", "paths", "openapi"],
      },
    )
    .map(({ components: { schemas, ...component }, paths, ...doc }) => {
      // const mapped = mapRef(schemas, { path: ["#", "components", "schemas"] })

      // reffer()
      // map(
      //   (schema, k) => fn.pipe(
      //     schema,
      //     // (s) => reffer(s, { path: [`#/${k}`] }),
      //     // (s) => reffer(s, { path: [`#/definitions/${k}`] }),
      //   )
      // ),
      // object.entries,
      // array.reduce(
      //   (acc, [k, schema]) => ({
      //     ...acc,
      //     // ...definitions,
      //     [k]: schema,
      //   }),
      //   {} as { [x: string]: Schema.any },
      // ),
      // (_) => (console.log(JSON.stringify(_, null, 2)), _),

      return {
        ...doc,
        paths,
        components: {
          ...component,
          schemas,
        },
      }
    })
}

export const StatusCode = fc.stringMatching(PATTERN.StatusCode)
export const StatusCodeNonInfo = fc.stringMatching(PATTERN.StatusCodeNonInfo)

///////////
/// REF
// export namespace Ref {
//   export type declare<T extends Ref.typedef = Ref.typedef> = T
//   export interface typedef extends Arbitrary.infer<typeof Ref.typedef>, inline<{ [x: string]: never }> {}
//   export const typedef = fc.record({}, {})
// }
/// REF
///////////

namespace Auth {
  /**
   * ### {@link ApiKeySecurityScheme `oas.ApiKeySecurityScheme`}
   */
  export const ApiKeySecurityScheme = fc.record(
    {
      type: fc.constant("apiKey"),
      name: fc.string(),
      in: fc.constantFrom("header", "query", "cookie"),
      description: fc.lorem(),
    },
    { requiredKeys: ["type", "name", "in"] },
  )

  /**
   * ### {@link BearerHttpSecurityScheme `oas.BearerHttpSecurityScheme`}
   */
  export const BearerHttpSecurityScheme = fc.record(
    {
      type: fc.constant(lit("http")),
      scheme: fc.stringMatching(PATTERN.BearerCaseInsensitive),
      bearerFormat: fc.string(),
      description: fc.lorem(),
      in: fc.constantFrom(lit("header"), lit("query"), lit("cookie")),
    },
    { requiredKeys: ["scheme", "type", "bearerFormat"] },
  )

  /**
   * ### {@link NonBearerHttpSecurityScheme `oas.NonBearerHttpSecuritySchema`}
   */
  export const NonBearerHttpSecurityScheme = fc.record(
    {
      type: fc.constant(lit("http")),
      description: fc.lorem(),
      in: fc.constantFrom(lit("header"), lit("query"), lit("cookie")),
    },
    { requiredKeys: ["type"] },
  )

  /**
   * ### {@link HttpSecuritySchema `oas.HttpSecuritySchema`}
   */
  export const HttpSecurityScheme = fc.oneof(BearerHttpSecurityScheme, NonBearerHttpSecurityScheme)

  /**
   * ### {@link ImplicitOAuthFlow `oas.ImplicitOAuthFlow`}
   */
  export const ImplicitOAuthFlow = fc.record(
    {
      authorizationUrl: fc.string(), // format: "uri-reference"
      refreshUrl: fc.string(), // format: "uri-reference"
      scopes: fc.dictionary(fc.string(), fc.string()),
    },
    {
      requiredKeys: ["authorizationUrl", "scopes"],
    },
  )

  /**
   * ### {@link ClientCredentialsFlow `oas.ClientCredentialsFlow`}
   */
  export const ClientCredentialsFlow = fc.record(
    {
      tokenUrl: fc.string(), // format: "uri-reference"
      refreshUrl: fc.string(), // format: "uri-reference"
      scopes: fc.dictionary(fc.string(), fc.string()),
    },
    { requiredKeys: ["tokenUrl", "scopes"] },
  )

  /**
   * ### {@link AuthorizationCodeOAuthFlow `oas.AuthorizationCodeOAuthFlow`}
   */
  export const AuthorizationCodeOAuthFlow = fc.record(
    {
      authorizationUrl: fc.string(), // format: "uri-reference"
      tokenUrl: fc.string(), // format: "uri-reference"
      refreshUrl: fc.string(), // format: "uri-reference"
      scopes: fc.dictionary(fc.string(), fc.string()),
    },
    { requiredKeys: ["authorizationUrl", "tokenUrl", "scopes"] },
  )

  /**
   * ### {@link PasswordOAuthFlow `oas.PasswordOAuthFlow`}
   */
  export const PasswordOAuthFlow = fc.record(
    {
      tokenUrl: fc.string(), // format: "uri-reference"
      refreshUrl: fc.string(), // format: "uri-reference"
      scopes: fc.dictionary(fc.string(), fc.string()),
    },
    { requiredKeys: ["tokenUrl", "scopes"] },
  )

  /**
   * ### {@link OAuthFlows `oas.OAuthFlows`}
   */
  export const OAuthFlows = fc.record(
    {
      implicit: ImplicitOAuthFlow,
      password: PasswordOAuthFlow,
      clientCredentials: ClientCredentialsFlow,
      authorizationCode: AuthorizationCodeOAuthFlow,
    },
    { requiredKeys: [] },
  )

  /**
   * ### {@link OAuth2SecurityScheme `oas.OAuth2SecurityScheme`}
   */
  export const OAuth2SecurityScheme = fc.record(
    {
      type: fc.constant(lit("oauth2")),
      flows: OAuthFlows,
      description: fc.lorem(),
    },
    { requiredKeys: ["type", "flows"] },
  )

  /**
   * ### {@link OpenIdConnectSecurityScheme `oas.OpenIdConnectSecurityScheme`}
   */
  export const OpenIdConnectSecurityScheme = fc.record(
    {
      type: fc.constant(lit("openIdConnectUrl")),
      description: fc.lorem(),
      openIdConnectUrl: fc.string(), // format: "uri-reference"
    },
    { requiredKeys: ["type", "openIdConnectUrl"] },
  )

  /**
   * ### {@link SecurityScheme `oas.SecurityScheme`}
   */
  export const SecurityScheme = fc.oneof(
    ApiKeySecurityScheme,
    HttpSecurityScheme,
    OAuth2SecurityScheme,
    OpenIdConnectSecurityScheme,
  )

  /**
   * ### {@link SecurityRequirement `oas.SecurityRequirement`}
   */
  export interface SecurityRequirement extends Arbitrary.infer<typeof SecurityRequirement> {}
  export const SecurityRequirement = fc.dictionary(fc.string(), fc.array(fc.string()))
}

///////////////
/// METADATA

/**
 * ### {@link Contact `oas.Contact`}
 */
export interface Contact extends Arbitrary.infer<typeof Contact> {}
export const Contact = fc.record(
  {
    name: fc.string(),
    url: fc.string(),
    email: fc.emailAddress(),
  },
  { requiredKeys: [] },
)

/**
 * ### {@link License `oas.License`}
 */
export interface License extends Arbitrary.infer<typeof License> {}
export const License = fc.record(
  {
    name: fc.string(),
    url: fc.string(), // format: "uri-reference"
  },
  { requiredKeys: ["name"] },
)

/**
 * ### {@link Info `oas.Info`}
 */
export interface Info extends Arbitrary.infer<typeof Info> {}
export const Info = fc.record(
  {
    title: fc.string(),
    description: fc.lorem(),
    termsOfService: fc.string(), // format: "uri-reference"
    contact: Contact,
    license: License,
    version: fc.string(),
  },
  { requiredKeys: ["title", "version"] },
)

/**
 * ### {@link ServerVariable `oas.ServerVariable`}
 */
export interface ServerVariable extends Arbitrary.infer<typeof ServerVariable> {}
export const ServerVariable = fc.record(
  {
    enum: fc.array(fc.string()),
    default: fc.string(),
    description: fc.lorem(),
  },
  { requiredKeys: ["default"] },
)

/**
 * ### {@link Server `oas.Server`}
 */
export interface Server extends Arbitrary.infer<typeof Server> {}
export const Server = fc.record(
  {
    url: fc.string(),
    description: fc.lorem(),
    variables: ServerVariable,
  },
  { requiredKeys: ["url"] },
)
/// METADATA
///////////////

/** ### {@link tag `oas.tag`} */
export const tag = fc.record(
  {
    name: fc.string(),
    description: fc.lorem(),
    externalDocs: ExternalDocumentation(),
  },
  { requiredKeys: ["name"] },
)

/** ### {@link example `oas.example`} */
export const example = fc.record(
  {
    summary: fc.string(),
    description: fc.lorem(),
    value: fc.object(),
    externalValue: fc.string(), // format: "uri-reference"
  },
  { requiredKeys: [] },
)

const examples = fc.dictionary(fc.string(), example)

/** ### {@link Link `oas.Link`} */
export namespace Link {
  /** ### {@link Link.Shape `oas.Link`} */
  export interface Shape {
    parameters: { [x: string]: unknown }
    requestBody: {}
    server: Server
  }
  /** ### {@link Link.shape `oas.Link.shape`} */
  export const shape = {
    parameters: fc.dictionary(fc.string(), fc.object()),
    requestBody: fc.object(),
    server: Server,
  } satisfies Arbitrary.map<Link.Shape>
  /** ### {@link Link.withOperationId `oas.Link.withOperationId`} */
  export const withOperationId = fc.record(
    {
      ...Link.shape,
      operationId: fc.string(),
    },
    { requiredKeys: [] },
  )
  /** ### {@link Link.withOperationRef `oas.Link.withOperationRef`} */
  export const withOperationRef = fc.record(
    {
      ...Link.shape,
      operationRef: fc.string(), // format: "uri-reference"
    },
    { requiredKeys: [] },
  )
  /** ### {@link Link.typedef `oas.Link.typedef`} */
  export const typedef = fc.oneof(Link.withOperationId, Link.withOperationRef)
}

/** ### {@link Encoding `oas.Encoding`} */
export interface Encoding extends Arbitrary.infer<typeof Encoding> {}
/** ### {@link Encoding `oas.Encoding`} */
export const Encoding = fc.record(
  {
    contentType: fc.string(),
    // TODO: CIRCULAR IF YOU UNCOMMENT `Header`
    // headers: fc.dictionary(fc.string(), fc.oneof(Ref.typedef /* , Header */ )),
    style: fc.constantFrom(lit("form"), lit("spaceDelimited"), lit("pipeDelimited"), lit("deepObject")),
    explode: fc.boolean(),
    allowReserved: fc.boolean(), // default: false
  },
  { requiredKeys: [] },
)

/** ### {@link mediatype `oas.mediatype`} */
export interface mediatype extends Arbitrary.infer<ReturnType<typeof mediatype>> {}
/** ### {@link mediatype `oas.mediatype`} */
export function mediatype(constraints?: mediatype.Constraints): fc.Arbitrary<openapi.mediatype>
export function mediatype(_: mediatype.Constraints = mediatype.defaults) {
  const constraints = {
    ...applyConstraints(_),
    schema: _.schema,
  }
  return fc.record(
    {
      schema: constraints.schema ?? mediatype.defaults.schema, // fc.oneof(Ref.typedef, Schema.any),
      ...(constraints?.include?.description && { description: fc.lorem() }),
      ...(constraints?.include?.examples && {
        examples: fc.dictionary(fc.jsonValue().filter(core.is.notNull)),
      }),
      // encoding: fc.dictionary(fc.string(), Encoding),
      // TODO: `Mediatype` is disjoint on `example` and `examples` IRL
      // const ExampleXORExamples = fc.oneof(Example, Finite.Examples)
      // ...(constraints?.includeExamples && { example: fc.oneof(fc.jsonValue()) }),
      // ...(
      //   constraints?.includeExamples
      //   && { examples: fc.jsonValue() } // fc.dictionary(fc.string(), Example) }
      //   // && { examples: fc.dictionary(fc.string(), fc.oneof(Ref.typedef, Example)) }
      // ),
    },
    { requiredKeys: ["schema"] },
  ) satisfies fc.Arbitrary<openapi.mediatype>
}

export declare namespace mediatype {
  interface Constraint {
    schema?: fc.Arbitrary<Schema.any>
  }
  interface Constraints extends arbitrary.Constraints, mediatype.Constraint {}
}
export namespace mediatype {
  export const defaults = {
    schema: Schema.any(),
  } satisfies Required<mediatype.Constraint>
}

export interface mediatypes extends Partial<{ [K in http.MediaType]: mediatype }> {}

export function mediatypes(constraints?: mediatypes.Constraints): fc.Arbitrary<mediatypes>
export function mediatypes(_: mediatypes.Constraints = {}): fc.Arbitrary<mediatypes> {
  const constraints = applyConstraints(_)
  return fc
    .uniqueArray(
      fc.tuple(
        fc.constantFrom(http.MediaType.enum.applicationJSON, ...http.MediaType.all.slice(1)),
        mediatype(constraints),
      ),
      {
        selector: ([key]) => key,
        minLength: 1,
        maxLength: constraints?.responses?.maxContentTypeCount ?? defaults.responses.maxContentTypeCount,
      },
    )
    .map(globalThis.Object.fromEntries)
}

export declare namespace mediatypes {
  interface Constraint extends mediatype.Constraint {}
  interface Constraints extends mediatypes.Constraint, arbitrary.Constraints {}
}

/** ### {@link Header `oas.Header`} */
export namespace Header {
  /** ### {@link Header.shape `oas.Header.shape`} */
  export const shape = {
    description: fc.lorem(),
    style: fc.constant(lit("simple")),
    explode: fc.boolean(),
    required: fc.boolean(), // default: false
    deprecated: fc.boolean(), // default: false
    allowEmptyValue: fc.boolean(), // default: false
    allowReserved: fc.boolean(), // default: false
  } as const
  /** ### {@link Header.withSchema `oas.Header.withSchema`} */
  export const withSchema = fc.record(
    {
      ...Header.shape,
      schema: Schema.any(),
      // schema: fc.oneof(Ref.typedef, Schema.any),
    },
    { requiredKeys: [] },
  )
  /** ### {@link Header.withContent `oas.Header.withContent`} */
  export const withContent = fc.record(
    {
      ...Header.shape,
      content: fc.dictionary(fc.constantFrom(...http.MediaType.all), mediatype(), { maxKeys: 1, minKeys: 1 }),
    },
    { requiredKeys: [] },
  )
  /** ### {@link Header.typedef `oas.Header.typedef`} */
  export const typedef = fc.oneof(Header.withContent, Header.withSchema)
}

/** ### {@link response `oas.Response`} */
export interface response extends Arbitrary.infer<ReturnType<typeof response>> {}
/** ### {@link response `oas.Response`} */
export function response(constraints?: arbitrary.Constraints) {
  return fc.record({
    content: mediatypes({
      ...constraints,
      schema: Schema.object,
    }),
    // Note: this field is required (not configurable)
    description: fc.lorem(),
  })
}

// description: fc.string(),
// headers: fc.dictionary(fc.identifier(), fc.oneof(Ref.typedef, Header.typedef)),
// content: fc.dictionary(fc.constantFrom(...http.MediaType.all), MediaType(constraints), { maxKeys: 1, minKeys: 1 }),
// links: fc.dictionary(fc.string(), fc.oneof(Ref.typedef, Link.typedef)),
// }, { requiredKeys: ["description"] })

/** ### {@link request `oas.request`} */
export function request(constraints?: arbitrary.Constraints): fc.Arbitrary<openapi.request>
export function request(constraints?: arbitrary.Constraints) {
  return fc.record(
    {
      content: fc.dictionary(
        fc.constantFrom(...http.MediaType.all),
        mediatype({ ...constraints, schema: Schema.any() }),
      ),
      required: fc.boolean(),
      ...(constraints?.include?.description && { description: fc.string() }),
    },
    { requiredKeys: ["content"] },
  ) satisfies fc.Arbitrary<openapi.request>
}

export function requestBody(constraints?: arbitrary.Constraints): fc.Arbitrary<openapi.requestBody>
export function requestBody(_?: arbitrary.Constraints): fc.Arbitrary<openapi.request> {
  const constraints = applyConstraints(_)
  return fc.oneof(
    request(constraints),
    // Ref(constraints),
  )
}

// /** @internal */
// const uniquenessSelector
//   // : (p: Ref.typedef | Parameter.typedef) => string
//   : (p: {}) => string
//   = (p) => is.ref(p) ? p.$ref
//   : core.has("name", core.is.string)(p) ? p.name
//   : globalThis.String(p) // fn.throw(p)

// /** ### {@link Parameter.typedef `oas.Parameter.typedef`} */
// export interface typedef extends Arbitrary.infer<ReturnType<typeof Parameter.typedef>> {}
// /** ### {@link Parameter.typedef `oas.Parameter.typedef`} */
// export const typedef = (constraints?: Parameter.Constraints) => fc.record({
//   name: fc.string(),
//   in: fc.string(),
//   deprecated: fc.boolean(),                                      // default: false
//   allowEmptyValue: fc.boolean(),                                 // default: false
//   allowReserved: fc.boolean(),                                   // default: false
//   description: fc.string(),
//   required: fc.string(),
//   style: fc.string(),
//   explode: fc.boolean(),
//   schema: fc.oneof(Ref.typedef, Schema.any),
//   content: fc.dictionary(fc.constantFrom(...http.MediaType.all), MediaType(constraints), { maxKeys: 1, minKeys: 1 }),
//   /// constrain-able
//   ...(constraints?.includeExamples && { example: fc.object() }),
//   ...(
//     constraints?.includeExamples
//     && { examples: fc.dictionary(fc.string(), fc.oneof(Ref.typedef, Example)) }
//   ),
// }, { requiredKeys: ["name", "in"] })

// export interface Responses { [x: string]: Response }

/** ### {@link responses `oas.responses`} */
export function responses(constraints?: arbitrary.Constraints): fc.Arbitrary<openapi.responses>
export function responses(constraints: arbitrary.Constraints = {}): fc.Arbitrary<{}> {
  return fc
    .tuple(
      fc.tuple(StatusCodeNonInfo, response(constraints)),
      fc.array(fc.tuple(StatusCode, response(constraints)), {
        minLength: globalThis.Math.max(
          0,
          (constraints.responses?.minCount ?? defaults.responses.minCount) - 1,
        ),
        maxLength: globalThis.Math.max(
          0,
          (constraints.responses?.maxCount ?? defaults.responses.maxCount) - 1,
        ),
      }),
    )
    .map(fn.flow(([head, tail]) => [head, ...tail], object.fromEntries))
}

/** ### {@link parameters `oas.parameters`} */
export function parameters(constraints: parameters.Constraints): fc.Arbitrary<readonly openapi.parameter[]>
export function parameters(constraints: parameters.Constraints): fc.Arbitrary<readonly openapi.parameter[]> {
  return fc
    .tuple(
      fc.uniqueArray(parameter.any(constraints), { selector: (p) => p.name }),
      fc
        .array(parameter.path(constraints), {
          minLength: constraints.params.length,
          maxLength: constraints.params.length,
        })
        .map((ps) =>
          ps.map((p, ix) => ({
            name: constraints.params[ix],
            ...p,
          })),
        ),
    )
    .map(([params, pathParams]) => [
      ...pathParams,
      ...params.filter((p) => !pathParams.map((p) => p.name).includes(p.name)),
    ])
}
export declare namespace parameters {
  export interface Constraints extends operation.Constraints {}
}

/** ### {@link operation `oas.operation`} */
export function operation(constraints: operation.Constraints): fc.Arbitrary<openapi.operation>
export function operation(_: operation.Constraints) {
  const constraints = {
    ...applyConstraints(_),
    params: _.params,
    method: _.method,
  }
  return fc.record(
    {
      // no body on GET, HEAD or DELETE requests
      // see https://datatracker.ietf.org/doc/html/rfc7231#section-4.3
      responses: responses(constraints),
      parameters: parameters(constraints),
      ...(!["get", "delete", "head"].includes(constraints.method.toLowerCase()) && {
        requestBody: requestBody(constraints),
      }),
      ...(constraints.include.description && { description: fc.lorem() }),
    },
    {
      requiredKeys: ["responses", "parameters"],
    },
  ) satisfies fc.Arbitrary<openapi.operation>
}

export declare namespace operation {
  interface Constraints extends arbitrary.Constraints {
    method: http.Verb
    params: readonly string[]
  }
}

/** ### {@link pathitem `oas.pathitem`} */
export function pathitem(constraints: pathitem.Constraints): fc.Arbitrary<openapi.pathitem>
export function pathitem(_: pathitem.Constraints): fc.Arbitrary<{}> {
  const constraints = {
    ...applyConstraints(_),
    params: _.params,
  }
  return fc.record(
    {
      get: operation({ ...constraints, method: "get" }),
      put: operation({ ...constraints, method: "put" }),
      post: operation({ ...constraints, method: "post" }),
      // delete: operation({ ...constraints, method: "delete" }),
      // options: operation({ ...constraints }),
      // head: operation({ ...constraints }),
      // trace: operation({ ...constraints }),
    },
    { requiredKeys: [] },
  )
}

export declare namespace pathitem {
  interface Constraints extends arbitrary.Constraints {
    params: readonly string[]
  }
}

export interface pathname
  extends inline<{
    segments: string[]
    params: string[]
    path: string
  }> {}

/** ### {@link pathname `oas.pathname`} */
export function pathname(constraints?: arbitrary.Constraints): fc.Arbitrary<pathname>
export function pathname(_?: arbitrary.Constraints): fc.Arbitrary<pathname> {
  const constraints = applyConstraints(_)
  const segments = fc.uniqueArray(fc.alphanumeric(), {
    maxLength: constraints.pathSegments.maxCount,
    minLength: constraints.pathSegments.minCount,
  })
  const params = fc.uniqueArray(fc.alphanumeric(), {
    maxLength: constraints.pathSegments.maxCount,
    minLength: constraints.pathSegments.minCount,
  })
  return fc.tuple(segments, params).map(([segments, params]) => ({
    segments,
    params,
    path:
      "/" +
      zip
        .arrays(segments, params)
        .map(([s, p]) => (!p ? s : !s ? `{${p}}` : `${s}/{${p}}`))
        .join("/"),
  }))
}

/** ### {@link pathnames `oas.pathnames`} */
export function pathnames(constraints?: arbitrary.Constraints): fc.Arbitrary<readonly pathname[]>
export function pathnames(_?: arbitrary.Constraints): fc.Arbitrary<readonly pathname[]> {
  const constraints = applyConstraints(_)
  return fc.uniqueArray(pathname(constraints), {
    maxLength: constraints.pathParams.maxCount,
    minLength: constraints.pathParams.minCount,
    selector: (c) => c.path,
  })
}

/** ### {@link paths `oas.paths`} */
export function paths(constraints?: arbitrary.Constraints): fc.Arbitrary<openapi.paths>
export function paths(_?: arbitrary.Constraints): fc.Arbitrary<openapi.paths> {
  const constraints = applyConstraints(_)
  return pathnames(constraints).chain(
    // TODO: remove this chain, it breaks shrinking
    fn.flow(
      map(({ path, params }) => [path, pathitem({ ...constraints, params })] as const),
      globalThis.Object.fromEntries,
      fc.record,
    ),
  )
}

/** ### {@link components `oas.components`} */
export function components(constraints?: arbitrary.Constraints): fc.Arbitrary<openapi.components>
export function components(_?: arbitrary.Constraints): fc.Arbitrary<openapi.components> {
  const constraints = applyConstraints(_)
  return fc.record(
    {
      schemas: fc.dictionary(fc.alphanumeric(), Schema.any(constraints) as fc.Arbitrary<Schema.any>, {
        minKeys: constraints.schemas.minCount,
        maxKeys: constraints.schemas.maxCount,
      }),
      ...(constraints.include.examples && { examples }),
    },
    { requiredKeys: ["schemas"] },
  )
}

// /** ### {@link Components `oas.Components`} */
// export interface Components extends Arbitrary.infer<ReturnType<typeof components>> {}
// export interface Tag extends Arbitrary.infer<typeof tag> {}
// export interface Example extends Arbitrary.infer<typeof example> {}
