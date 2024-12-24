import { JsonPointer, is, tree } from "@traversable/core"
import { fn } from "@traversable/data"
import type { prop, props } from "@traversable/data"
import { Invariant } from "@traversable/registry"
import type { Predicate } from "./types.js"

export interface Dictionary
  <T = unknown> { [x: string]: T }

/** @internal */
const Object_entries = globalThis.Object.entries
/** @internal */
const Object_keys = globalThis.Object.keys
/** @internal */
const Array_isArray = globalThis.Array.isArray

/**
 * ## {@link query `openapi.query`}
 * 
 * Search an OpenAPI document for nodes that match a query. 
 * 
 * The semantics of {@link query `openapi.query`} depend on whether the set
 * of predicates was passed as an array (which implies that _order_ is 
 * important for your use case) or as an associative array (which implies
 * that keeping track of _which_ predicate(s) a given node satisfied is
 * important to you).
 * 
 * See also:
 * - {@link openapi.find `openapi.find`}
 * - {@link openapi.filter `openapi.filter`}
 * 
 * @example
 *  import { openapi } from "@traversable/openapi"
 *  import { is, tree } from "@traversable/core"
 * 
 *  openapi.query([
 *    tree.has("$ref", is.string),
 *    tree.has("paths", "/api/v1/pets", )
 *  ])({ 
 *    "paths": {
 *       "/api/v1/pets": { get: {} }
 *    },
 *    "components": {
 *      "schemas": {
 *      }
 *    }
 *  })
 * 
 * ": [{}, { "type": "object", "properties": { "id": { "$ref": "#/xyz" }}}] })
 */
export function query<Q extends Record<string, Predicate>>(predicates: Q): 
  <T extends {}>(tree: T) => { [K in keyof Q]+?: prop.any[][] }
export function query<Q>(predicates: readonly Predicate<Q>[]): 
  <T extends {}>(tree: T) => prop.any[][]
export function query(qs: { [x: number]: Predicate }) /// impl.
  { return Array_isArray(qs) ? find(...qs) : filter(qs) }

/**
 * ## {@link find `openapi.find`}
 * 
 * Given an array of predicates, {@link find `openapi.find`} returns a function
 * that expects a search tree.
 * 
 * The traversal is depth-first and complete, but importantly, it will stop
 * trying predicates once it finds one that passes for a given node/path pair.
 * If/when it does, it adds the path to that node to the output array, and 
 * continues searching.
 * 
 * See also:
 * - {@link openapi.filter `openapi.filter`}
 * - {@link openapi.query `openapi.query`}
 */
export function find<R>
  (...predicates: readonly Predicate<R>[]): 
    <T extends {}>(tree: T) => prop.any[][] 

export function find(...qs: readonly Predicate[]) 
  { return (in_: {}, _out = []) => (void find.loop(in_, [], _out, qs), _out) }

export declare namespace find {
  type dependencies = [
    src: {} | null | undefined, 
    path: prop.any[],
    refs: prop.any[][], 
    qs: readonly Predicate[], 
  ]
}

/// impl.
find.loop = fn.loopN<find.dependencies, void>((src, ks, refs, qs, loop): void => {
  for (const q of qs) if (q(src, ks)) { 
    void refs.push(ks)
    break 
  }
  switch (true) {
    case is.nullable(src): break
    case is.primitive(src): break
    case is.any.array(src): return src.forEach((x, ix) => loop(x, [...ks, ix], refs, qs))
    case is.any.object(src): return Object_keys(src).forEach((k) => loop(src[k], [...ks, k], refs, qs))
    default: return Invariant.IllegalState("@traversable/openapi/find", src)
  }
})

/**
 * ## {@link filter `openapi.filter`}
 * 
 * Given a record of predicates, {@link find `openapi.filter`} returns a function
 * that expects a search tree.
 * 
 * The traversal is depth-first and complete, but importantly (unlike 
 * {@link find `openapi.find`}), it tries every predicate on every node, and keeps
 * track of which nodes satisfies which predicates by storing the path where it
 * encountered the passing node in the corresponding key in the output object.
 * 
 * See also:
 * - {@link openapi.find `openapi.find`}
 * - {@link openapi.query `openapi.query`}
 */
export function filter
  <const Q extends Dictionary<Predicate>>(predicates: Q): 
    <T extends {}>(tree: T) => { [K in keyof Q]+?: prop.any[][] } 
export function filter(qs: { [x: string]: Predicate }) /// impl.
  { return (in_: {}, _out = {}) => (filter.loop(in_, [], _out, Object_entries(qs)), _out) }

export declare namespace filter {
  type dependencies = [
    node: {} | null | undefined, 
    path: prop.any[], 
    refs: { [x: string]: unknown[] }, 
    qs: readonly [string, Predicate][]
  ]
}

filter.loop = fn.loopN<filter.dependencies, void>((src, ks, refs, qs, loop): void => {
  for (const [k, q] of qs) if (q(src, ks)) (
    void (refs[k] ??= []),
    void (refs[k].push(ks))
  )
  switch (true) {
    case is.nullable(src): break
    case is.primitive(src): break
    case is.any.array(src): return src.forEach((x, ix) => loop(x, [...ks, ix], refs, qs))
    case is.any.object(src): return Object_keys(src).forEach((k) => loop(src[k], [...ks, k], refs, qs))
    default: return Invariant.IllegalState("@traversable/openapi/filter", src)
  }
})

export function accessors<R extends {}>(...guards: ((u: unknown) => u is R)[]): <T extends {}>(tree: T) => { [x: string]: R }
export function accessors<R extends { [x: string]: unknown }>(...predicates: readonly Predicate<R>[]): <T extends {}>(tree: T) => { [x: string]: R }
export function accessors(...qs: readonly Predicate[]) {
  return (in_: {}, _out: {} = {}) => (accessors.loop(in_, [], _out, qs, in_), _out)
}

export declare namespace accessors {
  type dependencies = [
    cursor: {} | null | undefined, 
    path: prop.any[], 
    access: { [x: string]: {} | null | undefined },
    qs: readonly Predicate[],
    root: {},
  ]
}

accessors.loop = fn.loopN<accessors.dependencies, void>((cursor, ks, access, qs, root, loop): void => {
  for (const q of qs) if (q(cursor, ks)) {
    access[JsonPointer.fromPath(ks) || "/"] = tree.accessor(...ks)(root)
    // console.log("cursor", cursor)
    // console.log("ks", ks)
  }
    switch (true) {
      case is.nullable(cursor): break
      case is.primitive(cursor): break
      case is.any.array(cursor): 
        return cursor.forEach((x, ix) => loop(x, [...ks, ix], access, qs, root))
      case is.any.object(cursor): 
        return Object_keys(cursor).forEach((k) => loop(cursor[k], [...ks, k], access, qs, root))
      default: 
        return Invariant.IllegalState("@traversable/openapi/accessors", cursor)
    }

})

const qualifier = "/components/schemas"
const qualify = (key: string) => qualifier + key
const unqualify = (key: string) => key.startsWith(qualifier) ? key.substring(qualifier.length) : key


export declare namespace normalize {
  type dependencies = [
    cursor: {} | null | undefined, 
    path: prop.any[], 
    access: { [x: string]: {} | null | undefined },
    qs: readonly Predicate[],
    root: {},
  ]
}
