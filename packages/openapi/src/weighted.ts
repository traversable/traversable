import { array, fn, number, order } from "@traversable/data"
import type { Compare, Functor, Monoid } from "@traversable/registry"

import { JsonPointer, is, tree } from "@traversable/core"
import { hasOwn } from "@traversable/data/function"
import { Schema } from "./schema/exports.js"

export type { Weight_any as any }

type Weight_any = byType[keyof byType]
//           ^?
export type WeightMap = globalThis.Record<keyof typeof byType, Weight_any>

export type byType = typeof byType
export const byType = {
  nonnullable: -1,
  null: 0,
  boolean: 1,
  integer: 2,
  number: 3,
  string: 4,
  oneOf: 100,
  anyOf: 101,
  allOf: 102,
  object: 200,
  array: 300,
  tuple: 9000,
  record: 9000,
} as const

const getMonoid
  : ($: Doclike, mapping: WeightMap) => Monoid<Weight_any> 
  = ($, mapping) => ({
    empty: mapping.nonnullable,
    concat: number.max
  })

export const fold 
  : ($: Doclike, mapping?: WeightMap) => (xs: readonly Schema.Node[]) => Weight_any
  = ($: Doclike, mapping: WeightMap = byType) => fn.pipe(
    getMonoid($, mapping), 
    (Mn) => array.foldMap(Mn)(fromSchema($, mapping)),
  )

export type Doclike = { 
  paths?: {[x: string]: {} }, 
  components?: { schemas?: {} } 
}

export const fromSchema
  : ($: Doclike, mapping?: WeightMap) => (node: Schema.Node) => Weight_any
  = ($, mapping = byType) => (node) => {
    if (typeof node === "boolean") return mapping.nonnullable
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
  : ($: Doclike, mapping?: WeightMap) => (node: Schema.Node) => Weight_any
  = ($, mapping = byType) => (node) => {
    if (typeof node === "boolean") return mapping.nonnullable
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

export const resolveRef = ({ $ref }: { $ref?: string }, $: Doclike, mapping: WeightMap) => {
  if (!$ref) return byType.nonnullable
  const path = toJsonPointer($ref)
  return !tree.has(...path, Schema.is)($) 
    ? byType.nonnullable 
    : fromSchema($, mapping)(tree.get($, ...path)!) ?? byType.nonnullable
}

export const fromSchemaEntry
  : ($: Doclike, mapping?: WeightMap) => (entry: readonly [string, Schema.Node]) => Weight_any
  = ($, mapping = byType) => ([, v]) => fromSchema($, mapping)(v)

export const orderBy
  : ($: Doclike, mapping?: WeightMap) => Compare<Schema.Node>
  = ($, mapping = byType) => order.mapInput(order.number, fromSchema($, mapping))

export const orderEntriesBy
  : ($: Doclike, mapping?: WeightMap) => Compare<readonly [string, Schema.Node]>
  = ($, mapping = byType) => order.mapInput(order.number, fromSchemaEntry($, mapping))

// export const sortSchema
