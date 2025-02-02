import type { Traversable } from "@traversable/core"
import type { _ } from "@traversable/registry"

import { fn } from "@traversable/data"
import { typeNameFromPath } from "./seed.js"
import type { Handlers, Options } from "./shared.js"
import { fold, optionsFromMatchers, parseOptions } from "./shared.js"

export {
  type Generator,
  fromMatchers,
  many,
}

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

function many(options: Options<string> & { generate: Generator<string> }): string[]
function many<T>(options: Omit<Options<T>, "header"> & { generate: Generator<T> }): T[]
function many<T>(options: Options<T> & { generate: Generator<T> }): T[] {
  const $ = parseOptions(options)
  const headers = $.header === undefined ? null : typeof $.header === "string" ? $.header : $.header.join("\n")
  const schemas = globalThis.Object
    .entries($.document.components.schemas)
    .map(([k, schema]) => options.generate(
      schema, 
      { 
        ...$, 
        absolutePath: [...$.absolutePath, k],
        typeName: typeNameFromPath(`${k}`),
      },
    )
  )
  return [
    headers as T | null, // TODO: create a separate function for derivations versus generators
    ...schemas,
  ].filter((_) => _ !== null)
}
