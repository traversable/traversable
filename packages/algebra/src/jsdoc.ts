import type { Json } from '@traversable/core'
import { Format, tree } from '@traversable/core'

import { PATTERN } from '@traversable/registry'
import type { Index } from './shared.js'

/** 
 * ## {@link tag `JSDoc.tag`}
 * 
 * Embeds an arbitrary JSDoc tag inside a multiline comment.
 * 
 * If you need something more flexible, see {@link Format.multiline `core.Format.multiline`}.
 */
export function tag(jsdocTag: string): (u: unknown, options?: Format.multiline.OptionsWithHandlers) => string
export function tag(jsdocTag: string): (u: Json, $?: Format.multiline.OptionsWithHandlers) => string {
  return (u: Json, $?: Format.multiline.Options) => 
    Format.multiline(u, { ...$, leftGutter: ' * ', wrapWith: [' * @' + jsdocTag + '\n', ''] })
}

const escapeMultilineCommentClose = (text: string) => text.replace(PATTERN.multilineCommentClose, `*\\/`)

/** 
 * ## {@link example `JSDoc.example`}
 * 
 * Embeds an '@example' tag inside a multiline comment. 
 */
export function example(k: string, $: Index): string | null {
  const child = tree.get($.document, ...$.absolutePath, 'properties', k, 'meta', 'example')
  return typeof child === 'symbol' 
    ? null 
    : escapeMultilineCommentClose(
      Format.multiline(
        child, { 
          wrapWith: [' * @example\n', ' '], 
          leftGutter: ' * ',
          leftMargin: $.indent + 2, 
          leftPadding: 0, 
          indent: 2 
        }
      )
    )
}

const breaklines 
  : (maxWidth: number) => (text: string, $: Format.multiline.Config) => string
  = (maxWidth) => (text, $) => {
    if (text.length <= maxWidth) return text
    else {
      let lines = []
      let chunk = null
      while (text.length > maxWidth) {
        void (chunk = text.substring(0, maxWidth))
        void (lines.push(chunk))
        void (text = text.substring(maxWidth))
      }
      void (text.length > 0 && lines.push(text))
      return lines.reduce(
        (acc, line) => (
          acc.length === 0 ? '' 
          : (acc + '\n' + $.whitespaceUnit.repeat($.leftMargin) + ' * '))
          + line,
        '',
      )
    }
  }

export function description(k: string, $: Index): string | null {
  const child = tree.get($.document, ...$.absolutePath, 'properties', k, 'meta', 'description')
  return typeof child !== 'string' ? null : tag('description')(
    child, { 
      leftMargin: $.indent + 2,
      handlers: { string: breaklines(80) }, 
    }
  )
}
