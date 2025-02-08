import { type JsonSchema, type fc, t } from '@traversable/core'
import { fn, map } from '@traversable/data'
import type { _, autocomplete } from '@traversable/registry'
import type { HKT } from '@traversable/registry'

import { arbitrary, defaults, type doc as document, type parameter } from './document.js'
import type { Schema as Schema_ } from './schema/exports.js'
import type { $ref } from './types.js'
import Constraints = arbitrary.Constraints

export {
  OpenAPI,
}

type Schema = Schema_.any | $ref

declare namespace OpenAPI {
  namespace param {
    interface path<T> {
      in: autocomplete<'path'>
      name: string
      schema: T
      required: boolean
      style?: parameter.style.path
      explode?: boolean
    }
    interface query<T> {
      in: autocomplete<'query'>
      name: string
      schema: T
      required?: boolean
      style?: parameter.style.query
      explode?: boolean
      deprecated?: boolean
    }
    interface header<T> {
      in: autocomplete<'header'>
      name: string
      schema: T
      required?: boolean
      style?: parameter.style.header
      explode?: boolean
      deprecated?: boolean
    }
    interface cookie<T> {
      in: autocomplete<'cookie'>
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
   * Used only to give the reader a visual hint about what key's an object
   * is usually expected to have, without actually adding a constraint.
   */
  type Etc<T> = never | { [x: string]: T[keyof T] }

