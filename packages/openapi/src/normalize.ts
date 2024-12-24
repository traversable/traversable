import { JsonPointer, core, is, tree } from "@traversable/core"
import { fn, type props } from "@traversable/data"

import type { Partial } from "@traversable/registry"
import { accessors } from "./query.js"
import type { DocLike, Predicate } from "./types.js"

type Options = Partial<{
  sourceFocus: [...props.any]
  targetFocus: string
}>

const defaults = {
  sourceFocus: ["components", "schemas"] as const satisfies string[],
  targetFocus: ["schema"] as const satisfies string[],
} as const


const passedOptions = <R>(
  args: 
  | [...readonly Predicate<R>[]]
  | [options: Options, ...predicates: Predicate<R>[]]
): args is [options: Options, ...predicates: Predicate<R>[]] => typeof args[0] !== "function"

function separateArguments<R>(
  args: 
    | [...readonly Predicate<R>[]]
    | [options: Options, ...predicates: Predicate<R>[]]
): [Predicate<R>[], { source: string[], target: string }] 
function separateArguments<R>(
  args: 
    | Predicate<R>[] 
    | [Options, ...Predicate<R>[]]): {} {
  if (passedOptions(args)) return [args.slice(1), { 
    source: args[0]?.sourceFocus ?? defaults.sourceFocus,
    target: args[0]?.targetFocus ?? defaults.targetFocus, 
  }]
  else return [args, { 
    source: defaults.sourceFocus, 
    target: defaults.targetFocus 
  }]
}

export function normalize<R>(...predicates: [...Predicate<R>[]]): 
  <T extends DocLike>(tree: T) => {}
export function normalize<R>(options: Options, ...predicates: [...Predicate<R>[]]): 
  <T extends DocLike>(tree: T) => {}
export function normalize<R>(...args: Predicate<R>[] | [options: Options, ...predicates: Predicate<R>[]]) {
  const [predicates, { source, target }] = separateArguments(args)

  const sourceLens: (shape: {}) => {} | undefined | null = tree.get.defer(...source)
  const targetPointer = JsonPointer.fromPath([target])
  const sourcePointer = `#${JsonPointer.fromPath(source)}` as const
  const targetPredicate = tree.has(
    ...target, 
    core.anyOf(
      tree.has("type", is.string),
      tree.has("allOf", is.any.array),
      tree.has("anyOf", is.any.array),
      tree.has("oneOf", is.any.array),
    )
  )

  return <T extends DocLike>(doc: T) => {
    const getSchemas = accessors(targetPredicate)
    const access = getSchemas(doc)

    let refs: { [x: string]: {} } = {}
    for (const k in access) {
      // clone the element so the new value doesn't point to a pointer -- 
      // otherwise the mutation will propogate, and we lose the original
      void (refs[k + targetPointer] = globalThis.structuredClone(tree.get.defer(...target)(access[k])!))
    }

    // Here we rip out all the nested schemas
    void globalThis.Object
      .entries(access)
      .forEach(
        fn.flow(
          ([pathname, accessor]) => void (accessor[target] = { $ref: sourcePointer + pathname + targetPointer })
        )
    )
    if (!doc.components) void (doc.components = { schemas: {} })
    const schemas = { ...sourceLens(doc), ...refs }
    
    
    return (tree.mutate(...source)(doc)(schemas), doc)
  }
}

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
