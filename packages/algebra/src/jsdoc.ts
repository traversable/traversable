import type { Json } from "@traversable/core"
import { Format, tree } from "@traversable/core"

import type { Index } from "./shared.js"

/** 
 * ## {@link tag `JSDoc.tag`}
 * 
 * Generates a JSDoc tag for a property node. 
 * 
 * If you need something more flexible, see {@link Format.multiline `core.Format.multiline`}.
 */
export function tag(jsdocTag: string): (u: unknown, options?: Format.multiline.Options) => string
export function tag(jsdocTag: string): (u: Json, $?: Format.multiline.Options) => string {
  return (u: Json, $?: Format.multiline.Options) => 
    Format.multiline(u, { ...$, wrapWith: [' * @' + jsdocTag + '\n', ''] })
}

/** 
 * ## {@link example `JSDoc.example`}
 * 
 * Generates an '@example' tag for a JSDoc property node. 
 */
export function example(k: string, $: Index): string | null {
  const child = tree.get($.document, ...$.absolutePath, "properties", k, "meta", "example")
  return typeof child === "symbol" 
    ? null 
    : tag("example")(child, { leftOffset: $.indent + 2 })
}

export function description(k: string, $: Index): string | null {
  const child = tree.get($.document, ...$.absolutePath, "properties", k, "meta", "description")
  return typeof child === "symbol"
    ? null
    : tag("description")(child, { leftOffset: $.indent + 2 })
}
