import { fn, map } from "@traversable/data"
import * as fc from "fast-check"
import type {
  _,
  autocomplete,
  newtype,
} from "@traversable/registry"
import { HKT } from "@traversable/registry"

import type { Schema as Schema_ } from "./schema/exports.js"
import type { $ref } from "./types.js"
import { parameter, doc as document, arbitrary } from "./document.js"

export {
  Spec,
}

type Schema = Schema_.any | $ref

declare namespace Spec {
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

  type doc<𐠀 = unknown> = document.meta & {
    openapi: autocomplete<"3.1.0">
    components: {
      schemas: {
        [schemaName: label.key<'UserSchema' | 'OrderSchema'>]: 𐠀
      }
    }
    paths: {
      [K in label.key<'/store/order' | '/store/order/{id}'>]: {
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
              content?: {
                [media𛰃type: label.key<'text/html' | 'application/json'>]: {
                  schema?: 𐠀
                }
              }
              headers?: {
                [Header: label.key<'Content-Type' | 'Authorization'>]: {
                  schema?: 𐠀
                }
              }
            }
          }
        }
      }
    }
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

  interface lambda extends HKT { [-1]: Spec.F<this[0]> }
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
  type Paths<T> = Spec.doc<T>["paths"]
  type Components<T> = Spec.doc<T>["components"]
  type Schemas<T> = Spec.doc<T>["components"]["schemas"]
  type Recursive<T> = Spec.Schemas<T>[keyof Spec.Schemas<T>]
  type Operation<T> = Spec.Paths<T>["paths"][keyof Spec.Paths<T>["paths"]]
  type RequestBody<T> = ({} & Spec.Operation<T>)["requestBody"]
  type Headers<T> = {} & Spec.Response<T>["headers"]
  type Responses<T> = ({} & Spec.Operation<T>)["responses"]
  type ResponseParameters<T> = ({} & Spec.Operation<T>)["parameters"]
  type ResponseContent<T> = {} & Spec.Response<T>["content"]
  type Response<T> = Spec.Responses<T>[keyof Spec.Responses<T>]
  type Fixpoint = Spec.F<Schema>
}

declare namespace Spec { 
  export { 
    Spec_map as map,
    Spec_new as new,
  } 
}
function Spec() {}
namespace Spec {
  Spec.map = Spec_map
  Spec.new = Spec_new

  export function generate<T>(constraints?: arbitrary.Constraints): fc.Arbitrary<Spec.doc<Schema>> 
  export function generate<T>(constraints?: arbitrary.Constraints) {
    return arbitrary(constraints)
  }
}

const openapi_v3xx = "3.1.0"
const defaultInfo = {
  title: "",
  version: "0.0.0",
} satisfies Spec.doc["info"]

function Spec_new<T extends Spec.doc<Schema>>(spec: Partial<T>): T
function Spec_new<S>(): <T extends Spec.F<S>>(spec: T) => T 
function Spec_new(spec?: Partial<Spec.F<any>>) { 
  return spec === undefined 
    ? (spec: Partial<Spec.F<any>>) => Spec_new(spec)
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
    } satisfies Spec.doc<any>
}

function Spec_map<S, T>(doc: Spec.doc<S>, f: (s: S) => T): Spec.doc<T> {
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