  type doc<𐠀 = unknown> = document.meta & {
    openapi: autocomplete<'3.1.0'>
    components: {
      schemas: Etc<{
        [schemaName in 'UserSchema' | 'OrderSchema' | 'Etc...']: 𐠀
      }>
    }
    paths: Etc<{
      [path in '/store/order' | '/store/order/{id}' | '/etc/etc...']: {
        [K in 'get' | 'post' | 'put' | 'delete' | 'trace']+?: {
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
  type Paths<T> = OpenAPI.doc<T>['paths']
  type Components<T> = OpenAPI.doc<T>['components']
  type Schemas<T> = OpenAPI.doc<T>['components']['schemas']
  type Recursive<T> = OpenAPI.Schemas<T>[keyof OpenAPI.Schemas<T>]
  type Operation<T> = OpenAPI.Paths<T>['paths'][keyof OpenAPI.Paths<T>['paths']]
  type RequestBody<T> = ({} & OpenAPI.Operation<T>)['requestBody']
  type Headers<T> = {} & OpenAPI.Response<T>['headers']
  type Responses<T> = ({} & OpenAPI.Operation<T>)['responses']
  type ResponseParameters<T> = ({} & OpenAPI.Operation<T>)['parameters']
  type ResponseContent<T> = {} & OpenAPI.Response<T>['content']
  type Response<T> = OpenAPI.Responses<T>[keyof OpenAPI.Responses<T>]
  type Fixpoint = OpenAPI.F<Schema>
}

/** @internal */
const HasSchema = <const T extends t.type>(schema: T) => t.object({ schema: t.optional(schema) })
/** @internal */
const HasSchemaRecord = fn.flow(HasSchema, t.record)

type Parameter<T> = t.oneOf<[
  Parameter.Cookie<T>,
  Parameter.Header<T>,
  Parameter.Path<T>,
  Parameter.Query<T>,
]>

function Parameter<T extends t.type>(schema: T): Parameter<T> {
  return t.oneOf(
    Parameter.Cookie(schema),
    Parameter.Header(schema),
    Parameter.Path(schema),
    Parameter.Query(schema),
  ) satisfies Parameter<T>
}
namespace Parameter {
  export const Style = {
    Cookie: t.enum("form"),
    Header: t.enum("simple"),
    Path: t.enum("simple", "matrix", "label"),
    Query: t.enum("form", "spaceDelimited", "pipeDelimited", "deepObject"),
  } as const

  export interface Cookie<T> extends  t.object<{
    in: t.const<'cookie'>;
    name: t.string
    schema: T
    required: t.optional<t.boolean>
    style: t.optional<typeof Style.Cookie>
    explode: t.boolean
    deprecated: t.boolean
  }> {}
  export function Cookie<T extends t.type>(schema: T): Cookie<T>
  export function Cookie<T extends t.type>(schema: T) {
    return t.object({ 
      in: t.const('cookie'),
      name: t.string(),
      schema,
      required: t.optional(t.boolean()),
      style: t.optional(Style.Cookie),
      explode: t.boolean(),
      deprecated: t.boolean(),
    }) satisfies Cookie<T>
  }
  ///
  export interface Header<T> extends t.object<{ 
    in: t.const<'header'> 
    name: t.string
    schema: T
    required: t.boolean
    style: t.optional<typeof Style.Header>
    explode: t.optional<t.boolean>
    deprecated: t.optional<t.boolean>
  }> {}

  export function Header<T extends t.type>(schema: T): Header<T>
  export function Header<T extends t.type>(schema: T) {
    return t.object({ 
      in: t.const('header'),
      name: t.string(),
      schema,
      required: t.boolean(),
      style: t.optional(Style.Header),
      explode: t.optional(t.boolean()),
      deprecated: t.optional(t.boolean()),
    }) satisfies Header<T>
  }
  ///
  export interface Path<T> extends t.object<{ 
    in: t.const<'path'> 
    name: t.string
    schema: T
    required: t.boolean
    style: t.optional<typeof Style.Path>
    explode: t.optional<t.boolean>
  }> {}
  export function Path<T extends t.type>(schema: T): Path<T>
  export function Path<T extends t.type>(schema: T) {
    return t.object({
      in: t.const('path'),
      name: t.string(),
      schema,
      required: t.boolean(),
      style: t.optional(Style.Path),
      explode: t.optional(t.boolean()),
    }) satisfies Path<T>
  }
  ///
  export interface Query<T> extends t.object<{
    in: t.const<'query'>;
    name: t.string
    schema: T
    required: t.optional<t.boolean>
    style: t.optional<typeof Style.Query>
    explode: t.optional<t.boolean>
    deprecated: t.optional<t.boolean>
  }> {}
  export function Query<T extends t.type>(schema: T): Query<T>
  export function Query<T extends t.type>(schema: T) {
    return t.object({
      in: t.const('query'),
      name: t.string(),
      schema,
      required: t.optional(t.boolean()),
      style: t.optional(Style.Query),
      explode: t.optional(t.boolean()),
      deprecated: t.optional(t.boolean()),
    }) satisfies Query<T>
  }
  //
  void (Cookie.any = Cookie(t.any()))
  void (Header.any = Header(t.any()))
  void (Path.any = Path(t.any()))
  void (Query.any = Query(t.any()))
}

function Headers<const T extends t.type>(schema: T) {
  return HasSchemaRecord(schema)
}

function Response<const T extends t.type>(schema: T) {
  return t.object({
    description: t.string(),
    content: t.optional(
      t.record(
        t.object({
          schema: t.optional(schema),
        })
      )
    )
  })
}

function RequestBody<const T extends t.type>(schema: T) {
  return t.object({
    required: t.optional(t.boolean()),
    content: t.optional(t.record(t.object({ schema: t.optional(schema)})))
  })
}

function Operation<const T extends t.type>(schema: T) {
  return t.object({
    parameters: t.optional(t.array(Parameter(schema))),
    responses: t.optional(Response(schema)),
    requestBody: t.optional(RequestBody(schema)),
    headers: t.optional(Headers(schema)),
  })
}

function PathItem<const T extends t.type>(schema: T) {
  return t.object({
    get: t.optional(Operation(schema)),
    post: t.optional(Operation(schema)),
    put: t.optional(Operation(schema)),
    delete: t.optional(Operation(schema)),
    trace: t.optional(Operation(schema)),
  })
}

function Path<const T extends t.type>(schema: T) {
  return t.record(PathItem(schema))
}

function Schema<const T extends t.type>(schema: T) {
  return t.oneOf(
    Schema.null,
    Schema.boolean,
    Schema.integer,
    Schema.number,
    Schema.string,
    Schema.const,
    Schema.enum,
    Schema.allOf(schema),
    Schema.anyOf(schema),
    Schema.oneOf(schema),
    Schema.array(schema),
    Schema.tuple(schema),
    Schema.record(schema),
    Schema.object(schema),
  )
}

Schema.null = () => t.object({ type: t.const('null') })
Schema.boolean = () => t.object({ type: t.const('boolean') })
Schema.integer = () => t.object({ type: t.const('integer') })
Schema.number = () => t.object({ type: t.const('number') })
Schema.string = () => t.object({ type: t.const('string') })
Schema.const = <const T>(value: T) => t.object({ const: t.const(value) })
Schema.enum = <const T extends readonly _[]>(...members: T) => t.object({ enum: t.enum(members) })
namespace Schema {
  export function allOf<const T extends t.type>(schema: T) { return t.object({ oneOf: t.array(schema) }) }
  export function anyOf<const T extends t.type>(schema: T) { return t.object({ anyOf: t.array(schema) }) }
  export function oneOf<const T extends t.type>(schema: T) { return t.object({ oneOf: t.array(schema) }) }
  //
  export function array<const T extends t.type>(schema: T) {
    return t.object({
      type: t.const('array'),
      items: schema,
    })
  }
  export function record<const T extends t.type>(schema: T) {
    return t.object({
      type: t.const('record'),
      required: t.array(t.string()),
      additionalProperties: t.optional(schema),
    })
  }
  export function tuple<const T extends readonly t.type[]>(...items: T) {
    return t.object({
      type: t.const('tuple'),
      items,
      minItems: t.const<T['length']>(items.length),
      maxItems: t.const<T['length']>(items.length),
    })
  }
  export function object<const T extends t.type>(schema: T) {
    return t.object({
      type: t.const('object'),
      required: t.array(t.string()),
      properties: t.record(schema),
      additionalProperties: t.optional(schema),
    })
  }
  //
  void (allOf.any = allOf(t.any()))
  void (anyOf.any = anyOf(t.any()))
  void (oneOf.any = oneOf(t.any()))
  void (array.any = array(t.any()))
  void (tuple.any = tuple(t.any()))
  void (record.any = record(t.any()))
  void (object.any = object(t.any()))
}

function Components<const T extends t.type>(schema: T) {
  return t.record(Schema(schema))
}

function OpenAPI<const T extends t.type>(schema: T) {
  return t.object({
    openapi: t.anyOf(t.const('3.1.0'), t.string()),
    components: Components(schema),
    paths: t.record(Path(schema)),
  })
}

void (Components.any = Components(t.any()))
void (Headers.any = Headers(t.any()))
void (Operation.any = Operation(t.any()))
void (Parameter.any = Parameter(t.any()))
void (Path.any = Path(t.any()))
void (PathItem.any = PathItem(t.any()))
void (RequestBody.any = RequestBody(t.any()))
void (Response.any = Response(t.any()))
void (Schema.any = Schema(t.any()))
void (OpenAPI.any = OpenAPI(t.any()))

const openapi_v3xx = '3.1.0'
const defaultInfo = {
  title: '',
  version: '0.0.0',
} satisfies OpenAPI.doc['info']

type Empty = typeof Empty
const Empty = {
  openapi: "3.1.0" as const,
  components: { schemas: {} },
  paths: {},
  info: { title: '' as const, version: '0.0.0' as const },
} satisfies OpenAPI.doc

function OpenAPI_from<T extends OpenAPI.doc>(spec: Partial<T>): T
// function OpenAPI_new<S>(): <T extends OpenAPI.F<S>>(spec: T) => T
function OpenAPI_from(spec?: Partial<OpenAPI.F<any>>) {
  return spec === undefined
    ? (spec: Partial<OpenAPI.F<any>>) => OpenAPI_from(spec)
    : {
      ...spec,
      openapi: spec.openapi ?? Empty.openapi,
      info: !spec.info ? Empty.info : {
        ...spec.info,
        title: spec.info.title ?? Empty.info.title,
        version: spec.info.version ?? Empty.info.version,
      },
      components: !spec.components ? Empty.components : {
        schemas: spec.components.schemas || Empty.components.schemas
      },
      paths: !spec.paths ? Empty.paths : spec.paths,
    } satisfies OpenAPI.doc<any>
}

function OpenAPI_new<const T extends Partial<OpenAPI.doc>, K extends Exclude<keyof Empty, keyof T>>(spec: T): T & { [P in K]: Empty[P] }
function OpenAPI_new<const T extends Partial<OpenAPI.doc>>(spec: T) { return OpenAPI_from(spec)}

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
        schemas: map(doc.components.schemas, f),
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

                  ///
                  ...parameters && ({
                  parameters: map(
                    parameters,
                    (parameter) => ({
                      ...parameter,
                      schema: f(parameter.schema),
                    })
                  )}),

                  ///
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

                  ///
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

                      ///
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
                })
              )
            )
          )
        )
      )
    }
  }
}

declare namespace OpenAPI {
  export {
    OpenAPI_new as new,
    OpenAPI_from as from,
    OpenAPI_map as map,
    Constraints,
    defaults,
  }
}

namespace OpenAPI {
  OpenAPI.new = OpenAPI_new
  OpenAPI.from = OpenAPI_from
  OpenAPI.map = OpenAPI_map
  OpenAPI.defaults = defaults

  export function generate(constraints?: arbitrary.Constraints): fc.Arbitrary<OpenAPI.doc<JsonSchema>>
  export function generate(constraints?: arbitrary.Constraints) {
    // TODO:                      ↆↆ fix this type assertion
    return arbitrary(constraints) as fc.Arbitrary<OpenAPI.doc<JsonSchema>>
  }
}
