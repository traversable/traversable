
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
