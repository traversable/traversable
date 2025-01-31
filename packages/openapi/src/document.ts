import { core, fc, tree, zip } from "@traversable/core"
import { fn, map, object } from "@traversable/data"
import { http } from "@traversable/http"
import { PATTERN } from "@traversable/registry"
import type {
  RequireN,
  Required,
  autocomplete,
  inline,
} from "@traversable/registry"


import { createDepthIdentifier } from "fast-check"
import * as N from "./normalize.js"
import { Schema } from "./schema/exports.js"
import type { $ref } from "./types.js"

/** @internal */
const predicate = tree.has("schemas", tree.has("type", core.is.string))
/** @internal */
const normalize = N.normalize(predicate)

export function openapi() {}

openapi.is = {
  request: (u: openapi.requestBody): u is openapi.request => !("$ref" in u),
}

const openapi_v3xx = "3.1.0"
const defaultInfo = {
  title: "",
  version: "0.0.0",
} satisfies doc["info"]

export function doc<const T extends doc>(specification: T): T
export function doc<T extends Partial<doc>>(specification: T): T & doc
export function doc({ info, openapi, paths, ...spec }: Partial<doc>): doc {
  return {
    openapi: openapi ?? openapi_v3xx,
    info: !info ? defaultInfo : {
      ...info,
      title: info.title ?? defaultInfo.title,
      version: info.version ?? defaultInfo.version,
    },
    paths: paths || {},
    components: { schemas: {} },
    ...spec,
  }
}


export interface doc extends doc.meta {
  openapi: autocomplete<typeof openapi_v3xx>
  paths: openapi.paths
  components: openapi.components
}
export declare namespace doc {
  export { $ref, doc as document }
  export interface meta {
    info: openapi.meta.info
    servers?: openapi.meta.servers
    security?: openapi.meta.security
    tags?: openapi.meta.tags
    externalDocs?: openapi.meta.externalDocs
  }
}

