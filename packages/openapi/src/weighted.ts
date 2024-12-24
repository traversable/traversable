import { array, fn, number, order } from "@traversable/data"
import { 
  type Compare, 
  type Monoid, 
  type NodeWeight,
  WeightMap, 
} from "@traversable/registry"

import { JsonPointer, tree } from "@traversable/core"
import { Schema } from "./schema/exports.js"

/** TODO: Replace this type with one from {@link openapi.document} */
export type Doclike = { 
  paths?: {[x: string]: {} }, 
  components?: { schemas?: {} } 
}

const getMonoid
  : ($: Doclike, mapping: WeightMap) => Monoid<NodeWeight> 
  = (_, mapping) => ({
    empty: mapping.unknown,
    concat: number.max
  })

export const fold 
  : ($: Doclike, mapping?: WeightMap) => (xs: readonly Schema.Node[]) => NodeWeight
  = ($: Doclike, mapping: WeightMap = WeightMap) => fn.pipe(
    getMonoid($, mapping), 
    (Mn) => array.foldMap(Mn)(fromSchema($, mapping)),
  )

export const fromSchema
  : ($: Doclike, mapping?: WeightMap) => (node: Schema.Node) => NodeWeight
  = ($, mapping = WeightMap) => (node) => {
    if (typeof node === "boolean") return mapping.unknown
    else {
      switch (true) {
        case Schema.isRef(node): return resolveRef(node, $, mapping)
        case Schema.isAllOf(node): return fn.pipe(node.allOf, fold($, mapping))
        case Schema.isAnyOf(node): return fn.pipe(node.anyOf, fold($, mapping))
        case Schema.isOneOf(node): return fn.pipe(node.oneOf, fold($, mapping))
        default: return mapping[node.type]
      }
    }
  }

export const fromSchemaRec
  : ($: Doclike, mapping?: WeightMap) => (node: Schema.Node) => NodeWeight
  = ($, mapping = WeightMap) => (node) => {
    if (typeof node === "boolean") return mapping.unknown
    else {
      switch (true) {
        case Schema.isNull(node): return mapping.null
        case Schema.isRef(node): return resolveRef(node, $, mapping)
        case Schema.isAllOf(node): return fn.pipe(node.allOf, fold($, mapping))
        case Schema.isAnyOf(node): return fn.pipe(node.anyOf, fold($, mapping))
        case Schema.isOneOf(node): return fn.pipe(node.oneOf, fold($, mapping))
        default: return mapping[node.type]
      }
    }
  }


const trimHash = ($ref: string) => $ref.startsWith("#") ? $ref.slice(1) : $ref
const toJsonPointer = fn.flow(trimHash, JsonPointer.toPath)

export const resolveRef = ({ $ref }: { $ref?: string }, $: Doclike, mapping: WeightMap): NodeWeight => {
  if (!$ref) return WeightMap.unknown
  const path = toJsonPointer($ref)
  return !tree.has(...path, Schema.is)($) 
    ? WeightMap.unknown 
    : fromSchema($, mapping)(tree.get($, ...path)!) ?? WeightMap.unknown
}

export const fromSchemaEntry
  : ($: Doclike, mapping?: WeightMap) => (entry: readonly [string, Schema.Node]) => NodeWeight
  = ($, mapping = WeightMap) => ([, v]) => fromSchema($, mapping)(v)

export const orderBy
  : ($: Doclike, mapping?: WeightMap) => Compare<Schema.Node>
  = ($, mapping = WeightMap) => order.mapInput(order.number, fn.flow(fromSchema($, mapping), (x) => x.weight))

export const orderEntriesBy
  : ($: Doclike, mapping?: WeightMap) => Compare<readonly [string, Schema.Node]>
  = ($, mapping = WeightMap) => order.mapInput(order.number, fn.flow(fromSchemaEntry($, mapping), (x) => x.weight))
