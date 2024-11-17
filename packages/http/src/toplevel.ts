import { fn } from "@traversable/data"
import type { newtype } from "any-ts"

export type vars<
  T extends { path?: {}; body?: unknown; query?: {}; cookies?: {}; headers?: {} } = {
    path?: {}
    body?: unknown
    query?: {}
    cookies?: {}
    headers?: {}
  },
> = never | Vars<T>
export const Verb = { get: "get", put: "put", post: "post", delete: "delete" } as const
export type Verb = (typeof Verb)[keyof typeof Verb]
export interface Vars<T extends vars> extends newtype<T> {}
export const responseIsOk = (response: globalThis.Response): response is globalThis.Response & { ok: true } =>
  true
export const RequestInit: (init: globalThis.RequestInit) => globalThis.RequestInit = fn.identity

export interface Request<Body extends RequestBody.any = RequestBody.any>
  extends globalThis.Omit<globalThis.Response, "json"> {
  json(): globalThis.Promise<Body>
}

export interface Response<StatusCode extends number = number>
  extends globalThis.Omit<globalThis.Response, "status"> {
  status: StatusCode
}

export declare namespace RequestBody {
  export type FileOrFileName = string | globalThis.File
  export interface Multipart extends globalThis.Record<string, FileOrFileName | readonly FileOrFileName[]> {}

  export { Body_any as any }
  export type Body_any =
    // | JSON.any
    string | number | boolean | null | undefined | RequestBody.Multipart
}
