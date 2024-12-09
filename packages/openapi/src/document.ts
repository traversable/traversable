import { core, fc, is, tree, zip } from "@traversable/core"
import { fn, map, object } from "@traversable/data"
import { http } from "@traversable/http"
import { PATTERN } from "@traversable/registry"

import * as N from "./normalize.js"
import { 
  BooleanNode,
  ExternalDocumentation,
  IntegerNode,
  NumberNode,
  Schema,
  StringNode,
} from "./schema-old.js"
import type { Arbitrary } from "./types.js"

/** @internal */
type inline<T> = T
/** @internal */
type autocomplete<T> = T | (string & {})

/** @internal */
const predicate = tree.has("schemas", tree.has("type", is.string))
/** @internal */
const normalize = N.normalize(predicate)

export function openapi() {} 

openapi.is = {
  request: (u: openapi.requestBody): u is openapi.request => !("$ref" in u),
}

export declare namespace openapi {
  const document: document.meta & {
    openapi: "3.0.1" | "3.0.1"
    schemas: openapi.schemas
    paths:
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
      title: string;
      version: string;
      description?: string;
      termsOfService?: string;
      contact?: openapi.meta.contact;
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

  interface components { schemas?: schemas }
  interface paths extends inline<{ [path: string]: openapi.pathitem }> {}
  interface $ref<T extends string = string> { $ref?: T }
  interface pathitem extends 
    pathitem.meta, 
    pathitem.verbs {}

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

  interface schemas { [x: string]: Schema.any }
  interface parameters extends inline<readonly openapi.parameter[]> {}

  type response = {
  // interface response {
    description?: string
    content?: openapi.content
    headers?: openapi.headers
  }
  interface responses extends 
    inline<{ [x: `1${number}`]: openapi.response }>,
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
export declare namespace openapi { export { parameter } }

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
export function arbitrary(constraints?: arbitrary.Constraints): fc.Arbitrary<openapi.document>
export function arbitrary(_: arbitrary.Constraints = defaults): fc.Arbitrary<{}> {
  const constraints = applyConstraints(_)
  return fc.record({
    openapi: fc.constantFrom("3.0.1"),
    components: components(constraints),
    paths: paths(constraints),
    info: Info,
  }, { requiredKeys: [ "components", "paths", "openapi" ] }).map(normalize)
}

type AppliedConstraints = { [K in keyof arbitrary.Constraints]-?: Required<arbitrary.Constraints[K]> }

const applyConstraints 
  : (constraints?: arbitrary.Constraints) => AppliedConstraints
  = (_) => 
    !_ ? defaults : {
      include
      : !_.include ? defaults.include 
      : {
        const: _.include.const ?? defaults.include.const,
        description: _.include.description ?? defaults.include.description,
        example: _.include.example ?? defaults.include.example,
        examples: _.include.examples ?? defaults.include.examples,
      },
      pathParams
      : !_.pathParams ? defaults.pathParams 
      : {
        maxCount: _.pathParams.maxCount ?? defaults.pathParams.maxCount,
        minCount: _.pathParams.minCount ?? defaults.pathParams.minCount,
      },
      paths
      : !_.paths ? defaults.paths 
      : {
        maxCount: _.paths.maxCount ?? defaults.paths.maxCount,
        minCount: _.paths.minCount ?? defaults.paths.minCount,
      },
      pathSegments
      : !_.pathSegments ? defaults.pathSegments 
      : {
        maxCount: _.pathSegments.maxCount ?? defaults.pathSegments.maxCount,
        minCount: _.pathSegments.minCount ?? defaults.pathSegments.minCount,
      },
      responses
      : !_.responses ? defaults.responses
      : {
        maxCount: _.responses.maxCount ?? defaults.responses.maxCount,
        minCount: _.responses.minCount ?? defaults.responses.minCount,
        maxContentTypeCount: _.responses.maxContentTypeCount ?? defaults.responses.maxContentTypeCount,
        minContentTypeCount: _.responses.minContentTypeCount ?? defaults.responses.minContentTypeCount,
      },
      schemas
      : !_.schemas ? defaults.schemas
      : {
        maxCount: _.schemas.maxCount ?? defaults.schemas.maxCount,
        minCount: _.schemas.minCount ?? defaults.schemas.minCount,
      },
  }

export const defaults = {
  schemas: {
    minCount: 1,
    maxCount: 25,
  },
  include: {
    const: false,
    description: false,
    example: false,
    examples: false,
  },
  paths: {
    minCount: 6,
    maxCount: 25,
  },
  pathParams: {
    minCount: 1,
    maxCount: 4,
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
  export interface SecurityRequirement extends Arbitrary.infer<typeof SecurityRequirement> {}
  export const SecurityRequirement = fc.dictionary(fc.string(), fc.array(fc.string()))
}

///////////////
/// METADATA

/**
 * ### {@link Contact `openapi.Contact`}
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
 * ### {@link License `openapopenapiicense`}
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
 * ### {@link Info `openapi.Info`}
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
 * ### {@link ServerVariable `openapi.ServerVariable`}
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
 * ### {@link Server `openapi.Server`}
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


export interface Tag {
  name: string;
  description?: string | undefined;
  externalDocs?: ExternalDocumentation | undefined;
}

/** ### {@link tag `openapi.tag`} */
export function tag(constraints?: arbitrary.Constraints): fc.Arbitrary<Tag> 
export function tag(constraints: arbitrary.Constraints = defaults) {
  return fc.record({
    name: fc.string(),
    description: fc.lorem(),
    externalDocs: ExternalDocumentation(constraints),
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
  /** ### {@link Link.shape `openapi.Link.shape`} */
  export const shape = {
    parameters: fc.dictionary(fc.string(), fc.object()),
    requestBody: fc.object(),
    server: Server,
  } satisfies Arbitrary.map<Link.Shape>
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
export interface Encoding extends Arbitrary.infer<typeof Encoding> {}
/** ### {@link Encoding `openapi.Encoding`} */
export const Encoding = fc.record(
  {
    contentType: fc.string(),
    // TODO: CIRCULAR IF YOU UNCOMMENT `Header`
    // headers: fc.dictionary(fc.string(), fc.oneof(Ref.typedef /* , Header */ )),
    style: fc.constantFrom("form", "spaceDelimited", "pipeDelimited", "deepObject"),
    explode: fc.boolean(),
    allowReserved: fc.boolean(), // default: false
  },
  { requiredKeys: [] },
)

/** ### {@link mediatype `openapi.mediatype`} */
export interface mediatype extends Arbitrary.infer<ReturnType<typeof mediatype>> {}
/** ### {@link mediatype `openapi.mediatype`} */
export function mediatype(constraints?: mediatype.Constraints): fc.Arbitrary<openapi.mediatype>
export function mediatype(_: mediatype.Constraints = mediatype.defaults) {
  const constraints = {
    ...applyConstraints(_),
    schema: _.schema,
  }
  return fc.record(
    {
      schema: constraints.schema ?? mediatype.defaults.schema, // fc.oneof(Ref.typedef, Schema.any),
      ...constraints?.include?.description && { description: fc.lorem() },
      ...constraints?.include?.examples && { examples: fc.dictionary(fc.jsonValue().filter(core.is.notNull)) },
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
  export const withSchema = fc.record(
    {
      ...Header.shape,
      schema: Schema.any(),
      // schema: fc.oneof(Ref.typedef, Schema.any),
    },
    { requiredKeys: [] },
  )
  /** ### {@link Header.withContent `openapi.Header.withContent`} */
  export const withContent = fc.record(
    {
      ...Header.shape,
      content: fc.dictionary(fc.constantFrom(...http.MediaType.all), mediatype(), { maxKeys: 1, minKeys: 1 }),
    },
    { requiredKeys: [] },
  )
  /** ### {@link Header.typedef `openapi.Header.typedef`} */
  export const typedef = fc.oneof(Header.withContent, Header.withSchema)
}

/** ### {@link response `openapi.Response`} */
export interface response extends Arbitrary.infer<ReturnType<typeof response>> {}
/** ### {@link response `openapi.Response`} */
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

/** ### {@link request `openapi.request`} */
export function request(constraints?: arbitrary.Constraints): fc.Arbitrary<openapi.request>
export function request(constraints?: arbitrary.Constraints) {
  return fc.record(
    {
      content: fc.dictionary(
        fc.constantFrom(...http.MediaType.all),
        mediatype({ ...constraints, schema: Schema.any() }),
      ),
      required: fc.boolean(),
      ...constraints?.include?.description && { description: fc.string() },
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

interface path_parameter extends inline<{ 
  in: autocomplete<"path">
  name: string 
  schema: Schema.any
  required: boolean
  style?: parameter.style.path
  explode?: boolean
}> {}

interface query_parameter extends inline<{
  in: autocomplete<"query">
  name: string
  schema: Schema.any
  required?: boolean
  style?: parameter.style.query
  explode?: boolean
  deprecated?: boolean
}> {}

interface header_parameter extends inline<{
  in: autocomplete<"header">
  name: string
  schema: Schema.any
  required?: boolean
  style?: parameter.style.header
  explode?: boolean
  deprecated?: boolean
}> {}

interface cookie_parameter extends inline<{
  in: autocomplete<"cookie">
  name: string
  schema: Schema.any
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
  export function any(constraints?: arbitrary.Constraints) {
    return fc.oneof(
      parameter.query(constraints), 
      parameter.cookie(constraints), 
      parameter.header(constraints),
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

  export function pathSchema(constraints: Schema.Constraints = Schema.defaults) {
    return fc.oneof(
      NumberNode(constraints), 
      StringNode(constraints), 
      IntegerNode(constraints), 
      BooleanNode(constraints),
    )
  }

  /** ### {@link parameter.path `openapi.parameter.path`} */
  export function path(constraints?: arbitrary.Constraints): fc.Arbitrary<globalThis.Omit<openapi.parameter.path, "name">>
  export function path(_?: arbitrary.Constraints): fc.Arbitrary<globalThis.Omit<openapi.parameter.path, "name">> {
    const constraints = applyConstraints(_)
    return fc.record({
      in: fc.constant("path"),
      required: fc.constant(true),
      schema: pathSchema(constraints),
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
    const constraints = applyConstraints(_)
    return fc.record({
      in: fc.constant("query"),
      name: fc.identifier(),
      schema: Schema.any(constraints),
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
    const constraints = applyConstraints(_)
    return fc.record({
      in: fc.constant("header"),
      name: fc.identifier(),
      style: fc.constant(...parameter.style.header),
      required: fc.boolean(),
      schema: Schema.StringNode({ ...constraints, nullable: false }),
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
    const constraints = applyConstraints(_)
    return fc.record({
      in: fc.constant("cookie"),
      name: fc.identifier(),
      style: fc.constant(...parameter.style.cookie),
      required: fc.boolean(),
      schema: Schema.any(constraints),
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
export function responses(constraints: arbitrary.Constraints = {}): fc.Arbitrary<{}> {
  return fc
    .tuple(
      fc.tuple(StatusCodeNonInfo, response(constraints)),
      fc.array(fc.tuple(StatusCode, response(constraints)), {
        minLength: globalThis.Math.max(0, (constraints.responses?.minCount ?? defaults.responses.minCount) - 1),
        maxLength: globalThis.Math.max(0, (constraints.responses?.maxCount ?? defaults.responses.maxCount) - 1),
      }),
    )
    .map(fn.flow(([head, tail]) => [head, ...tail], object.fromEntries))
}

/** ### {@link parameters `openapi.parameters`} */
export function parameters(constraints: parameters.Constraints): fc.Arbitrary<readonly openapi.parameter[]>
export function parameters(constraints: parameters.Constraints): fc.Arbitrary<readonly openapi.parameter[]> {
  return fc
    .tuple(
      fc.uniqueArray(parameter.any(constraints), { selector: (p) => p.name }),
      fc.array(
        parameter.path(constraints), {
          minLength: constraints.params.length,
          maxLength: constraints.params.length,
        }
      ).map((ps) =>
        ps.map((p, ix) => ({
          name: constraints.params[ix],
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
  const constraints = { 
    ...applyConstraints(_),  
    params: _.params,
    method: _.method,
  }
  return fc.record({
    // no body on GET, HEAD or DELETE requests
    // see https://datatracker.ietf.org/doc/html/rfc7231#section-4.3
    responses: responses(constraints),
    parameters: parameters(constraints),
    ...!
      ["get", "delete", "head"].includes(constraints.method.toLowerCase()) 
      && { requestBody: requestBody(constraints) },
    ...constraints.include.description && { description: fc.lorem() },
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
  const constraints = { 
    ...applyConstraints(_), 
    params: _.params 
  }
  return fc.record({
    get: operation({ ...constraints, method: "get" }),
    put: operation({ ...constraints, method: "put" }),
    post: operation({ ...constraints, method: "post" }),
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
  const constraints = applyConstraints(_)
  const segments = fc.uniqueArray(fc.alphanumeric(), {
    maxLength: constraints.pathSegments.maxCount,
    minLength: constraints.pathSegments.minCount,
  })
  const params = fc.uniqueArray(fc.alphanumeric(), {
    maxLength: constraints.pathSegments.maxCount,
    minLength: constraints.pathSegments.minCount,
  })
  return fc
    .tuple(segments, params)
    .map(([segments, params]) => ({
      segments,
      params,
      path
      : "/" + zip
        .arrays(segments, params)
        .map(([s, p]) => !p ? s : !s ? `{${p}}` : `${s}/{${p}}`)
        .join("/"),
      })
    )
}


/** ### {@link pathnames `openapi.pathnames`} */
export function pathnames(constraints?: arbitrary.Constraints): fc.Arbitrary<readonly pathname[]>
export function pathnames(_?: arbitrary.Constraints): fc.Arbitrary<readonly pathname[]> {
  const constraints = applyConstraints(_)
  return fc.uniqueArray(
    pathname(constraints), {
      maxLength: constraints.pathParams.maxCount,
      minLength: constraints.pathParams.minCount,
      selector: (c) => c.path,
    }
  )
}

/** ### {@link paths `openapi.paths`} */
export function paths(constraints?: arbitrary.Constraints): fc.Arbitrary<openapi.paths> 
export function paths(_?: arbitrary.Constraints): fc.Arbitrary<openapi.paths> {
  const constraints = applyConstraints(_)
  return pathnames(constraints).chain( // TODO: remove this chain, it breaks shrinking
    fn.flow(
      map(({ path, params }) => [path, pathitem({ ...constraints, params })] as const),
      object.fromEntries,
      (ps) => fc.record(ps),
    ),
  )
}


/** ### {@link components `openapi.components`} */
export function components(constraints?: arbitrary.Constraints): fc.Arbitrary<openapi.components>
export function components(_?: arbitrary.Constraints): fc.Arbitrary<openapi.components> {
  const constraints = applyConstraints(_)
  return fc.record({ 
    schemas: fc.dictionary(
      fc.alphanumeric(),
      Schema.any(constraints) as fc.Arbitrary<Schema.any>, {
        minKeys: constraints.schemas.minCount,
        maxKeys: constraints.schemas.maxCount,
      },
    ),
    ...constraints.include.examples && { examples },
  }, { requiredKeys: ["schemas"] })
}
  



// /** ### {@link Components `openapi.Components`} */
// export interface Components extends Arbitrary.infer<ReturnType<typeof components>> {}
// export interface Tag extends Arbitrary.infer<typeof tag> {}
// export interface Example extends Arbitrary.infer<typeof example> {}

