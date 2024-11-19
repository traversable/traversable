import { type nonempty, type number, type prop, type props, type string } from "@traversable/data"

// TODO: move this to a dedicated place
/** 
 * ## {@link JsonPointer_unescape `JsonPointer.unescape`}
 * 
 * As specified in 
 * [`RFC-6901`](https://datatracker.ietf.org/doc/html/rfc6901#section-3).
 */
function JsonPointer_unescape<T extends prop.any>(component: T): JsonPointer.unescape<T>
function JsonPointer_unescape<T extends prop.any>(component: T, str = `${component}`) {
  if (str.indexOf("~") === -1) return str
  let 
    out = "",
    char: string,
    next: string
  for (let ix = 0, len = str.length; ix < len; ix++) {
    char = str[ix]
    next = str[ix + 1] ?? ""
    if (char === "~" && next === "1") void ((out += "/"), ix++)
    else if (char ===  "~" && next === "0") void ((out += "~"), ix++)
    else void (out += char)
  }
  return out
}

/** 
 * ## {@link JsonPointer_escape `JsonPointer.escape`}
 * 
 * As specified in 
 * [`RFC-6901`](https://datatracker.ietf.org/doc/html/rfc6901#section-3).
 */
function JsonPointer_escape<T extends string.finite<T>>(component: T): JsonPointer.escape<T> 
function JsonPointer_escape<T extends number.finite<T>>(component: T): JsonPointer.escape<T> 
function JsonPointer_escape(component: string): string
function JsonPointer_escape(component: number): `${number}`
function JsonPointer_escape(component: string | number): `${number}`
function JsonPointer_escape(component: prop.any) {
  const chars = [...`${component}`]
  if (chars.indexOf("~") === -1 && chars.indexOf("/") === -1) return `${component}`
  let 
    out = "",
    char: string | undefined

  while (
    char = chars.shift(), 
    char !== undefined
  ) {
    if (char === "/") void (char = "~1")
    if (char === "~") void (char = "~0")
    void (out += char)
  }
  return out
}

/** 
 * ## {@link JsonPointer_fromPath `JsonPointer.fromPath`}
 * 
 * As specified in 
 * [`RFC-6901`](https://datatracker.ietf.org/doc/html/rfc6901#section-3).
 * 
 * @example
 * const ex_01 = JsonPointer.fromPath("f~o/o", "bar", "1", "/baz~")
 * //      ^?  const ex_01: "/f~0o~1o/bar/1/~1baz~0"
 * console.log(ex_01) // => "/f~0o~1o/bar/1/~1baz~0"
 */
function JsonPointer_fromPath<T extends props.any>(path: [...T]): JsonPointer.fromPath<T>
function JsonPointer_fromPath(path: props.any): unknown {
  if (path.length === 0) return ""
  else if (path.length === 1 && path[0] === "") return "/"
  else {
    const [head, ...tail] = path
    return [
      ...head === "" ? [head] : ["", head], 
      ...tail
    ].map(JsonPointer_escape).join("/")
  }
}

/** 
 * ## {@link JsonPointer_toPath `JsonPointer.toPath`}
 * 
 * As specified in 
 * [`RFC-6901`](https://datatracker.ietf.org/doc/html/rfc6901#section-3).
 * 
 * @example
 * const ex_01 = JsonPointer.toPath("/f~0o~1o/bar/1/~1baz~0") 
 * //      ^?  const ex_01: ["", "f~o/o", "bar", "1", "/baz~"]
 * console.log(ex_01) // => ["", "f~o/o", "bar", "1", "/baz~"]
 */
function JsonPointer_toPath<T extends prop.any>(component: T): JsonPointer.toPath<T>
function JsonPointer_toPath(component: prop.any, _ = `${component}`): unknown {
  if (!_) return []
  else if (_ === "/") return [""]
  else if (!_.startsWith("/")) 
    throw globalThis.Error("Expected JsonPointer to start with '/', got " + component)
  else {
    const [h, ...t] = `${component}`.split("/")
    let out: string[] = [h?.startsWith("/") ? h.substring(1) : h]
    for (let ix = 0, len = t.length; ix < len; ix++)
      void out.push(JsonPointer_unescape(t[ix]))
    return out
  }
}

export function JsonPointer() {}
export namespace JsonPointer {
  void (JsonPointer.toPath = JsonPointer_toPath)
  void (JsonPointer.fromPath = JsonPointer_fromPath)
  void (JsonPointer.escape = JsonPointer_escape)
  void (JsonPointer.unescape = JsonPointer_unescape)
}
export declare namespace JsonPointer {
  export {
    JsonPointer_toPath as toPath,
    JsonPointer_fromPath as fromPath,
    JsonPointer_escape as escape,
    JsonPointer_unescape as unescape,
  }
}

export declare namespace JsonPointer {
  type toPath<T extends prop.any | props.any> 
    = T extends props.any 
    ? { -readonly [K in keyof T]: JsonPointer.toPath.loop<`${T[K] & prop.any}`, "", [""]>[0] } 
    : T extends "" ? []
    // : T extends "/" ? ["/"]
    : T extends `/${string}` ? JsonPointer.toPath.loop<`${T & prop.any}`, "", [""]>
    : never
    ;
  namespace toPath {
    type loop<I extends string, Acc extends string, O extends string[]>
      = [I] extends [`${infer H}${infer T}${infer TS}`]
      ? [H] extends ["/"] ? JsonPointer.toPath.loop<`${T}${TS}`, "", Acc extends "" ? O : [...O, Acc]>
      : [H, T] extends ["~", "0"] ? JsonPointer.toPath.loop<TS, `${Acc}~`, O>
      : [H, T] extends ["~", "1"] ? JsonPointer.toPath.loop<TS, `${Acc}/`, O>
      : JsonPointer.toPath.loop<`${T}${TS}`, `${Acc}${H}`, O>
      : [...O, `${Acc}${I extends "/" ? "" : I}`]
      ;
  }

