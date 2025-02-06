import type { Traversable } from "@traversable/core"
import { fn, map } from "@traversable/data"
import type { _ } from "@traversable/registry"

import { typeNameFromPath } from "./seed.js"
import type { Handlers, Options } from "./shared.js"
import { fold, optionsFromMatchers, parseOptions } from "./shared.js"

export {
  type Generator,
  type All,
  derive,
  deriveAll,
  compile,
  deriveAll as compileAll,
}

type All<T> = { 
  byName: Record<string, T>
  order: string[]
  meta: {
    header?: string
  }
}


/** @internal */
const Object_keys = globalThis.Object.keys

type Generator<T> = (schema: Traversable.orJsonSchema, options: Options<T>) => T

function derive<T>(matchers: Handlers<T>, defaults?: Options<T>) {
  return (schema: Traversable.orJsonSchema, options: Options<T>) => {
    const $ = optionsFromMatchers(matchers)({ ...defaults, ...options })
    return fn.pipe(
      fold($),
      fn.applyN($, schema),
    )
  }
}

function deriveAll<T>(generator: Generator<T>, options: Options<T>): All<T>
function deriveAll<T>(generator: Generator<T>, options: Options<T>): All<T> {
  const $ = parseOptions(options)
  const header = typeof $.header === "string" ? $.header : ($.header || []).join("\n")
  const schemas = $.document.components.schemas
  const order = Object_keys(schemas)
  const meta = { ...header && { header } }
  const byName = map(
    schemas,
    (schema, schemaName) => generator(
      schema, { 
        ...$, 
        absolutePath: [...$.absolutePath, `${schemaName}`],
        typeName: typeNameFromPath(`${schemaName}`),
      },
    )
  )
  return { meta, order, byName }
}

function compile(matchers: Handlers<string>, defaults?: Options<string>) {
  return (schema: Traversable.orJsonSchema, options?: Options<string>) => {
    const $ = optionsFromMatchers(matchers)({ ...defaults, ...options })
    return fn.pipe(
      fold($),
      fn.applyN($, schema),
      (target) => $.template(target, $),
      (ss) => ss.join('\n')
    )
  }
}