export declare namespace openapi {
  const doc: doc.meta & {
    openapi: "3.1.0"
    components: {
      schemas: openapi.schemas
    }
    paths:
      /**
       * __Path__ syntax specified by [RFC-3986](https://datatracker.ietf.org/doc/html/rfc3986#section-3)
       */
      & { ["/api/v2/example/{id}"]?: openapi.pathitem }
      & {
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
             * __Status__ specified by [RFC-7231](https://datatracker.ietf.org/doc/html/rfc7231#section-6)
             */
            [status: number]: {
              content?: {
                /**
                 * __Media type__ specified by [RFC-6838](https://datatracker.ietf.org/doc/html/rfc6838)
                 */
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
      title: string;
      version: string;
      description?: string;
      termsOfService?: string;
      contact?: openapi.meta.contact;
      license?: openapi.meta.license
    }
  }


  interface components { schemas: schemas }
  interface paths { [path: string]: openapi.pathitem }

  // interface pathitem extends
  //   pathitem.meta,
  //   pathitem.verbs {}
  type pathitem = pathitem.meta & pathitem.verbs

  namespace pathitem {
    /** TODO: implement trace, head, options */
    type verbs = {
      [http.Verb.enum.get]?: openapi.operation
      [http.Verb.enum.get]?: openapi.operation
      [http.Verb.enum.post]?: openapi.operation
      [http.Verb.enum.put]?: openapi.operation
      [http.Verb.enum.delete]?: openapi.operation
      [http.Verb.enum.patch]?: openapi.operation
    }
    interface meta {
      servers?: openapi.meta.servers
      $ref?: string;
      summary?: string;
      description?: string;
      parameters?: openapi.parameters
    }
  }

  interface operation extends operation.meta {
    responses: openapi.responses
    parameters?: openapi.parameters
    requestBody?: openapi.requestBody
  }

  namespace operation {
    interface meta extends globalThis.Partial<{
      tags?: string[]
      summary?: string
      description?: string
      operationId?: string;
      externalDocs?: openapi.meta.externalDocs
      callbacks?: openapi.meta.callbacks
      deprecated?: boolean
      security?: openapi.meta.security
      servers?: openapi.meta.servers
    }> {}
  }

  type requestBody =
    | openapi.request
    // | openapi.$ref
    ;
  interface request {
    description?: string
    required?: boolean
    content?: openapi.content
  }

  interface schemas { [x: string]: Schema.any | $ref }
  interface parameters extends inline<readonly openapi.parameter[]> {}

  type response = {
  // interface response {
    description: string
    content?: openapi.content
    headers?: openapi.headers
  }
  type responses = Record<string, openapi.response>
  type content = Record<http.MediaType, openapi.mediatype>

  // interface responses extends
  //   inline<{ [x: `1${number}`]: openapi.response }>,
  //   inline<{ [x: `2${number}`]: openapi.response }>,
  //   inline<{ [x: `3${number}`]: openapi.response }>,
  //   inline<{ [x: `4${number}`]: openapi.response }>,
  //   inline<{ [x: `5${number}`]: openapi.response }> {}
  // interface content {
  //   [http.MediaType.enum.applicationJSON]?: openapi.mediatype
  //   [http.MediaType.enum.applicationFormURLEncoded]?: openapi.mediatype
  //   [http.MediaType.enum.applicationOctetStream]?: openapi.mediatype
  //   [http.MediaType.enum.applicationXML]?: openapi.mediatype
  //   [http.MediaType.enum.applicationJavascript]?: openapi.mediatype
  //   [http.MediaType.enum.imageGIF]?: openapi.mediatype
  //   [http.MediaType.enum.imageJPEG]?: openapi.mediatype
  //   [http.MediaType.enum.imagePNG]?: openapi.mediatype
  //   [http.MediaType.enum.multipartFormData]?: openapi.mediatype
  //   [http.MediaType.enum.textCSV]?: openapi.mediatype
  //   [http.MediaType.enum.textHTML]?: openapi.mediatype
  //   [http.MediaType.enum.textPlain]?: openapi.mediatype
  //   [http.MediaType.enum.textXML]?: openapi.mediatype
  // }

  type header =
    | openapi.header.any
    // | openapi.$ref
    ;
  interface headers extends inline<{ [name: string]: openapi.header }> {}
  namespace header {
    export { header_any as any }
    export interface header_any {}
  }

  interface mediatype<T = unknown> {
    schema?: Schema.any | $ref
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
export declare namespace openapi { export { parameter } }

export declare namespace arbitrary {
  interface Countable {
    maxCount?: number
    minCount?: number
  }
  interface Schemas extends arbitrary.Countable {
    /// cross-cutting configuration
    depthIdentifier?: fc.DepthIdentifier
    /// node-specific options
    null?: Schema.null.Constraints
    boolean?: Schema.boolean.Constraints
    integer?: Schema.integer.Constraints
    number?: Schema.number.Constraints
    string?: Schema.string.Constraints
    array?: Schema.array.Constraints
    record?: Schema.record.Constraints
    object?: Schema.object.Constraints
    tuple?: Schema.tuple.Constraints
    allOf?: Schema.allOf.Constraints
    anyOf?: Schema.anyOf.Constraints
    oneOf?: Schema.oneOf.Constraints
  }
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
  type Exclude = readonly Schema.Tag[]
  interface Constraints {
    include?: arbitrary.Include
    exclude?: arbitrary.Exclude
    schemas?: arbitrary.Schemas
    paths?: arbitrary.Paths
    pathParams?: arbitrary.PathParams
    pathSegments?: arbitrary.PathSegments
    responses?: arbitrary.Responses
    // parameters?: parameters.Constraints
    // operation?: operation.Constraints
  }
}

/**
 * ### {@link arbitrary `openapi.arbitrary`}
 *
 * {@link arbitrary `openapi.arbitrary`} is the primary export of this module. It implements a
 * `fast-check` arbitrary that knows how to generate an arbitrary,
 * [pseudo-random](https://en.wikipedia.org/wiki/Pseudorandomness) OpenAPI document.
 *
 * @example
 * import * as fc from "fast-check"
 * import { oas } from "@traversable/codegen"
 *
 * const oneHundredOpenAPIDocuments = fc.sample(openapi.arbitrary, 100)
 */
export function arbitrary(constraints?: arbitrary.Constraints): fc.Arbitrary<doc>
export function arbitrary(_: arbitrary.Constraints = defaults): fc.Arbitrary<{}> {
  const $ = applyConstraints(_)
  return fc.record({
    openapi: fc.constantFrom("3.1.0"),
    components: components($),
    paths: paths($),
    info: Info,
  }, { requiredKeys: [ "components", "paths", "openapi" ] }).map(normalize)
}

type AppliedConstraints = RequireN<arbitrary.Constraints, [1, 1]>

export const applyConstraints
  : (constraints?: arbitrary.Constraints) => AppliedConstraints
  = (_) =>
    !_ ? {
      ...defaults,
      schemas: {
        ...defaults.schemas,
        depthIdentifier: createDepthIdentifier(),
      }
    }
    : {
      schemas: !_.schemas ? { ...defaults.schemas, depthIdentifier: fc.createDepthIdentifier() }
      :

      {
        /// cross-cutting schema configuration
        depthIdentifier: _.schemas.depthIdentifier ?? createDepthIdentifier(),
        maxCount: _.schemas.maxCount ?? defaults.schemas.maxCount,
        minCount: _.schemas.minCount ?? defaults.schemas.minCount,
        /// node-specific options
        null: {
          ..._.schemas.null,
          ...defaults.schemas.null,
          include: {
            const:
              _.schemas.null?.include?.const
              ?? _.include?.const
              ?? defaults.schemas.null.include.const,
            example:
              _.schemas.null?.include?.example
              ?? _.include?.example
              ?? defaults.schemas.null.include.example,
            examples:
              _.schemas.null?.include?.examples
              ?? _.include?.examples
              ?? defaults.schemas.null.include.examples,
            description:
              _.schemas.null?.include?.description
              ?? _.include?.description
              ?? defaults.schemas.null.include.description,
          }
        },
        boolean: {
          ..._.schemas.boolean,
          ...defaults.schemas.boolean,
          include: {
            const:
              _.schemas.boolean?.include?.const
              ?? _.include?.const
              ?? defaults.schemas.boolean.include.const,
            example:
              _.schemas.boolean?.include?.example
              ?? _.include?.example
              ?? defaults.schemas.boolean.include.example,
            examples:
              _.schemas.boolean?.include?.examples
              ?? _.include?.examples
              ?? defaults.schemas.boolean.include.examples,
            description:
              _.schemas.boolean?.include?.description
              ?? _.include?.description
              ?? defaults.schemas.boolean.include.description,
          }
        },
        integer: {
          ..._.schemas.integer,
          ...defaults.schemas.integer,
          include: {
            const:
              _.schemas.integer?.include?.const
              ?? _.include?.const
              ?? defaults.schemas.integer.include.const,
            example:
              _.schemas.integer?.include?.example
              ?? _.include?.example
              ?? defaults.schemas.integer.include.example,
            examples:
              _.schemas.integer?.include?.examples
              ?? _.include?.examples
              ?? defaults.schemas.integer.include.examples,
            description:
              _.schemas.integer?.include?.description
              ?? _.include?.description
              ?? defaults.schemas.integer.include.description,
          }
        },
        number: {
          ..._.schemas.number,
          ...defaults.schemas.number,
          include: {
            example:
              _.schemas.number?.include?.example
              ?? _.include?.example
              ?? defaults.schemas.number.include.example,
            examples:
              _.schemas.number?.include?.examples
              ?? _.include?.examples
              ?? defaults.schemas.number.include.examples,
            description:
              _.schemas.number?.include?.description
              ?? _.include?.description
              ?? defaults.schemas.number.include.description,
          }
        },
        string: {
          ..._.schemas.string,
          ...defaults.schemas.string,
          include: {
            const:
              _.schemas.string?.include?.const
              ?? _.include?.const
              ?? defaults.schemas.string.include.const,
            example:
              _.schemas.string?.include?.example
              ?? _.include?.example
              ?? defaults.schemas.string.include.example,
            examples:
              _.schemas.string?.include?.examples
              ?? _.include?.examples
              ?? defaults.schemas.string.include.examples,
            description:
              _.schemas.string?.include?.description
              ?? _.include?.description
              ?? defaults.schemas.string.include.description,
          }
        },



        array: {
          ..._.schemas.array,
          ...defaults.schemas.array,
          include: {
            const:
              _.schemas.array?.include?.const
              ?? _.include?.const
              ?? defaults.schemas.array.include.const,
            example:
              _.schemas.array?.include?.example
              ?? _.include?.example
              ?? defaults.schemas.array.include.example,
            examples:
              _.schemas.array?.include?.examples
              ?? _.include?.examples
              ?? defaults.schemas.array.include.examples,
            description:
              _.schemas.array?.include?.description
              ?? _.include?.description
              ?? defaults.schemas.array.include.description,
          }
        },

        object: {
          ..._.schemas.object,
          ...defaults.schemas.object,
          include: {
            ..._.schemas.object?.include,
            ...defaults.schemas.object.include,
            example:
              _.schemas.object?.include?.example
              ?? _.include?.example
              ?? defaults.schemas.object.include.example,
            examples:
              _.schemas.object?.include?.examples
              ?? _.include?.examples
              ?? defaults.schemas.object.include.examples,
            description:
              _.schemas.object?.include?.description
              ?? _.include?.description
              ?? defaults.schemas.object.include.description,
          }
        },
        record: {
          ..._.schemas.record,
          ...defaults.schemas.record,
          include: {
            const:
              _.schemas.record?.include?.const
              ?? _.include?.const
              ?? defaults.schemas.record.include.const,
            example:
              _.schemas.record?.include?.example
              ?? _.include?.example
              ?? defaults.schemas.record.include.example,
            examples:
              _.schemas.record?.include?.examples
              ?? _.include?.examples
              ?? defaults.schemas.record.include.examples,
            description:
              _.schemas.record?.include?.description
              ?? _.include?.description
              ?? defaults.schemas.record.include.description,
          }
        },
        tuple: {
          ..._.schemas.tuple,
          ...defaults.schemas.tuple,
          include: {
            const:
              _.schemas.tuple?.include?.const
              ?? _.include?.const
              ?? defaults.schemas.tuple.include.const,
            example:
              _.schemas.tuple?.include?.example
              ?? _.include?.example
              ?? defaults.schemas.tuple.include.example,
            examples:
              _.schemas.tuple?.include?.examples
              ?? _.include?.examples
              ?? defaults.schemas.tuple.include.examples,
            description:
              _.schemas.tuple?.include?.description
              ?? _.include?.description
              ?? defaults.schemas.tuple.include.description,
          }
        },
        allOf: {
          ..._.schemas.allOf,
          ...defaults.schemas.allOf,
          include: {
            const:
              _.schemas.allOf?.include?.const
              ?? _.include?.const
              ?? defaults.schemas.allOf.include.const,
            example:
              _.schemas.allOf?.include?.example
              ?? _.include?.example
              ?? defaults.schemas.allOf.include.example,
            examples:
              _.schemas.allOf?.include?.examples
              ?? _.include?.examples
              ?? defaults.schemas.allOf.include.examples,
            description:
              _.schemas.allOf?.include?.description
              ?? _.include?.description
              ?? defaults.schemas.allOf.include.description,
          }
        },
        anyOf: {
          ..._.schemas.anyOf,
          ...defaults.schemas.anyOf,
          include: {
            const:
              _.schemas.anyOf?.include?.const
              ?? _.include?.const
              ?? defaults.schemas.anyOf.include.const,
            example:
              _.schemas.anyOf?.include?.example
              ?? _.include?.example
              ?? defaults.schemas.anyOf.include.example,
            examples:
              _.schemas.anyOf?.include?.examples
              ?? _.include?.examples
              ?? defaults.schemas.anyOf.include.examples,
            description:
              _.schemas.anyOf?.include?.description
              ?? _.include?.description
              ?? defaults.schemas.anyOf.include.description,
          }
        },
        oneOf: {
          ..._.schemas.oneOf,
          ...defaults.schemas.oneOf,
          include: {
            const:
              _.schemas.oneOf?.include?.const
              ?? _.include?.const
              ?? defaults.schemas.oneOf.include.const,
            example:
              _.schemas.oneOf?.include?.example
              ?? _.include?.example
              ?? defaults.schemas.oneOf.include.example,
            examples:
              _.schemas.oneOf?.include?.examples
              ?? _.include?.examples
              ?? defaults.schemas.oneOf.include.examples,
            description:
              _.schemas.oneOf?.include?.description
              ?? _.include?.description
              ?? defaults.schemas.oneOf.include.description,
          }
        },
      },

      exclude: _.exclude || defaults.exclude,
      include: !_.include ? defaults.include: {
        const: _.include.const ?? defaults.include.const,
        description: _.include.description ?? defaults.include.description,
        example: _.include.example ?? defaults.include.example,
        examples: _.include.examples ?? defaults.include.examples,
      },
      pathParams: !_.pathParams ? defaults.pathParams : {
        maxCount: _.pathParams.maxCount ?? defaults.pathParams.maxCount,
        minCount: _.pathParams.minCount ?? defaults.pathParams.minCount,
      },
      paths: !_.paths ? defaults.paths : {
        maxCount: _.paths.maxCount ?? defaults.paths.maxCount,
        minCount: _.paths.minCount ?? defaults.paths.minCount,
      },
      pathSegments: !_.pathSegments ? defaults.pathSegments : {
        maxCount: _.pathSegments.maxCount ?? defaults.pathSegments.maxCount,
        minCount: _.pathSegments.minCount ?? defaults.pathSegments.minCount,
      },
      responses: !_.responses ? defaults.responses : {
        maxCount: _.responses.maxCount ?? defaults.responses.maxCount,
        minCount: _.responses.minCount ?? defaults.responses.minCount,
        maxContentTypeCount: _.responses.maxContentTypeCount ?? defaults.responses.maxContentTypeCount,
        minContentTypeCount: _.responses.minContentTypeCount ?? defaults.responses.minContentTypeCount,
      },
      // parameters: !_.parameters ? defaults.parameters : {
      //   ..._.operation,
      //   ...defaults.parameters,
      // },
      // operation: !_.operation ? defaults.operation : {
      //   ..._.operation.operation,
      //   ...defaults.operation,
      // }
  }

export const defaults = {
  schemas: {
    minCount: 1,
    maxCount: 3,
    allOf: Schema.allOf.defaults,
    anyOf: Schema.anyOf.defaults,
    array: Schema.array.defaults,
    boolean: Schema.boolean.defaults,
    integer: Schema.integer.defaults,
    null: Schema.null.defaults,
    number: Schema.number.defaults,
    object: Schema.object.defaults,
    oneOf: Schema.oneOf.defaults,
    record: Schema.record.defaults,
    string: Schema.string.defaults,
    tuple: Schema.tuple.defaults,
  },
  exclude: [],
  include: {
    const: false,
    description: false,
    example: true,
    examples: false,
  },
  paths: {
    minCount: 6,
    maxCount: 25,
  },
  pathParams: {
    minCount: 0,
    maxCount: 2,
  },
  pathSegments: {
    minCount: 1,
    maxCount: 4,
  },
  responses: {
    maxContentTypeCount: 5,
    minContentTypeCount: 2,

    minCount: 1,
    maxCount: 5,
  },
} satisfies Required<arbitrary.Constraints>

export const StatusCode = fc.stringMatching(PATTERN.statusCode)
export const StatusCodeNonInfo = fc.stringMatching(PATTERN.statusCodeNonInfo)

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
   * ### {@link ApiKeySecurityScheme `openapi.ApiKeySecurityScheme`}
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
   * ### {@link BearerHttpSecurityScheme `openapi.BearerHttpSecurityScheme`}
   */
  export const BearerHttpSecurityScheme = fc.record(
    {
      type: fc.constant("http"),
      scheme: fc.stringMatching(PATTERN.bearer),
      bearerFormat: fc.string(),
      description: fc.lorem(),
      in: fc.constantFrom("header", "query", "cookie"),
    },
    { requiredKeys: ["scheme", "type", "bearerFormat"] },
  )

  /**
   * ### {@link NonBearerHttpSecurityScheme `openapi.NonBearerHttpSecuritySchema`}
   */
  export const NonBearerHttpSecurityScheme = fc.record(
    {
      type: fc.constant("http"),
      description: fc.lorem(),
      in: fc.constantFrom("header", "query", "cookie"),
    },
    { requiredKeys: ["type"] },
  )

  /**
   * ### {@link HttpSecuritySchema `openapi.HttpSecuritySchema`}
   */
  export const HttpSecurityScheme = fc.oneof(
    BearerHttpSecurityScheme,
    NonBearerHttpSecurityScheme,
  )

  /**
   * ### {@link ImplicitOAuthFlow `openapi.ImplicitOAuthFlow`}
   */
  export const ImplicitOAuthFlow = fc.record(
    {
      authorizationUrl: fc.string(), // format: "uri-reference"
      refreshUrl: fc.string(), // format: "uri-reference"
      scopes: fc.dictionary(fc.string(), fc.string()),
    },
    {
      requiredKeys: [
        "authorizationUrl",
        "scopes",
      ],
    },
  )

  /**
   * ### {@link ClientCredentialsFlow `openapi.ClientCredentialsFlow`}
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
   * ### {@link AuthorizationCodeOAuthFlow `openapi.AuthorizationCodeOAuthFlow`}
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
   * ### {@link PasswordOAuthFlow `openapi.PasswordOAuthFlow`}
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
   * ### {@link OAuthFlows `openapi.OAuthFlows`}
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
   * ### {@link OAuth2SecurityScheme `openapi.OAuth2SecurityScheme`}
   */
  export const OAuth2SecurityScheme = fc.record(
    {
      type: fc.constant("oauth2"),
      flows: OAuthFlows,
      description: fc.lorem(),
    },
    { requiredKeys: ["type", "flows"] },
  )

  /**
   * ### {@link OpenIdConnectSecurityScheme `openapi.OpenIdConnectSecurityScheme`}
   */
  export const OpenIdConnectSecurityScheme = fc.record(
    {
      type: fc.constant("openIdConnectUrl"),
      description: fc.lorem(),
      openIdConnectUrl: fc.string(), // format: "uri-reference"
    },
    { requiredKeys: ["type", "openIdConnectUrl"] },
  )

  /**
   * ### {@link SecurityScheme `openapi.SecurityScheme`}
   */
  export const SecurityScheme = fc.oneof(
    ApiKeySecurityScheme,
    HttpSecurityScheme,
    OAuth2SecurityScheme,
    OpenIdConnectSecurityScheme,
  )

  /**
   * ### {@link SecurityRequirement `openapi.SecurityRequirement`}
   */
  export interface SecurityRequirement extends fc.Arbitrary.infer<typeof SecurityRequirement> {}
  export const SecurityRequirement = fc.dictionary(fc.string(), fc.array(fc.string()))
}

///////////////
/// METADATA

/**
 * ### {@link Contact `openapi.Contact`}
 */
export interface Contact extends fc.Arbitrary.infer<typeof Contact> {}
export const Contact = fc.record(
  {
    name: fc.string(),
    url: fc.string(),
    email: fc.emailAddress(),
  },
  { requiredKeys: [] },
)

/**
 * ### {@link License `openapopenapiicense`}
 */
export interface License extends fc.Arbitrary.infer<typeof License> {}
export const License = fc.record(
  {
    name: fc.string(),
    url: fc.string(), // format: "uri-reference"
  },
  { requiredKeys: ["name"] },
)

/**
 * ### {@link Info `openapi.Info`}
 */
export interface Info extends fc.Arbitrary.infer<typeof Info> {}
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
 * ### {@link ServerVariable `openapi.ServerVariable`}
 */
export interface ServerVariable extends fc.Arbitrary.infer<typeof ServerVariable> {}
export const ServerVariable = fc.record(
  {
    enum: fc.array(fc.string()),
    default: fc.string(),
    description: fc.lorem(),
  },
  { requiredKeys: ["default"] },
)

/**
 * ### {@link Server `openapi.Server`}
 */
export interface Server extends fc.Arbitrary.infer<typeof Server> {}
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


export interface Tag {
  name: string;
  description?: string | undefined;
  // externalDocs?: ExternalDocumentation | undefined;
}

/** ### {@link tag `openapi.tag`} */
export function tag(constraints?: arbitrary.Constraints): fc.Arbitrary<Tag>
export function tag(_: arbitrary.Constraints = defaults) {
  // const $ = applyConstraints(_)
  return fc.record({
    name: fc.string(),
    description: fc.lorem(),
    // externalDocs: ExternalDocumentation($),
  }, { requiredKeys: ["name"] })
}

/** ### {@link example `openapi.example`} */
export const example = fc.record({
  summary: fc.string(),
  description: fc.lorem(),
  value: fc.object(),
  externalValue: fc.string(), // format: "uri-reference"
}, { requiredKeys: [] })

const examples = fc.dictionary(fc.string(), example)

/** ### {@link Link `openapi.Link`} */
export namespace Link {
  /** ### {@link Link.Shape `openapi.Link`} */
  export interface Shape {
    parameters: { [x: string]: unknown }
    requestBody: {}
    server: Server
  }
  /**
   * ## {@link Link.shape `openapi.Link.shape`}
   */
  export const shape = {
    parameters: fc.dictionary(fc.string(), fc.object()),
    requestBody: fc.object(),
    server: Server,
  } satisfies fc.Arbitrary.map<Link.Shape>
  /** ### {@link Link.withOperationId `openapi.Link.withOperationId`} */
  export const withOperationId = fc.record(
    {
      ...Link.shape,
      operationId: fc.string(),
    },
    { requiredKeys: [] },
  )
  /** ### {@link Link.withOperationRef `openapi.Link.withOperationRef`} */
  export const withOperationRef = fc.record(
    {
      ...Link.shape,
      operationRef: fc.string(), // format: "uri-reference"
    },
    { requiredKeys: [] },
  )
  /** ### {@link Link.typedef `openapi.Link.typedef`} */
  export const typedef = fc.oneof(Link.withOperationId, Link.withOperationRef)
}

/** ### {@link Encoding `openapi.Encoding`} */
export interface Encoding extends fc.Arbitrary.infer<typeof Encoding> {}
/** ### {@link Encoding `openapi.Encoding`} */
export const Encoding = fc.record(
  {
    contentType: fc.string(),
    // TODO: CIRCULAR IF YOU UNCOMMENT `Encoding.headers`
    // headers: fc.dictionary(fc.string(), fc.oneof(Ref.typedef /* , Header */ )),
    style: fc.constantFrom("form", "spaceDelimited", "pipeDelimited", "deepObject"),
    explode: fc.boolean(),
    allowReserved: fc.boolean(), // default: false
  },
  { requiredKeys: [] },
)

export interface mediatype extends fc.Arbitrary.infer<ReturnType<typeof mediatype>> {}

/**
 * ## {@link mediatype `openapi.mediatype`}
 *
 * See also:
 * - [OpenAPI docs](https://swagger.io/docs/specification/v3_0/media-types/)
 */
// export function mediatype(constraints?: mediatype.Constraints): fc.Arbitrary<openapi.mediatype>
export function mediatype(_?: mediatype.Constraints) {
  const $ = applyConstraints(_)
  const schemaConstraints = constraintsAdapter($)
  return fc.record({
    schema: _?.schema! ?? Schema.any(schemaConstraints), // fc.oneof(Ref.typedef, Schema.any),
    ...$?.include?.description && { description: fc.lorem() },
    ...$?.include?.examples && { examples: fc.dictionary(fc.jsonValue().filter((x) => x !== null)) },
    // encoding: fc.dictionary(fc.string(), Encoding),
    // TODO: `Mediatype` is disjoint on `example` and `examples` IRL
    // const ExampleXORExamples = fc.oneof(Example, Finite.Examples)
    // ...(constraints?.includeExamples && { example: fc.oneof(fc.jsonValue()) }),
    // ...(
    //   constraints?.includeExamples
    //   && { examples: fc.jsonValue() } // fc.dictionary(fc.string(), Example) }
    //   // && { examples: fc.dictionary(fc.string(), fc.oneof(Ref.typedef, Example)) }
    // ),
  }, { requiredKeys: ["schema"] }) satisfies fc.Arbitrary<openapi.mediatype>
}

const constraintsAdapter
  : (arbitraryConstraints?: arbitrary.Constraints) => Schema.Constraints
  = (_?: arbitrary.Constraints) => {
    return {
      sortBias: Schema.Constraints.defaults.sortBias,
      base: {
        exclude: _?.exclude ?? Schema.Constraints.defaults.base.exclude,
        include: !_?.include ? Schema.Constraints.defaults.base.include : {
          const: _?.include.const ?? Schema.Constraints.defaults.base.include.const,
          description: _?.include.description ?? Schema.Constraints.defaults.base.include.description,
          example: _?.include.example ?? Schema.Constraints.defaults.base.include.example,
          examples: _?.include.examples ?? Schema.Constraints.defaults.base.include.examples,
        }
      },
    }
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

/**
 * ## {@link mediatypes `openapi.mediatypes`}
 *
 * See also:
 * - [OpenAPI docs](https://swagger.io/docs/specification/v3_0/media-types/)
 */
export function mediatypes(constraints?: mediatypes.Constraints): fc.Arbitrary<mediatypes>
export function mediatypes(_: mediatypes.Constraints = {}): fc.Arbitrary<mediatypes> {
  const $ = applyConstraints(_)
  return fc
    .uniqueArray(
      fc.tuple(
        fc.constantFrom(http.MediaType.enum.applicationJSON, ...http.MediaType.all.slice(1)),
        mediatype($),
      ),
      {
        selector: ([key]) => key,
        minLength: 1,
        maxLength: $?.responses?.maxContentTypeCount ?? defaults.responses.maxContentTypeCount,
      },
    )
    .map(globalThis.Object.fromEntries)
}

export declare namespace mediatypes {
  interface Constraint extends mediatype.Constraint {}
  interface Constraints extends mediatypes.Constraint, arbitrary.Constraints {}
}

/** ### {@link Header `openapi.Header`} */
export namespace Header {
  /** ### {@link Header.shape `openapi.Header.shape`} */
  export const shape = {
    description: fc.lorem(),
    style: fc.constant("simple"),
    explode: fc.boolean(),
    required: fc.boolean(), // default: false
    deprecated: fc.boolean(), // default: false
    allowEmptyValue: fc.boolean(), // default: false
    allowReserved: fc.boolean(), // default: false
  } as const
  /** ### {@link Header.withSchema `openapi.Header.withSchema`} */
  export const withSchema = (_?: arbitrary.Constraints) => {
    const $ = applyConstraints(_)
    const schemaConstraints = constraintsAdapter($)
    return fc.record({
      ...Header.shape,
      // schema: fc.oneof(Ref.typedef, Schema.any),
      schema: Schema.any(schemaConstraints),
    }, { requiredKeys: [] })
  }

  /** ### {@link Header.withContent `openapi.Header.withContent`} */
  export const withContent = fc.record({
    ...Header.shape,
    content: fc.dictionary(fc.constantFrom(...http.MediaType.all), mediatype(), { maxKeys: 1, minKeys: 1 }),
  }, { requiredKeys: [] })
  /** ### {@link Header.typedef `openapi.Header.typedef`} */
  export const typedef = (_?: arbitrary.Constraints) => {
    const $ = applyConstraints(_)
    fc.oneof(Header.withContent, Header.withSchema($))
  }
}

/** ### {@link response `openapi.Response`} */
export interface response extends fc.Arbitrary.infer<ReturnType<typeof response>> {}
/** ### {@link response `openapi.Response`} */
export function response(_?: arbitrary.Constraints) {
  const $ = applyConstraints(_)
  const schemaConstraints = constraintsAdapter($)
  return fc.record({
    description: fc.lorem(),
    content: mediatypes({
      ...$,
      schema: Schema.any(schemaConstraints),
    }),
  })
}

// description: fc.string(),
// headers: fc.dictionary(fc.identifier(), fc.oneof(Ref.typedef, Header.typedef)),
// content: fc.dictionary(fc.constantFrom(...http.MediaType.all), MediaType(constraints), { maxKeys: 1, minKeys: 1 }),
// links: fc.dictionary(fc.string(), fc.oneof(Ref.typedef, Link.typedef)),
// }, { requiredKeys: ["description"] })

/** ### {@link request `openapi.request`} */
export function request(constraints?: arbitrary.Constraints): fc.Arbitrary<openapi.request>
export function request(_?: arbitrary.Constraints) {
  const $ = applyConstraints(_)
  const schemaConstraints = constraintsAdapter($)
  return fc.record(
    {
      content: fc.dictionary(
        fc.constantFrom(...http.MediaType.all),
        mediatype({ ...$, schema: Schema.any(schemaConstraints) }),
      ),
      required: fc.boolean(),
      ...$?.include?.description && { description: fc.string() },
    },
    { requiredKeys: ["content"] },
  ) satisfies fc.Arbitrary<openapi.request>
}

export function requestBody(constraints?: arbitrary.Constraints): fc.Arbitrary<openapi.requestBody>
export function requestBody(_?: arbitrary.Constraints): fc.Arbitrary<openapi.request> {
  const $ = applyConstraints(_)
  return fc.oneof(
    request($),
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

interface path_parameter extends inline<{
  in: autocomplete<"path">
  name: string
  schema: Schema.any | $ref
  required: boolean
  style?: parameter.style.path
  explode?: boolean
}> {}

interface query_parameter extends inline<{
  in: autocomplete<"query">
  name: string
  schema: Schema.any | $ref
  required?: boolean
  style?: parameter.style.query
  explode?: boolean
  deprecated?: boolean
}> {}

interface header_parameter extends inline<{
  in: autocomplete<"header">
  name: string
  schema: Schema.any | $ref
  required?: boolean
  style?: parameter.style.header
  explode?: boolean
  deprecated?: boolean
}> {}

interface cookie_parameter extends inline<{
  in: autocomplete<"cookie">
  name: string
  schema: Schema.any | $ref
  required?: boolean
  style?: parameter.style.cookie
  explode?: boolean
  deprecated?: boolean
}> {}

type parameter_any =
  | path_parameter
  | cookie_parameter
  | header_parameter
  | query_parameter
  ;

export type parameter = parameter.any
export declare namespace parameter {
  export {
    parameter_any as any,
    cookie_parameter as cookie,
    header_parameter as header,
    path_parameter as path,
    query_parameter as query,
  }
}

/** ### {@link parameter `openapi.parameter`} */
export namespace parameter {
  export function any(_?: arbitrary.Constraints) {
    const $ = applyConstraints(_)
    return fc.oneof(
      parameter.query($),
      parameter.cookie($),
      parameter.header($),
    )
  }

  export const style = {
    cookie: ["form"] as const satisfies string[],
    header: ["simple"] as const satisfies string[],
    path: [
      "simple",
      "matrix",
      "label",
    ] as const satisfies string[],
    query: [
      "form",
      "spaceDelimited",
      "pipeDelimited",
      "deepObject"
    ] as const satisfies string[],
  } as const

  export declare namespace style {
    export type cookie = typeof parameter.style.cookie[number]
    export type header = typeof parameter.style.header[number]
    export type path = typeof parameter.style.path[number]
    export type query = typeof parameter.style.query[number]
  }

  export function pathSchema($: Schema.Constraints = Schema.Constraints.defaults) {
    return fc.oneof(
      Schema.number($),
      Schema.string($),
      Schema.integer($),
      Schema.boolean($),
    )
  }

  /** ### {@link parameter.path `openapi.parameter.path`} */
  export function path(constraints?: arbitrary.Constraints): fc.Arbitrary<globalThis.Omit<openapi.parameter.path, "name">>
  export function path(_?: arbitrary.Constraints): fc.Arbitrary<globalThis.Omit<openapi.parameter.path, "name">> {
    const $ = applyConstraints(_)
    const schemaConstraints = constraintsAdapter($)
    return fc.record({
      in: fc.constant("path"),
      required: fc.constant(true),
      schema: pathSchema(schemaConstraints),
      style: fc.constantFrom(...style.path),
      explode: fc.boolean(),
    }, {
      requiredKeys: [
        "required",
        "in",
        "schema",
      ]
    })
  }

  /** ### {@link parameter.query `openapi.parameter.query`} */
  export function query(constraints?: arbitrary.Constraints): fc.Arbitrary<openapi.parameter.query>
  export function query(_?: arbitrary.Constraints): fc.Arbitrary<openapi.parameter.query> {
    const $ = applyConstraints(_)
    const schemaConstraints = constraintsAdapter($)
    return fc.record({
      in: fc.constant("query"),
      name: fc.identifier(),
      schema: Schema.any(schemaConstraints),
      required: fc.boolean(),
      style: fc.constantFrom(...style.query),
      explode: fc.boolean(),
      deprecated: fc.boolean(),
    }, {
      requiredKeys: [
        "in",
        "name",
        "schema",
      ]
    })
  }

  /** ### {@link parameter.header `openapi.parameter.header`} */
  export function header(constraints?: arbitrary.Constraints): fc.Arbitrary<openapi.parameter.header>
  export function header(_?: arbitrary.Constraints): fc.Arbitrary<openapi.parameter.header> {
    const $ = applyConstraints(_)
    const schemaConstraints = constraintsAdapter($)
    return fc.record({
      in: fc.constant("header"),
      name: fc.identifier(),
      style: fc.constant(...parameter.style.header),
      required: fc.boolean(),
      schema: Schema.string(schemaConstraints),
      deprecated: fc.boolean(),
    }, {
      requiredKeys: [
        "in",
        "name",
        "schema",
      ]
    })
  }

  /** ### {@link parameter.cookie `openapi.parameter.cookie`} */
  export function cookie(constraints?: arbitrary.Constraints): fc.Arbitrary<openapi.parameter.cookie>
  export function cookie(_?: arbitrary.Constraints): fc.Arbitrary<openapi.parameter.cookie> {
    const $ = applyConstraints(_)
    const schemaConstraints = constraintsAdapter($)
    return fc.record({
      in: fc.constant("cookie"),
      name: fc.identifier(),
      style: fc.constant(...parameter.style.cookie),
      required: fc.boolean(),
      // HERE
      schema: Schema.any(schemaConstraints),
      deprecated: fc.boolean(),
    }, { requiredKeys: ["in", "name", "schema"] })
  }
}


// /** ### {@link Parameter.typedef `openapi.Parameter.typedef`} */
// export interface typedef extends Arbitrary.infer<ReturnType<typeof Parameter.typedef>> {}
// /** ### {@link Parameter.typedef `openapi.Parameter.typedef`} */
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

/** ### {@link responses `openapi.responses`} */
export function responses(constraints?: arbitrary.Constraints): fc.Arbitrary<openapi.responses>
export function responses(_: arbitrary.Constraints = {}): fc.Arbitrary<{}> {
  const $ = applyConstraints(_)
  return fc
    .tuple(
      fc.tuple(StatusCodeNonInfo, response($)),
      fc.array(fc.tuple(StatusCode, response($)), {
        minLength: globalThis.Math.max(0, ($.responses?.minCount ?? defaults.responses.minCount) - 1),
        maxLength: globalThis.Math.max(0, ($.responses?.maxCount ?? defaults.responses.maxCount) - 1),
      }),
    )
    .map(fn.flow(([head, tail]) => [head, ...tail], object.fromEntries))
}

/** ### {@link parameters `openapi.parameters`} */
export function parameters(constraints: parameters.Constraints): fc.Arbitrary<readonly openapi.parameter[]>
export function parameters(_: parameters.Constraints): fc.Arbitrary<readonly openapi.parameter[]> {
  const $ = {
    ...applyConstraints(_),
    params: _.params,
  }
  return fc
    .tuple(
      fc.uniqueArray(parameter.any($), { selector: (p) => p.name }),
      fc.array(
        parameter.path($), {
          minLength: $.pathParams.minCount,
          maxLength: $.pathParams.maxCount,
        }
      ).map((ps) =>
        ps.map((p, ix) => ({
          name: $.params[ix],
          ...p,
        })),
      ),
    ).map(([params, pathParams]) => [
      ...pathParams,
      ...params.filter((p) => !pathParams.map((p) => p.name).includes(p.name)
      )
    ]
  )
}
export declare namespace parameters {
  export interface Constraints extends operation.Constraints {}
}

/** ### {@link operation `openapi.operation`} */
export function operation(constraints: operation.Constraints): fc.Arbitrary<openapi.operation>
export function operation(_: operation.Constraints) {
  const $ = {
    ...applyConstraints(_),
    params: _.params,
    method: _.method,
  }
  return fc.record({
    // no body on GET, HEAD or DELETE requests
    // see https://datatracker.ietf.org/doc/html/rfc7231#section-4.3
    responses: responses($),
    parameters: parameters($),
    ...!
      ["get", "delete", "head"].includes($.method.toLowerCase())
      && { requestBody: requestBody($) },
    ...$.include.description && { description: fc.lorem() },
  }, {
    requiredKeys: [
      "responses",
      "parameters",
    ]
  }) satisfies fc.Arbitrary<openapi.operation>
}

export declare namespace operation {
  interface Constraints extends arbitrary.Constraints {
    method: http.Verb
    params: readonly string[]
  }
}

/** ### {@link pathitem `openapi.pathitem`} */
export function pathitem(constraints: pathitem.Constraints): fc.Arbitrary<openapi.pathitem>
export function pathitem(_: pathitem.Constraints): fc.Arbitrary<{}> {
  const $ = {
    ...applyConstraints(_),
    params: _.params
  }
  return fc.record({
    get: operation({ ...$, method: "get" }),
    put: operation({ ...$, method: "put" }),
    post: operation({ ...$, method: "post" }),
    // delete: operation({ ...constraints, method: "delete" }),
    // options: operation({ ...constraints }),
    // head: operation({ ...constraints }),
    // trace: operation({ ...constraints }),
  }, { requiredKeys: [] })
}

export declare namespace pathitem {
  interface Constraints extends arbitrary.Constraints {
    params: readonly string[]
  }
}

export interface pathname extends inline<{
  segments: string[]
  params: string[]
  path: string
}> {}

/** ### {@link pathname `openapi.pathname`} */
export function pathname(constraints?: arbitrary.Constraints): fc.Arbitrary<pathname>
export function pathname(_?: arbitrary.Constraints): fc.Arbitrary<pathname> {
  const $ = applyConstraints(_)
  const segments = fc.uniqueArray(fc.alphanumeric(), {
    maxLength: $.pathSegments.maxCount,
    minLength: $.pathSegments.minCount,
  })
  const params = fc.uniqueArray(fc.alphanumeric(), {
    maxLength: $.pathSegments.maxCount,
    minLength: $.pathSegments.minCount,
  })
  return fc
    .tuple(segments, params)
    .map(([segments, params]) => ({
      segments,
      params,
      path: "/" + zip
        .arrays(segments, params)
        .map(([s, p]) => !p ? s : !s ? `{${p}}` : `${s}/{${p}}`)
        .join("/"),
      })
    )
}

/** ### {@link pathnames `openapi.pathnames`} */
export function pathnames(constraints?: arbitrary.Constraints): fc.Arbitrary<readonly pathname[]>
export function pathnames(_?: arbitrary.Constraints): fc.Arbitrary<readonly pathname[]> {
  const $ = applyConstraints(_)
  return fc.uniqueArray(
    pathname($), {
      maxLength: $.pathParams.maxCount,
      minLength: $.pathParams.minCount,
      selector: (c) => c.path,
    }
  )
}

/**
 * ## {@link paths `openapi.paths`}
 *
 * See also:
 * - [OpenAPI docs](https://swagger.io/docs/specification/v3_0/paths-and-operations/#paths)
 */
export function paths(constraints?: arbitrary.Constraints): fc.Arbitrary<openapi.paths>
export function paths(_?: arbitrary.Constraints): fc.Arbitrary<openapi.paths> {
  const $ = applyConstraints(_)
  return pathnames($).chain( // TODO: remove this chain, it breaks shrinking
    fn.flow(
      map(({ path, params }) => [path, pathitem({ ...$, params })] as const),
      object.fromEntries,
      (ps) => fc.record(ps),
    ),
  )
}

/**
 * ## {@link components `openapi.components`}
 *
 * See also:
 * - [OpenAPI docs](https://swagger.io/docs/specification/v3_0/components/)
 */
export function components(constraints?: arbitrary.Constraints): fc.Arbitrary<openapi.components>
export function components(_?: arbitrary.Constraints): fc.Arbitrary<openapi.components> {
  const $ = applyConstraints(_)
  const schemaConstraints = constraintsAdapter($)

  return fc.record({
    schemas: fc.dictionary(
      fc.alphanumeric(),
      Schema.any(schemaConstraints), {
        minKeys: $.schemas.minCount,
        maxKeys: $.schemas.maxCount,
      },
    ),
    ...$.include.examples && { examples },
  }, { requiredKeys: ["schemas"] })
}

// /** ### {@link Components `openapi.Components`} */
// export interface Components extends Arbitrary.infer<ReturnType<typeof components>> {}
// export interface Tag extends Arbitrary.infer<typeof tag> {}
// export interface Example extends Arbitrary.infer<typeof example> {}
