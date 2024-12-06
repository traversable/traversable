import { JsonPointer, is, tree } from "@traversable/core"
import { fn /* , forEach */ } from "@traversable/data"
import type { prop } from "@traversable/data"
import { Invariant } from "@traversable/registry"

export interface Dictionary
  <T = unknown> { [x: string]: T }

export interface Predicate<
  S = {} | null | undefined, 
  // T extends S = S
> { (src: S, path: prop.any[]): boolean
    // (src: S, path: prop.any[]): src is T 
  }

/** @internal */
const Object_entries = globalThis.Object.entries
/** @internal */
const Object_keys = globalThis.Object.keys
/** @internal */
const Array_isArray = globalThis.Array.isArray

/**
 * ## {@link query `openapi.query`}
 * 
 * Given a record or an array of predicates, {@link find `openapi.filter`} 
 * returns a function that expects a search tree.
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

query([(x: number) => x > 1])

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

export function accessors<R>(...predicates: readonly Predicate<R>[]): <T extends {}>(tree: T) => { [x: string]: { [y: string]: unknown } }
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

type DocLike = { 
  paths?: {}, 
  components?: { schemas?: {} },
}

const qualifier = "/components/schemas"
const qualify = (key: string) => qualifier + key
const unqualify = (key: string) => key.startsWith(qualifier) ? key.substring(qualifier.length) : key

export function normalize<R>(...predicates: readonly Predicate<R>[]): 
  <T extends DocLike>(tree: T) => {}

export function normalize<R>(...predicates: readonly Predicate<R>[]) {
  return <T extends DocLike>(doc: T) => {
    const predicate = tree.has("schema", tree.has("type", is.string))
    const getSchemas = accessors(predicate)
    const access = getSchemas(doc)

    let refs: { [x: string]: {} } = {}
    for (const k in access) {
      // clone the element so the new value doesn't point to a pointer -- 
      // otherwise the mutation will propogate, and we lose the original value
      void (refs[k] = globalThis.structuredClone(access[k]))
    }

    // Here we rip out all the nested schemas from ex_07
    void globalThis.Object
      .entries(access)
      .forEach(
        fn.flow(
          ([pathname, accessor]) => {
            // console.log("accessor BEFORE", accessor)
            // console.log("accessor.schema", accessor.schema)
             void (accessor.schema = { $ref: pathname })
            //  console.log("accessor AFTER", accessor)
              const path = JsonPointer.toPath(pathname).slice(1)
              // console.log("path", path)
              // console.log("tree.get(refs, ...", tree.get(doc, ...path))
          }
        )
    )
    if (!doc.components) void (doc.components = { schemas: {} })
    doc.components.schemas = { ...doc.components?.schemas, ...refs }

    return doc


    /**
     * @example
     *  // We'll be mutating `ex_07`, so here we make a copy of it.
     *  // That way, we have something to compare it to when we're done rebuilding it
     *  const ex_08 = globalThis.structuredClone(ex_07)
     *
     *  // A few helpers to simulate the real use case that we have, which is
     *  // "moving" schemas from their various levels of nesting throughout the OpenAPI document,
     *  // into a top-level declaration with the other schemas
     *  const qualifier = "#/components/schemas"
     *  const qualify = (key: string) => qualifier + key
     *  const dequalify = (key: string) => key.startsWith(qualifier) ? key.substring(qualifier.length) : key
     *  const Qualifier = {
     *    to: qualify,
     *    from: dequalify,
     *  }
     *
     *  const getDocumentSchemas = openapi.accessors(tree.has("schema", tree.has("type", is.string)))
     *  let accessors = getDocumentSchemas(ex_07)
     *
     *  console.log("accessors", accessors)
     *
     *  ///////////////
     *  ///   ACT   ///
     *  ///////////////
     *
     *  // Here we create save all the nested schemas in an object called `refs`, where
     *  // each key in `refs` is a fully qualified, JsonPointer-escaped path that resolves
     *  // to a schema in `ex_07`
     *
     *  let refs: { [x: string]: unknown } = {}
     *  for (const k in accessors) {
     *    // clone the element so the new value doesn't point to a pointer -- otherwise
     *    // the mutation will propogate, and we lose the original value
     *    void (refs[Qualifier.to(k)] = globalThis.structuredClone(accessors[k]))
     *  }
     *
     *  // Here we rip out all the nested schemas from ex_07
     *  void globalThis.Object
     *    .entries(accessors)
     *    .forEach(
     *      fn.flow(
     *        ([pathname, accessor]) => [Qualifier.to(pathname), accessor] satisfies [string, unknown],
     *        ([pathname, accessor]) => {
     *          void (accessor.schema = { $ref: pathname })
     *        }
     *      )
     *    )
     *
     *  // Here we rebuild ex_07 by piecing it back together from the refs we previously ripped out
     *  for (const k in accessors) {
     *    const accessor = accessors[k]
     *    const refPath = qualify(k)
     *    const ref: { schema: unknown } = refs[refPath] as never
     *    // const accessed = tree.get(ex_07 as never, ...unqualifiedPath)
     *    // const referenced = tree.get(refs, ...unqualifiedPath)
     *    accessor.schema = ref.schema
     *  }
     * 
     * 
     */


  }
}

export declare namespace normalize {
  type dependencies = [
    cursor: {} | null | undefined, 
    path: prop.any[], 
    access: { [x: string]: {} | null | undefined },
    qs: readonly Predicate[],
    root: {},
  ]
}
