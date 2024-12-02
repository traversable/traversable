import { array, fn, map, object, type prop, type props } from "@traversable/data"

import { Schema } from "./schema.js"

const stringifyPath
  : (delimiter: string) => (path: (string | number)[]) => string 
  = (delimiter) => array.reduce((acc, k) => `${acc}${acc === "" ? "" : delimiter}${k}` , "")
    // (acc === "" ? "" : acc + delimiter) + k, "")

export declare namespace reffer {
  /**
   * ### {@link reffer.Options `reffer.Options`}
   *
   * - If `delimiter` is unspecified, defaults to {@link reffer.defaults.delimiter `"~1"`}
   * - If `path` is unspecified, defaults to {@link reffer.defaults.path `["#"]`}
   */
  interface Options {
    path?: (string | number)[]
    delimiter?: string
  }
}

export type reffer<T = never> = never | [tree: Schema.any, refs: { [$ref: string]: Schema.any }]

export function reffer<T extends Schema.any>(schema: T): mapRef<T>
export function reffer<T extends Schema.any>(schema: T, options: reffer.Options): mapRef<T>
export function reffer<T extends Schema.any>(
  schema: T,
  { path = reffer.defaults.path, delimiter = reffer.defaults.delimiter }: reffer.Options = reffer.defaults,
) {
  let refs: {}[] = []

  const loop = fn.loop<[node: Schema.any, path: props.any], {}>(([node, ps], loop) => {
    switch (true) {
      case Schema.is.ref(node):
      case Schema.is.null(node):
      case Schema.is.scalar(node):
        return node
      case Schema.is.allOf(node):
        return { allOf: map(node.allOf, (c, ix) => loop([c, [...ps, "allOf", ix]])) }
      case Schema.is.anyOf(node):
        return { anyOf: map(node.anyOf, (c, ix) => loop([c, [...ps, "anyOf", ix]])) }
      case Schema.is.oneOf(node):
        return { oneOf: map(node.oneOf, (c, ix) => loop([c, [...ps, "oneOf", ix]])) }
      case Schema.is.tuple(node): {
        return node
      }
      case Schema.is.array(node):
        return {
          ...node,
          items: loop([node.items, [...ps, "items"]]),
        }
      case Schema.is.object(node):
        return object_(node, ps, delimiter, refs, loop)
      default:
        return fn.exhaustive<never>(node)
    }
  })

  return fn.pipe(
    loop([schema, path]),
    object.bind("schema"),
    object.intersect.defer({
      schemas: refs.reduce((acc, cur) => ({ ...acc, ...cur }), {}),
    }),
  )
}

export namespace reffer {
  export const defaults = {
    path: ["#"],
    delimiter: "/",
  } satisfies Required<reffer.Options>
}

export type mapRef<_> = {
  schemas: { [x: string]: {} }
  schema: { [x: string]: {} }
}

export function mapRef<T extends { [x: string]: Schema.any }>(schema: T): mapRef<T>
export function mapRef<T extends { [x: string]: Schema.any }>(schema: T, options: reffer.Options): mapRef<T>
export function mapRef<T extends { [x: string]: Schema.any }>(
  schema: T, { 
    path = reffer.defaults.path, 
    delimiter = reffer.defaults.delimiter,
  }: reffer.Options = reffer.defaults,
) {
  let refs: {}[] = []

  const loop = fn.loop<[node: Schema.any, path: props.any], {}>(([node, ps], loop) => {
    switch (true) {
      case Schema.is.ref(node): return node
      case Schema.is.null(node): return node
      case Schema.is.scalar(node): return node
      case Schema.is.array(node): return array_(node, ps, delimiter, refs, loop)
      case Schema.is.tuple(node): return tuple(node, ps, delimiter, refs, loop)
      case Schema.is.object(node): return object_(node, ps, delimiter, refs, loop)
      case Schema.is.allOf(node): return allOf(node, ps, delimiter, refs, loop)
      case Schema.is.anyOf(node): return anyOf(node, ps, delimiter, refs, loop)
      case Schema.is.oneOf(node): return oneOf(node, ps, delimiter, refs, loop)
      default: return fn.exhaustive<never>(node)
    }
  })

  return fn.pipe(
    schema,
    map((v, k) => loop([v, [...path, k as prop.any]])),
    object.bind("schema"),
    (schema) => ({
      ...schema,
      schemas: refs.reduce((acc, cur) => ({ ...acc, ...cur }), {}),
    }),
  )
}

function oneOf(
  node: Schema.OneOf,
  path: props.any,
  delimiter: string,
  todo: {}[],
  loop: (_: [node: Schema.any, path: props.any]) => {},
) {
  return { 
    allOf: map(
      node.oneOf, 
      (c, ix) => loop([c, [...path, "allOf", ix]])
    )
  }
}

function anyOf(
  node: Schema.AnyOf, 
  path: props.any,
  _delimiter: string,
  _todo: {}[],
  loop: (_: [node: Schema.any, path: props.any]) => {},
) {
  return { 
    allOf: map(
      node.anyOf, 
      (c, ix) => loop([c, [...path, "allOf", ix]])
    )
  }
}

function allOf(
  node: Schema.AllOf,
  path: props.any,
  _delimiter: string,
  _todo: {}[],
  loop: (_: [node: Schema.any, path: props.any]) => {},
) {
  return { 
    allOf: map(
      node.allOf, 
      (c, ix) => loop([c, [...path, "allOf", ix]])
    )
  }
}

function array_(
  schema: Schema.ArrayNode,
  path: props.any,
  _delimiter: string,
  _todo: {}[],
  loop: (_: [node: Schema.any, path: props.any]) => {},
) {
  return {
    ...schema,
    items: loop([schema.items, [...path, "items"]]),
  }
}

function tuple(
  node: Schema.TupleNode,
  prev: props.any,
  delimiter: string,
  todo: {}[],
  loop: (_: [node: Schema.any, path: props.any]) => {},
) {
  const { prefixItems, ...rest } = node
  return fn.pipe(
    prefixItems,
    map((v, ix) => loop([v, [...prev, "prefixItems", ix]])),
    object.bind("prefixItems"),
    object.intersect.defer(rest),
  )
}

function object_(
  schema: Schema.ObjectNode,
  prev: props.any,
  delimiter: string,
  todo: {}[],
  loop: (_: [node: Schema.any, path: props.any]) => {},
) {
  const { properties, ...rest } = schema
  return fn.pipe(
    properties,
    map((node, k) => {
      const path = [...prev, "properties", k]
      const pathFromRoot = stringifyPath(delimiter)(path)
      const $ref = { [pathFromRoot]: loop([node, path]) }
      return void todo.push($ref), { $ref: pathFromRoot }
    }),
    object.bind("properties"),
    object.intersect.defer(rest),
  )
}
