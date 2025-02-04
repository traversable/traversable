import * as path from "node:path"

import type { Traversable } from "@traversable/core"
import { fn, object } from "@traversable/data"
import { OpenAPI } from "@traversable/openapi"
import { KnownFormat, symbol } from "@traversable/registry"

import * as Gen from "../generator.js"
import type { Matchers, Options } from "../shared.js"

export {
  generators,
  generate,
  generateAll,
}

/** @internal */
const JSON_stringify = (u: unknown) => JSON.stringify(u, null, 2)
/** @internal */
const Object_entries = globalThis.Object.entries
/** @internal */
const isKeyOf = <T extends Record<string, string>>(dictionary: T) =>
  (k: keyof any | undefined): k is keyof T =>
    k !== undefined && k in dictionary

const defaults = {
  typeName: 'AnonymousTypeScriptType',
  absolutePath: ['components', 'schemas'],
  header: [],
  document: OpenAPI.new({}),
  flags: {
    nominalTypes: true,
    preferInterfaces: true,
    includeJsdocLinks: true,
    includeExamples: true,
    includeLinkToOpenApiNode: path.resolve(),
  },
  indent: 0,
  path: [],
  template: (target) => [target],
  depth: 0,
  siblingCount: 0,
} satisfies Omit<Options.Config<unknown>, 'handlers'>

const KnownStringFormats = {
  [KnownFormat.string.email]: 'string.email',
  [KnownFormat.string.date]: 'string.date',
  [KnownFormat.string.datetime]: 'string.datetime',
} as const satisfies { [K in KnownFormat.string[keyof typeof KnownFormat.string]]+?: string }

const isKnownStringFormat = isKeyOf(KnownStringFormats)

const baseHandlers = {
  any(_) { return 'unknown' },
  null(_) { return 'null' },
  boolean(_) { return 'boolean' },
  integer(_) { return 'number' },
  number(_) { return 'number' },
  string(_) { return 'string' },
  enum(n) { return n.enum.map(JSON_stringify).join(' | ') },
  const() { return '' },
  allOf(n) { return n.allOf.join(' & ') },
  anyOf(n) { return n.anyOf.join(' | ') },
  oneOf(n) { return n.oneOf.join(' | ') },
  array(n) { return n.items + '[]' },
  tuple(n) { return '[' + n.items.join(', ') + ']' },
  record(n) { return 'Record<string, ' + n.additionalProperties + '>' },
  object(n) {
    return ''
      + '{'
      + Object_entries(n.properties)
        .map(([k, v]) => ''
          + object.parseKey(k)
          + ((n.required ?? []).includes(k) ? ': ' : '?: ')
          + v
        ).join(';\n')
      + '}'
  },
} satisfies Matchers<string>

const generators = {
  any(_) { return 'unknown' },
  null(_) { return 'null' },
  boolean(_) { return 'boolean' },
  integer(_) { return 'number.integer' },
  number(_) { return 'number' },
  string(_) { return 'string' },
  enum(_) { return _.enum.map(JSON_stringify).join(' | ') },
  const() { return '' },
  allOf(_) { return _.allOf.join(' & ') },
  anyOf(_) { return _.anyOf.length > 1 ? '\n' + _.anyOf.join('\n | ') : _.anyOf.join(' | ') },
  oneOf(_) { return _.oneOf.join(' | ') },
  array(_) { return 'Array<' + _.items + '>' },
  tuple(_) { return '[' + _.items.join(', ') + ']' },
  record(_) { return 'Record<string, ' + _.additionalProperties + '>' },
  object(_, $) {
    return (
      '{'
      + Object_entries(_.properties)
        .map(([k, v]) => {
          const isOptional = !(_.required ?? []).includes(k)
          const keys = [...isOptional ? [symbol.optional, k] : [k]]
          // const symbolicName = createZodIdent($)(...path.docs)(_, $)(...isOptional ? [symbol.optional, k] : [k])
          //path.interpreter(path.docs, [$.typeName, ...$.path, k, { leaf: _ } ]).join('')
          return ''
            + '/**\n'
            // + ' * ## {@link ' + symbolicName.join('') + '}'
            + '\n */\n'
            // + '/** ' + path.interpreter(path.docs, [...ix, ...isOptional ? [k, '?'] : [k], { leaf: _ } ]).join('') + ' */\n'
            + object.parseKey(k)
            + (isOptional ? '?: ' : ': ')
            + v
            }
        ).join(';\n')
      + '}'
    )
  }
} satisfies Matchers<string>

const generate
  : (schema: Traversable.orJsonSchema, options: Options<string>) => string
  = fn.flow(
    Gen.fromMatchers(generators),
    ([target, $]) => [
      'export type ' + $.typeName + ' = typeof ' + $.typeName,
      'export declare const ' + $.typeName + ': ' + target,
    ].join('\n')
  )
 
const generateAll
  : (options: Options<string>) => Gen.Many<string>
  = (options) => Gen.many({ 
    ...defaults, 
    ...options, 
    generate, 
  })

/** @deprecated */
const nominalHandlers = {
  ...baseHandlers,
  integer() { return 'number.integer' },
  string(n) { return isKnownStringFormat(n.meta?.format) ? KnownStringFormats[n?.meta.format] : 'string' },
} satisfies Matchers<string>

/** @deprecated */
const nominalPathHandlers = {
  ...generators,
  integer() { return 'number.integer' },
  string(_) { return isKnownStringFormat(_.meta?.format) ? KnownStringFormats[_?.meta.format] : 'string' },
} satisfies Matchers<string>

/** @deprecated */
const extendedHandlers = {
  ...baseHandlers,
} satisfies Matchers<string>

//////////////////
///  USERLAND  ///
// interface Foo { type: "Foo" }
// interface Bar { type: "Bar" }
// interface Baz { type: "Baz" }
// ///
// const ext = Extension.register({
//   //   ^?
//   Foo: (_: unknown): _ is Foo => Math.random() > 1,
//   Bar: (_: unknown): _ is Bar => Math.random() > 1,
//   Baz: (_: unknown): _ is Baz => Math.random() > 1,
// })
// ///
// declare module "@traversable/core" {
//   interface Extension extends Extension.register<typeof ext> {}
// }
///  USERLAND  ///
//////////////////
