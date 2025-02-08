import type { Traversable } from '@traversable/core'
import { JsonPointer, is, tree } from '@traversable/core'
import { fn, Graph, map } from '@traversable/data'
import { Invariant } from '@traversable/registry'

import type { OpenAPI } from './spec.js'

export declare namespace resolve {
  type Options<T> = {
    predicate?(u: unknown): u is T
  }
}

/** 
 * ## {@link resolve `Ref.resolve`}
 * 
 * Given a path and optionally a predicate to apply to the
 * value at that path, returns a function that accepts an
 * OpenAPI document, and resolves the path with a non-ref
 * node that satisfies the predicate (if one was provided).
 * 
 * If {@link resolve `Ref.resolve`} is unable to resolve
 * the node at that path, or if the predicate fails, it 
 * returns `undefined`.
 * 
 * If {@link resolve `Ref.resolve`} encounters a circular
 * reference while following refererences, it throws an
 * Error.
 */
export function resolve<T>(path: string, guard: (u: unknown) => u is T): (document: { paths: { [x: string]: {} } }) => T | undefined
export function resolve(path: string): (document: { paths: { [x: string]: {} } }) => {} | undefined
export function resolve(_: string, guard?: (u: unknown) => boolean) {
  let seen = new WeakSet()
  function go(_: string, guard: (u: unknown) => boolean, document: { paths: { [x: string]: {} } }) {
    const path = _.startsWith("#/") ? _.slice("#/".length).split("/") : _.split("/")
    let cursor: unknown = tree.get(document, ...path)
    if (!cursor) return void 0

    while (tree.has("$ref", is.string)(cursor)) {
      if (seen.has(cursor)) 
        return Invariant.CircularReferenceError('openapi/ref')('Ref.resolve', cursor, path)
      seen.add(cursor)
      cursor = go(cursor["$ref"], guard, document)
    }

    return guard(cursor) ? cursor : void 0
  }
  return (document: { paths: { [x: string]: {} } }) => go(_, guard ?? (() => true), document)
}

export type Binder = (cPath: string, cNode: {}) => string
export type Binding = { value: unknown, references: string[] }
export type Resolver<T = unknown> = (rPath: string, rValue: unknown) => T

export function resolveOrBind<T>(path: string, binder?: Binder): (document: { paths: { [x: string]: {} } }) => T | string
export function resolveOrBind(path: string, binder?: Binder): (document: { paths: { [x: string]: {} } }) => {} | string
export function resolveOrBind(_: string, binder: Binder = (cPath) => cPath) {
  let seen = new WeakSet()
  function go(_: string, document: { paths: { [x: string]: {} } }) {
    const path = _.startsWith("#/") ? _.slice("#/".length).split("/") : _.split("/")
    let depth: string[] = []
    let cursor: unknown = tree.get(document, ...path)
    if (!cursor) return void 0

    while (tree.has("$ref", is.string)(cursor)) {
      depth.push(cursor.$ref)
      if (seen.has(cursor)) 
        return binder(cursor.$ref, cursor)
      seen.add(cursor)
      cursor = go(cursor["$ref"], document)
    }

    return cursor
  }
  return (document: { paths: { [x: string]: {} } }) => go(_, document)
}

resolve.defaults = { 
  predicate: (_: any): _ is any => true,
} satisfies Required<resolve.Options<unknown>>

export declare namespace resolveAll {
  type RefsByAbsolutePath<T> = Record<string, T>
}

export function getPathname<T extends { $ref: string }>(node: T) { 
  const xs = node.$ref.slice("#/".length).split("/") 
  return xs[xs.length - 1]
}

export const getRefsInTopologicalOrder = (node: unknown): string[] => {
  const seen: string[] = []
  const loop = fn.loop<unknown, void>((node, loop) => {
    if(tree.has('$ref', is.string)(node)) {
      const pathname = getPathname(node)
      if(!seen.includes(pathname)) seen.push(pathname)
    }
    else if (is.object(node) && !is.array(node)) Object.values(node).forEach(loop)
    else if (is.array(node)) node.forEach(loop)
    else void 0
  })

  loop(node)
  return seen
}

