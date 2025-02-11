import type { Traversable } from "@traversable/core"
import { fn, map } from "@traversable/data"
import { Ref } from '@traversable/openapi'
import type { _ } from "@traversable/registry"

import type { Handlers, Options } from "./shared.js"
import { fold, optionsFromMatchers, parseOptions, typeNameFromPath } from "./shared.js"

export {
  type Generator,
  type All,
  derive,
  deriveAll,
  compile,
  deriveAll as compileAll,
}

type Generator<T> = (schema: Traversable.orJsonSchema, options: Options<T>) => T
type DecoratedGenerator<T> = (
  schema: Traversable.orJsonSchema, 
  options: Options<T> & { refs: Record<string, {}> }
) => T

type All<T> = { 
  byName: Record<string, T>
  order: string[]
  meta: {
    header?: string
  }
}

function decorateGenerator(refs: Record<string, {}>):
  <T>(generator: Generator<T>) => DecoratedGenerator<T> {
    return (generator) => (schema, options) => {
      const $: typeof options = { ...options, refs }
      return generator(schema, $)
    }
  }

function deriveWithRefs(refs: Record<string, {}>): 
  <T>(matchers: Handlers<T>, defaults?: Options<T>) 
    => (schema: Traversable.orJsonSchema, options: Options<T>) 
    => T {
  return <T>(matchers: Handlers<T>, defaults?: Options<T>) => 
    (schema: Traversable.orJsonSchema, options: Options<T>) => {
      const config = {
        ...defaults, 
        ...options,
        refs,
      }
      const $ = optionsFromMatchers(matchers)(config)
      return fn.pipe(
        fold($),
        fn.applyN($, schema),
      )
    }
  }

function derive<T>(matchers: Handlers<T>, defaults?: Options<T>) {
  return (schema: Traversable.orJsonSchema, options: Options<T>) => {
    const $ = optionsFromMatchers(matchers, defaults)(options)
    const refs = Ref.resolveAll($.document, typeNameFromPath)
    return deriveWithRefs(refs)(matchers)(schema, $)
  }
}

function deriveAll(defaults?: Options<unknown>): <T>(generator: Generator<T>, options: Options<T>) => All<T>
function deriveAll(defaults?: Options<unknown>): <T>(generator: Generator<T>, options: Options<T>) => All<T> {
  return (generator, options) => {
    const $ = parseOptions(options, defaults)
    const schemas = $.document.components.schemas
    const refs = Ref.resolveAll($.document, typeNameFromPath)
    const order = Ref.untangle(schemas).flatMap(fn.identity)
    const decorate = decorateGenerator(refs)(generator)
    const header = [
      ...$.imports,
      '',
      ...(typeof $.header === "string" ? [$.header] : $.header),
    ].join('\n')
    const meta = { header, imports: $.imports }
    const byName = map(
      schemas,
      (schema, schemaName) => decorate(
        schema, { 
          ...$, 
          refs,
          absolutePath: [...$.absolutePath, `${schemaName}`],
          typeName: typeNameFromPath(`${schemaName}`),
        }
      )
    )
    return { meta, order, byName }
  }
}

function compile(matchers: Handlers<string>, defaults: Options<string>) {
  return (schema: Traversable.orJsonSchema, options: Options<string>) => {
    const $ = optionsFromMatchers(matchers)({ ...defaults, ...options })
    return fn.pipe(
      derive(matchers, defaults)(schema, $),
      (target) => $.template(target, $),
      (ss) => ss.join('\n')
    )
  }
}
