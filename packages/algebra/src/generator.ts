import type { Traversable } from "@traversable/core"
import type { _ } from "@traversable/registry"
import { fn, map } from "@traversable/data"

import { typeNameFromPath } from "./seed.js"
import type { Handlers, Options } from "./shared.js"
import { fold, optionsFromMatchers, parseOptions } from "./shared.js"

export {
  type Generator,
  type Many,
  fromMatchers,
  generatorFromMatchers,
  many,
}

/** @internal */
const Object_keys = globalThis.Object.keys

type Generator<T> = (schema: Traversable.orJsonSchema, options: Options<T>) => T

function fromMatchers<T>(matchers: Handlers<T>) {
  return (schema: Traversable.orJsonSchema, options: Options<T>) => {
    const $ = optionsFromMatchers(matchers)(options)
    return fn.pipe(
      fold($),
      fn.applyN($, schema),
      (target) => [target, $] satisfies [any, any],
    )
  }
}

function generatorFromMatchers(matchers: Handlers<string>, defaults?: Options<string>) {
  return (schema: Traversable.orJsonSchema, options: Options<string>) => {
    const $ = optionsFromMatchers(matchers)({ ...defaults, ...options })
    return fn.pipe(
      fold($),
      fn.applyN($, schema),
      (target) => $.template(target, $),
      (ss) => ss.join('\n')
    )
  }
}

type Many<T> = { 
  byName: Record<string, T>
  order: string[]
  meta: {
    header?: string
  }
}

function many<T>(options: Omit<Options<T>, "header"> & { generate: Generator<T> }): Many<T>
function many<T>(options: Options<T> & { generate: Generator<T> }): Many<T> {
  const $ = parseOptions(options)
  const header = $.header === undefined ? null : typeof $.header === "string" ? $.header : $.header.join("\n")
  const schemas = $.document.components.schemas
  const order = Object_keys(schemas)
  const meta = { ...header && { header } }
  const byName = map(
    schemas,
    (schema, k) => options.generate(
      schema, { 
        ...$, 
        absolutePath: [...$.absolutePath, `${k}`],
        typeName: typeNameFromPath(`${k}`),
      },
    )
  )

  return { meta, order, byName }
}
