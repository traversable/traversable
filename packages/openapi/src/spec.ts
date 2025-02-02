import type { JsonSchema, fc } from "@traversable/core"
import { fn, map } from "@traversable/data"
import type {
  _,
  autocomplete,
  newtype,
} from "@traversable/registry"
import type { HKT } from "@traversable/registry"

import { arbitrary, defaults, type doc as document, type parameter } from "./document.js"
import type { Schema as Schema_ } from "./schema/exports.js"
import type { $ref } from "./types.js"
import Constraints = arbitrary.Constraints

export {
  OpenAPI,
}

type Schema = Schema_.any | $ref

declare namespace OpenAPI {
  namespace param {
    interface path<T> {
      in: autocomplete<"path">
      name: string
      schema: T
      required: boolean
      style?: parameter.style.path
      explode?: boolean
    }
    interface query<T> {
      in: autocomplete<"query">
      name: string
      schema: T
      required?: boolean
      style?: parameter.style.query
      explode?: boolean
      deprecated?: boolean
    }
    interface header<T> {
      in: autocomplete<"header">
      name: string
      schema: T
      required?: boolean
      style?: parameter.style.header
      explode?: boolean
      deprecated?: boolean
    }
    interface cookie<T> {
      in: autocomplete<"cookie">
      name: string
      schema: T
      required?: boolean
      style?: parameter.style.cookie
      explode?: boolean
      deprecated?: boolean
    }
  }

  /**
   * ### {@link EtcEtc}
   * "Example" keys are stripped and replaced with a string index signature.
   * Used only to give the reader a visual hint, show showing the sort of keys
   * the API expects (without actually enforcing them).
   */
  type Etc<T> = never | { [x: string]: T[keyof T] }

  type doc<𐠀 = unknown> = document.meta & {
    openapi: autocomplete<"3.1.0">
    components: {
      schemas: Etc<{
        [schemaName in 'UserSchema' | 'OrderSchema' | 'Etc...']: 𐠀
      }>
    }
    paths: Etc<{
      [path in '/store/order' | '/store/order/{id}' | '/etc/etc...']: {
        [K in "get" | "post" | "put" | "delete" | "trace"]+?: {
          parameters?: readonly (
            | param.cookie<𐠀>
            | param.header<𐠀>
            | param.path<𐠀>
            | param.query<𐠀>
          )[]
          requestBody?: {
            required?: boolean
            content?: {
              [media𛰃type: string]: {
                schema?: 𐠀
              }
            }
          }
          responses?: {
            [status𛰃code: string]: {
              description: string
              content?: Etc<{
                [media𛰃type in 'text/html' | 'application/json' | 'etc/etc...']: {
                  schema?: 𐠀
                }
              }>
              headers?: Etc<{
                [Header in 'Content-Type' | 'Authorization' | 'Etc...']: {
                  schema?: 𐠀
                }
              }>
            }
          }
        }
      }
    }>
  }

  namespace label {
    type key<_ extends string> = string & {}
    interface root<T extends {}> extends newtype<T> {}
    interface paths<T extends {}> extends newtype<T> {}
    interface response<T extends {}> extends newtype<T> {}
    interface responses<T extends {}> extends newtype<T> {}
    interface content<T extends {}> extends newtype<T> {}
    interface components<T extends {}> extends newtype<T> {}
    interface pathItem<T extends {}> extends newtype<T> {}
    interface operation<T extends {}> extends newtype<T> {}
    interface requestBody<T extends {}> extends newtype<T> {}
    interface headers<T extends {}> extends newtype<T> {}
    interface header<T extends {}> extends newtype<T> {}
  }

  interface lambda extends HKT { [-1]: OpenAPI.F<this[0]> }
  type F<T> =
    | Paths<T>
    | Components<T>
    | Schemas<T>
    | Recursive<T>
    | Operation<T>
    | RequestBody<T>
    | Responses<T>
    | ResponseParameters<T>
    | ResponseContent<T>
    | Response<T>
    | Headers<T>
    ;
  type Paths<T> = OpenAPI.doc<T>["paths"]
  type Components<T> = OpenAPI.doc<T>["components"]
  type Schemas<T> = OpenAPI.doc<T>["components"]["schemas"]
  type Recursive<T> = OpenAPI.Schemas<T>[keyof OpenAPI.Schemas<T>]
  type Operation<T> = OpenAPI.Paths<T>["paths"][keyof OpenAPI.Paths<T>["paths"]]
  type RequestBody<T> = ({} & OpenAPI.Operation<T>)["requestBody"]
  type Headers<T> = {} & OpenAPI.Response<T>["headers"]
  type Responses<T> = ({} & OpenAPI.Operation<T>)["responses"]
  type ResponseParameters<T> = ({} & OpenAPI.Operation<T>)["parameters"]
  type ResponseContent<T> = {} & OpenAPI.Response<T>["content"]
  type Response<T> = OpenAPI.Responses<T>[keyof OpenAPI.Responses<T>]
  type Fixpoint = OpenAPI.F<Schema>
}

