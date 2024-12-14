import { is, tree } from "@traversable/core"
import { fn } from "@traversable/data"

import { accessors } from "./query.js"
import type { DocLike, Predicate } from "./types.js"

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
      // otherwise the mutation will propogate, and we lose the original
      void (refs[k + "/schema"] = globalThis.structuredClone(access[k].schema)!)
    }

    // Here we rip out all the nested schemas from ex_07
    void globalThis.Object
      .entries(access)
      .forEach(
        fn.flow(
          ([pathname, accessor]) => void (accessor.schema = { $ref: pathname + "/schema" })
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
     *    // the mutation will propogate, and we lose the original
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