  type fromPath<T extends prop.any | props.any> 
    = JsonPointer.fromPath.loop<T extends prop.any ? [T] : T>

  type escape<T extends prop.any> = string extends T ? string : JsonPointer.escape.loop<`${T}`, "">
  namespace escape {
    type loop<I extends string, O extends string>
    = I extends nonempty.string<infer H, infer T>
    ? JsonPointer.escape.loop<
      T, 
      H extends "~" ? `${O}~0`
      : H extends "/" ? `${O}~1`
      : `${O}${H}`
    > : O
  }
  namespace fromPath {
    type loop<
      T extends props.any, 
      U extends 
      | { [K in keyof T]: JsonPointer.escape<T[K]> }
      = { [K in keyof T]: JsonPointer.escape<T[K]> }
    > = JsonPointer.join<U, "">;
  }

  type unescape<T extends prop.any> = JsonPointer.unescape.loop<`${T}`, "">
  namespace unescape {
    type loop<I extends string, O extends string>
      = I extends `${infer H}~0${infer T}` ? JsonPointer.unescape.loop<T, `${O}${H}~`>
      : I extends `${infer H}~1${infer T}` ? JsonPointer.unescape.loop<T, `${O}${H}/`>
      : `${I}${O}`
      ;
  }
  type join<I extends props.any, O extends string>
    = I extends nonempty.props<infer H, infer T>
    ? join<T, `${O}/${H}`>
    : O
    ;
}




/*** 
 * STUFF IN THIS FILE MOVED FROM `openapi/reffer`
 */

//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////
///                          vvv  MOVE OR DELETE  vvv                          ///
//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////

// export function unsafeSet<const T extends keys.any>(path: T, value: {}) {
//   return (tree: { [x: keyof any]: any }) => path.reduce(
//     (acc, key, ix) => ix === path.length - 1 
//       ? void (acc[key] = value)
//       : acc?.[key], 
//     tree
//   )
// }

// type treeFrom<P extends props.any, T>
//   = P extends readonly [...infer Todo extends props.any, infer Last extends prop.any] 
//   ? treeFrom<Todo, { [K in Last]: T }> : T

// function treeFrom<const P extends props.any, T>(path: P, leaf?: T): treeFrom<P, T>
// function treeFrom<const P extends props.any, T>(path: [...P], leaf: T = {} as never) {
//   let key: string | number | undefined
//   let out: unknown = leaf
//   while (void (key = path.pop()), key !== undefined) {
//     if (typeof key === "number") {
//       let struct = []
//       void (struct[key] = out)
//       void (out = struct)
//     } else {
//       let struct: { [y: string]: unknown } = {}
//       void (struct[key] = out)
//       void (out = struct)
//     }
//   }
//   return out
// }


// export type get<P extends props.any, T>
//   = P extends readonly [infer Head extends keyof T, ...infer Tail extends props.any] 
//   ? get<Tail, T[Head]> 
//   : [P] extends [readonly [any]] ? get.not_found 
//   : T

// export function get<P extends props.any>(...path: [...P]): <const T extends { [x: string]: unknown }>(tree: T) => get<P, T>
// export function get<P extends props.any>(...path: [...P]) {
//   return <const T extends { [x: string]: unknown }>(tree: T) => {
//     let out: unknown = tree
//     let key: string | number | undefined

//     while (
//       key = path.shift(), 
//       key !== undefined && (key = `${key}`),
//       key !== undefined
//     ) {
//       if (has(key)(out)) void (out = out[key])
//       else void (out = get.not_found)
//     }

//     return out
//   }
// }

// export namespace get {
//   export type not_found = typeof not_found
//   export const not_found = Symbol.for("@openapi/reffer/get::not_found")
//   export const isNotFound = (u: unknown): u is get.not_found => u === get.not_found
// }


// function setDeep<const P extends props.any, A>(path: [...P], leaf: A): {
//   <S extends { [x: number]: unknown }>(tree: S): {}
//   <S extends { [x: string]: unknown }>(tree: S): {}
// }
// function setDeep<const P extends props.any, A>(path: [...P], leaf: A) {
//   return <S extends { [x: string | number]: any }>(tree: S) => {
//     let seen: P[number][] = []
//     let cursor: unknown = tree
//     let key: string | number | undefined
//     while (
//       key = path.shift(), 
//       key !== undefined && (key = `${key}`),
//       key !== undefined
//     ) {
//       if (!is.record(cursor)) return tree
//       else {
//         void seen.push(key)
//         if (has(key, or(is.array, is.record))(cursor))
//           void (cursor = cursor[key])
//         else 
//           void (cursor[key] = path.length === 0 ? leaf : treeFrom(path)), 
//           void (cursor = cursor[key])
//       }
//     }
//     return tree
//   }
// }

// :
// // ? T extends `0${infer U}` ? JsonPointer.unescape.loop<U, `${O}~`>
// : T extends `1${infer U}` ? JsonPointer.unescape.loop<U, `${O}/`>
// : JsonPointer.unescape.loop<T, `${O}${H}`>