const getAllRefs = (spec: {}) => {
  return fn.pipe(
    Object.entries(spec),
    map(([k, v]) => [k, getRefsInTopologicalOrder(v)] satisfies [any, any]),
  )
}

export const drawDependencyGraph
  = <T>(tree: {}, resolveRef?: Resolver<T>) => {
    const refs = getAllRefs(tree)
    const sequence = Graph.sequence(new Map(refs))
    if(!sequence.safe) return fn.throwWithMessage(
      "Encountered an unsafe cyclical dependency in your OpenAPI document"
    )(sequence.cycles)
    else return sequence.chunks
  }


/** 
 * ## {@link resolveAll `Ref.resolveAll`}
 * 
 * Given an OpenAPI spec, returns a record of all refs in the document,
 * keyed by absolute path into the spec.
 * 
 * Resolution is recursive. Handles circular references. Expects the document
 * to be passed by argument, which means resolving filepath or URL is not
 * currently supported.
 */
export function resolveAll<T extends Traversable.orJsonSchema, S>(
  spec: OpenAPI.doc<T>, 
  resolver?: Resolver<S>,
  binder?: Binder
): resolveAll.RefsByAbsolutePath<S>
export function resolveAll(
  spec: OpenAPI.doc, 
  resolver: Resolver<unknown> = fn.identity,
  binder: Binder = (cPath) => cPath
) {
  // const seen = new globalThis.WeakSet()
  let out: Record<string, unknown> = {}
  const PRE = '#/components/schemas'
  const loop = fn.loopN<[doc: OpenAPI.doc, node: {} | null | undefined], void>(
    (doc, node, loop) => {

      switch (true) {
        case is.primitive(node): return void 0
        case tree.has('$ref', is.string)(node): {
          const unprefixed = node.$ref.startsWith('#') ? node.$ref.slice(1) : node.$ref
          const unescapedPath = JsonPointer.toPath(unprefixed)
          const [prefix, rest] = [
            node.$ref.startsWith(PRE) ? node.$ref.slice(1, PRE.length).split('/') : [],
            node.$ref.startsWith(PRE) ? node.$ref.slice(   PRE.length) : node.$ref,
          ]
          const resolved = resolveOrBind(node.$ref, binder)(doc)
          out[node.$ref] = resolver(node.$ref, resolved)
          return
        }

        case is.object(node): 
          return void Object.values(node).forEach((v) => loop(doc, v))
        case is.array(node): 
          return void node.forEach((v) => loop(doc, v))
        case is.nonnullable(node): return void 0
        default: return fn.exhaustive(node)
      }
    }
  )
  void loop(spec, spec)
  return out
}

        //   // out[node.$ref] ??= { value: void 0 as never, references: [] }

        //   // if (typeof resolved === 'string') {
        //   //   if (!out[node.$ref].value) { 
        //   //     out[node.$ref].value = resolved
        //   //   }
        //   //   out[resolved] ??= { value: void 0 as never, references: [] }
        //   //   if (!out[resolved].references.includes(node.$ref)) {
        //   //     out[resolved].references.push(node.$ref)
        //   //   }


        //   // fn.pipe(
        //   //   tree.get(doc, ...unescapedPath),
        //   //   (_) => !!_ && typeof _ !== 'symbol' ? _  
        //   //     : tree.get(doc, ...[...prefix, rest]),
        //   //   (_) => !_ ? Invariant.FailedToResolveDocumentRef(node.$ref) : _,
        //   // )
        //   // if (seen.has(resolved)) return void 0
        //   // else {
        //   //   void seen.add(resolved)
        //   //   void (out[node.$ref] = resolved)
        //   //   void loop(doc, resolved)
        //   // }
        //   // return void 0
        // }
