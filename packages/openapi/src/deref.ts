import { is, tree } from "@traversable/core"
import { Invariant } from "@traversable/registry"

export declare namespace deref {
  type Options<T> = {
    predicate?(u: unknown): u is T
  }
}

/** 
 * ## {@link deref `openapi.deref`}
 * 
 * Given a path and optionally a predicate to apply to the
 * value at that path, returns a function that accepts an
 * OpenAPI document, and resolves the path with a non-ref
 * node that satisfies the predicate (if one was provided).
 * 
 * If {@link deref `openapi.deref`} is unable to resolve
 * the node at that path, or if the predicate fails, it 
 * returns `undefined`.
 * 
 * If {@link deref `openapi.deref`} encounters a circular
 * reference while following refererences, it throws an
 * Error.
 */
export function deref<T>(path: string, guard: (u: unknown) => u is T): (document: { paths: { [x: string]: {} } }) => T | undefined
export function deref(path: string): (document: { paths: { [x: string]: {} } }) => {} | undefined
export function deref(_: string, guard?: (u: unknown) => boolean) {
  let seen = new WeakSet()
  function go(_: string, guard: (u: unknown) => boolean, document: { paths: { [x: string]: {} } }) {
    const path = _.startsWith("#/") ? _.slice("#/".length).split("/") : _.split("/")
    let cursor: unknown = tree.get(document, ...path)
    if (!cursor) return void 0

    while (tree.has("$ref", is.string)(cursor)) {
      if (seen.has(cursor)) return Invariant.CircularReferenceError()("openapi.deref", [cursor, path])
      seen.add(cursor)
      cursor = go(cursor["$ref"], guard, document)
    }

    return guard(cursor) ? cursor : void 0
  }
  return (document: { paths: { [x: string]: {} } }) => go(_, guard ?? (() => true), document)
}

deref.defaults = { 
  predicate: (_: any): _ is any => true,
} satisfies Required<deref.Options<unknown>>
