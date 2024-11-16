import type { fc } from "@traversable/core"
import { http } from "@traversable/http"
import type { any } from "any-ts"

import type { parameter } from "./parameter.js"
import type { Schema } from "./schema.js"

type inline<T> = T

export declare namespace Arbitrary {
  export {
    Arbitrary_any as any,
    Arbitrary_infer as infer,
    Arbitrary_map as map,
    Arbitrary_shape as shape,
    Arbitrary_unmap as unmap,
  }
}
export declare namespace Arbitrary {
  type Arbitrary_any = fc.Arbitrary<unknown>
  type Arbitrary_infer<T> = T extends fc.Arbitrary<infer U> ? U : never
  type Arbitrary_map<T> = never | { -readonly [K in keyof T]: fc.Arbitrary<T[K]> }
  type Arbitrary_shape<T extends { [x: string]: Arbitrary.any } = { [x: string]: Arbitrary.any }> = T
  type Arbitrary_unmap<T> = never | { -readonly [K in keyof T]: Arbitrary_infer<T[K]> }
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

type AppliedConstraints = { [K in keyof arbitrary.Constraints]-?: Required<arbitrary.Constraints[K]> }

export const applyConstraints: (constraints?: arbitrary.Constraints) => AppliedConstraints = (_) =>
  !_
    ? defaults
    : {
        include: !_.include
          ? defaults.include
          : {
              const: _.include.const ?? defaults.include.const,
              description: _.include.description ?? defaults.include.description,
              example: _.include.example ?? defaults.include.example,
              examples: _.include.examples ?? defaults.include.examples,
            },
        pathParams: !_.pathParams
          ? defaults.pathParams
          : {
              maxCount: _.pathParams.maxCount ?? defaults.pathParams.maxCount,
              minCount: _.pathParams.minCount ?? defaults.pathParams.minCount,
            },
        paths: !_.paths
          ? defaults.paths
          : {
              maxCount: _.paths.maxCount ?? defaults.paths.maxCount,
              minCount: _.paths.minCount ?? defaults.paths.minCount,
            },
        pathSegments: !_.pathSegments
          ? defaults.pathSegments
          : {
              maxCount: _.pathSegments.maxCount ?? defaults.pathSegments.maxCount,
              minCount: _.pathSegments.minCount ?? defaults.pathSegments.minCount,
            },
        responses: !_.responses
          ? defaults.responses
          : {
              maxCount: _.responses.maxCount ?? defaults.responses.maxCount,
              minCount: _.responses.minCount ?? defaults.responses.minCount,
              maxContentTypeCount: _.responses.maxContentTypeCount ?? defaults.responses.maxContentTypeCount,
              minContentTypeCount: _.responses.minContentTypeCount ?? defaults.responses.minContentTypeCount,
            },
        schemas: !_.schemas
          ? defaults.schemas
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

/** @internal */
export const lit: <T extends any.primitive>(value: T) => T = (value) => value

export function openapi() {}
openapi.is = {
  request: (u: openapi.requestBody): u is openapi.request => !("$ref" in u),
}

export declare namespace openapi {
  const document: document.meta & {
    openapi: "3.0.1" | "3.0.1"
    schemas: openapi.schemas
    paths: { ["/api/v2/example/{id}"]?: openapi.pathitem } & {
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

export const style = {
  cookie: ["form"] as const satisfies string[],
  header: ["simple"] as const satisfies string[],
  path: ["simple", "matrix", "label"] as const satisfies string[],
  query: ["form", "spaceDelimited", "pipeDelimited", "deepObject"] as const satisfies string[],
} as const

export declare namespace style {
  export type cookie = (typeof style.cookie)[number]
  export type header = (typeof style.header)[number]
  export type path = (typeof style.path)[number]
  export type query = (typeof style.query)[number]
}

export interface path_parameter
  extends inline<{
    in: "path"
    name: string
    schema: Schema.any
    required: boolean
    style?: style.path
    explode?: boolean
  }> {}

export interface query_parameter
  extends inline<{
    in: "query"
    name: string
    schema: Schema.any
    required?: boolean
    style?: style.query
    explode?: boolean
    deprecated?: boolean
  }> {}

export interface header_parameter
  extends inline<{
    in: "header"
    name: string
    schema: Schema.any
    required?: boolean
    style?: style.header
    explode?: boolean
    deprecated?: boolean
  }> {}

export interface cookie_parameter
  extends inline<{
    in: "cookie"
    name: string
    schema: Schema.any
    required?: boolean
    style?: style.cookie
    explode?: boolean
    deprecated?: boolean
  }> {}
