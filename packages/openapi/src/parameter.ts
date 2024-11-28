import { fc } from "@traversable/core"

import { BooleanNode, IntegerNode, NumberNode, Schema, StringNode } from "./schema.js"
import {
  applyConstraints,
  type arbitrary,
  type cookie_parameter,
  type header_parameter,
  type path_parameter,
  type query_parameter,
  style,
} from "./types.js"

type parameter_any = path_parameter | cookie_parameter | header_parameter | query_parameter

export type parameter = parameter.any
export declare namespace parameter {
  export {
    parameter_any as any,
    cookie_parameter as cookie,
    header_parameter as header,
    path_parameter as path,
    query_parameter as query,
  }
}

/** ### {@link parameter `oas.parameter`} */
export namespace parameter {
  export function any(constraints?: arbitrary.Constraints) {
    return fc.oneof(
      parameter.query(constraints),
      parameter.cookie(constraints),
      parameter.header(constraints),
    )
  }

  export function pathSchema(constraints: Schema.Constraints = Schema.defaults) {
    return fc.oneof(
      NumberNode(constraints),
      StringNode(constraints),
      IntegerNode(constraints),
      BooleanNode(constraints),
    )
  }

  /** ### {@link parameter.path `oas.parameter.path`} */
  export function path(
    constraints?: arbitrary.Constraints,
  ): fc.Arbitrary<globalThis.Omit<path_parameter, "name">>
  export function path(_?: arbitrary.Constraints): fc.Arbitrary<globalThis.Omit<path_parameter, "name">> {
    const constraints = applyConstraints(_)
    return fc.record(
      {
        in: fc.constant("path"),
        required: fc.constant(true),
        schema: pathSchema(constraints),
        style: fc.constantFrom(...style.path),
        explode: fc.boolean(),
      },
      {
        requiredKeys: ["required", "in", "schema"],
      },
    )
  }

  /** ### {@link parameter.query `oas.parameter.query`} */
  export function query(constraints?: arbitrary.Constraints): fc.Arbitrary<query_parameter>
  export function query(_?: arbitrary.Constraints): fc.Arbitrary<query_parameter> {
    const constraints = applyConstraints(_)
    return fc.record(
      {
        in: fc.constant("query"),
        name: fc.identifier(),
        schema: Schema.any(constraints),
        required: fc.boolean(),
        style: fc.constantFrom(...style.query),
        explode: fc.boolean(),
        deprecated: fc.boolean(),
      },
      {
        requiredKeys: ["in", "name", "schema"],
      },
    )
  }

  /** ### {@link parameter.header `oas.parameter.header`} */
  export function header(constraints?: arbitrary.Constraints): fc.Arbitrary<header_parameter>
  export function header(_?: arbitrary.Constraints): fc.Arbitrary<header_parameter> {
    const constraints = applyConstraints(_)
    return fc.record(
      {
        in: fc.constant("header"),
        name: fc.identifier(),
        style: fc.constant(...style.header),
        required: fc.boolean(),
        schema: Schema.StringNode({ ...constraints, nullable: false }),
        deprecated: fc.boolean(),
      },
      {
        requiredKeys: ["in", "name", "schema"],
      },
    )
  }

  /** ### {@link parameter.cookie `oas.parameter.cookie`} */
  export function cookie(constraints?: arbitrary.Constraints): fc.Arbitrary<cookie_parameter>
  export function cookie(_?: arbitrary.Constraints): fc.Arbitrary<cookie_parameter> {
    const constraints = applyConstraints(_)
    return fc.record(
      {
        in: fc.constant("cookie"),
        name: fc.identifier(),
        style: fc.constant(...style.cookie),
        required: fc.boolean(),
        schema: Schema.any(constraints),
        deprecated: fc.boolean(),
      },
      { requiredKeys: ["in", "name", "schema"] },
    )
  }
}