declare namespace OpenAPI { 
  export { 
    OpenAPI_map as map,
    OpenAPI_new as new,
    Constraints,
    defaults,
  } 
}
function OpenAPI() {}
namespace OpenAPI {
  OpenAPI.map = OpenAPI_map
  OpenAPI.new = OpenAPI_new
  OpenAPI.defaults = defaults

  export function generate(constraints?: arbitrary.Constraints): fc.Arbitrary<OpenAPI.doc<JsonSchema>> 
  export function generate(constraints?: arbitrary.Constraints) {
    // TODO:                      ↆↆ fix this type assertion
    return arbitrary(constraints) as fc.Arbitrary<OpenAPI.doc<JsonSchema>>
  }
}

const openapi_v3xx = "3.1.0"
const defaultInfo = {
  title: "",
  version: "0.0.0",
} satisfies OpenAPI.doc["info"]

function OpenAPI_new<T extends OpenAPI.doc>(spec: Partial<T>): T
// function OpenAPI_new<S>(): <T extends OpenAPI.F<S>>(spec: T) => T 
function OpenAPI_new(spec?: Partial<OpenAPI.F<any>>) { 
  return spec === undefined 
    ? (spec: Partial<OpenAPI.F<any>>) => OpenAPI_new(spec)
    : {
      ...spec,
      openapi: spec.openapi ?? openapi_v3xx,
      info: !spec.info ? defaultInfo : {
        ...spec.info,
        title: spec.info.title ?? defaultInfo.title,
        version: spec.info.version ?? defaultInfo.version,
      },
      components: !spec.components ? { schemas: {} } : {
        schemas: spec.components.schemas || {}
      },
      paths: !spec.paths ? {} : spec.paths,
    } satisfies OpenAPI.doc<any>
}

function OpenAPI_map<S, T>(doc: OpenAPI.doc<S>, f: (s: S) => T): OpenAPI.doc<T>
function OpenAPI_map<S, T>(f: (s: S) => T): (doc: OpenAPI.doc<S>) => OpenAPI.doc<T>
function OpenAPI_map<S, T>(
  ...args: 
    | [f: (s: S) => T]
    | [doc: OpenAPI.doc<S>, f: (s: S) => T]
): OpenAPI.doc<T> | ((doc: OpenAPI.doc<S>) => OpenAPI.doc<T>) {
  if (args.length === 1) 
    return (doc: OpenAPI.doc<S>) => OpenAPI_map(doc, ...args)
  else {
    const [doc, f] = args
    return {
      ...doc,
      components: {
        ...doc.components,
        schemas: fn.pipe(
          doc.components.schemas,
          map(f),
        )
      },
      paths: fn.pipe(
        doc.paths,
        map(
          (pathitem) => fn.pipe(
            pathitem,
            map(
              (operation) => !operation ? void 0 : fn.pipe(
                operation,
                ({ parameters, requestBody, responses, ...operation }) => ({
                  ...operation,
                  ////////////////////////////////
                  ///    begin: parameters     ///
                  ...parameters && ({
                  parameters: map(
                    parameters,
                    (parameter) => ({
                      ...parameter,
                      schema: f(parameter.schema),
                    })
                  )}),
                  ///      end: parameters     ///
                  ////////////////////////////////
                  ///    begin: requestBody    ///
                  ...requestBody && ({
                  requestBody: fn.pipe(
                    requestBody,
                    ({ content, ...requestBody }) => ({
                      ...requestBody,
                      ...content && ({
                      content: map(
                        content,
                        ({ schema, ...mediatype }) => ({
                          ...mediatype,
                          schema: schema ? f(schema) : void 0
                        })
                      )})
                    })
                  )}),
                  ///      end: requestBody    ///
                  ////////////////////////////////
                  ///    begin: responses      ///
                  ...responses && ({
                  responses: map(
                    responses,
                    ({ content, headers, ...response }) => ({
                      ...response,
                      ...content && ({
                      content: fn.pipe(
                        content,
                        (content) => !content ? void 0 : fn.pipe(
                          content,
                          map(
                            ({ schema, ...mediatype }) => ({
                              ...mediatype,
                              schema: schema ? f(schema) : void 0
                            })
                          ),
                        )
                      )}),
                      ...headers && ({
                      headers: fn.pipe(
                        headers,
                        map(
                          ({ schema, ...header }) => ({
                            ...header,
                            schema: schema ? f(schema) : void 0
                          })
                        ),
                      )})
                    })
                  )})
                  ///     end: responses      ///
                  ///////////////////////////////
                })
              )
            )
          )
        )
      )
    }
  }
}
