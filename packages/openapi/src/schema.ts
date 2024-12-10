import { fc } from "@traversable/core"
import type { BoundedObject, BoundedTuple } from "./types.js"

const typed = <T extends string>(type: T) => ({ type: fc.constant(type) })

export const boolean = fc.record(typed("boolean"))
export const integer = fc.record(typed("integer"))
export const number = fc.record(typed("number"))
export const string = fc.record(typed("string"))
export { null_ as null }
const null_ = fc.record(typed("null"))

export function array<T>(arbitrary: fc.Arbitrary<T>, constraints: {} = {}) {
  return fc.record({ 
    ...typed("array"),
    items: arbitrary,
  })
}

export function record<S, T>(
  model: record.Model<S, T>, 
  constraints: {} = {}
) {
  return fc.record({ 
    ...typed("object"),
    ...model.properties && { properties: model.properties },
    additionalProperties: model.additionalProperties,
  }, { requiredKeys: ["type", "additionalProperties"] })
}

export declare namespace record {
  export interface Model<T, U> { 
    additionalProperties: fc.Arbitrary<U>
    properties?: fc.Arbitrary<T>, 
  }
}

export function tree(constraints?: {}) {
  return fc.letrec((loop) => ({
    tree: fc.oneof(
      { depthSize: "small" },
      // loop("object"),
      // loop("array"),
      null_,
      boolean,
      integer,
      number,
      string,
    ),
    tuple: fc.record({ 
      type: fc.constant("array"), 
      prefixItems: fc.array(loop("tree")) ,
      items: loop("tree"),
    }, { requiredKeys: ["prefixItems", "type"] }),
    record: record({ 
      properties: loop("tree"), 
      additionalProperties: loop("tree") 
    }, constraints),
    object: fc.record({
      type: fc.constant("object"),
      required: fc.constant([] as string[]),
      properties: fc.dictionary(loop("tree"), constraints),
    }, { requiredKeys: ["type", "properties"] }),
    array: array(loop("array"), constraints),
    allOf: fc.record({ allOf: fc.dictionary(loop("tree")) }),
    anyOf: fc.record({ anyOf: fc.dictionary(loop("tree")) }),
    oneOf: fc.record({ oneOf: fc.dictionary(loop("tree")) }),
  }))
}

export const object: fc.Arbitrary<BoundedObject> = tree().object as never
export const tuple: fc.Arbitrary<BoundedTuple> = tree().tuple as never


// function object<T>(
//   model: fc.Arbitrary<T>, 
//   constraints: {} = {}
// ) {
//   return fc.record({ 
//     ...typed("object"),
//     properties: fc.dictionary(model),
//   }, { requiredKeys: ["type", "properties"] })
// }
// function tuple<T extends readonly unknown[], R>(
//   model: { [x in keyof T]: fc.Arbitrary<T[x]> },
//   rest?: fc.Arbitrary<R>
// ): fc.Arbitrary<{ type: "array", prefixItems: any[], items?: R | undefined }> {
//   return fc.record({
//     type: fc.constant("array"),
//     prefixItems: fc.tuple(...model),
//     ...rest && { items: rest },
//   }, { requiredKeys: ["type", "prefixItems"] })
// }




