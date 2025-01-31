import { is } from "@traversable/core"
import { fn, map, object, string } from "@traversable/data"

/** 
 * ## {@link jsdocTag `Format.jsdocTag`}
 * 
 * Generates a JSDoc tag for a property node. 
 * 
 * If you need something more flexible, see {@link multiline `Format.multiline`}.
 */
export const jsdocTag = (jsdocTag: string) => 
  (...[u, options]: Parameters<typeof multiline>) => 
    multiline(u, { ...options, wrapWith: [' * @' + jsdocTag + '\n', ''] })

/** 
 * ## {@link multiline `Format.multiline`}
 * 
 * Generate a comment spanning zero or more lines. 
 * 
 * Output format can be configured via
 * {@link multiline.Options `multiline.Options`}.
 */
export function multiline(u: {} | null | undefined, options?: multiline.Options): string
export function multiline(
  u: {} | null | undefined, {
    indent: _indent = multiline.defaults.indent,
    leftOffset: _left = multiline.defaults.leftOffset,
    rightOffset: _right = multiline.defaults.rightOffset,
    maxWidth: _maxWidth = multiline.defaults.maxWidth,
    bracesSeparator: BRACE = multiline.defaults.bracesSeparator,
    bracketsSeparator: BRACK = multiline.defaults.bracesSeparator,
    keyValueSeparator: KV = multiline.defaults.keyValueSeparator,
    whitespaceUnit: __ = multiline.defaults.whitespaceUnit,
    wrapWith = multiline.defaults.wrapWith,
  }: multiline.Options = multiline.defaults
) {
  const indent = Math.max(_indent, 0)
  const lhsOffset = Math.max(_left, 0)
  const rhsOffset = Math.max(_right, 0)
  const maxWidth = Math.max(_maxWidth, 10)
  const loop = fn.loopN<[x: {} | null | undefined, offset: number], string>(
    (x, offset, loop) => {
      switch (true) {
        default: return fn.exhaustive(x)
        case is.null(x):
        case is.undefined(x):
        case is.boolean(x):
        case is.number(x): return `${x}`
        case is.string(x): return `"${x}"`
        case is.array(x): return (
          x.length === 0 ? '[]' : 
          fn.pipe(
            x.map((u) => loop(u, offset + indent)),
            (xs) => xs.join(
              notTooLong(xs) 
              ? `, ` 
              : `,\n${__.repeat(lhsOffset)} * ${__.repeat(offset)}`
            ),
            (s) => notTooLong(s) ? s 
            : string.between(
              `\n${__.repeat(lhsOffset)} * ${__.repeat(offset)}`,
              `\n${__.repeat(rhsOffset)} * ${__.repeat(offset - indent)}`
            )(s),
            (s) => fn.pipe(
              s,
              string.between(''
                + '['
                +  ( notTooLong(s) ? BRACK : '' )
                ,  ( notTooLong(s) ? BRACK : '' )
                + ']',
              )
            )
          )
        )
        case is.object(x): return fn.pipe(
          globalThis.Object.entries(x),
          (xs) => xs.length === 0 ? '{}' : 
          fn.pipe(
            xs,
            map(([k, v]) => object.parseKey(k) + ':' + KV + loop(v, offset + indent)),
            (xs) => xs.join(
              notTooLong(xs) 
              ? ', ' 
              : `,\n${__.repeat(lhsOffset)} * ${__.repeat(offset)}`
            ),
            (s) => notTooLong(s) ? s 
            : string.between(
              `\n${__.repeat(lhsOffset)} * ${__.repeat(offset)}`,
              `\n${__.repeat(lhsOffset)} * ${__.repeat(offset - indent)}`,
            )(s),
            (s) => string.between(''
              + '{'
              +  ( notTooLong(s) ? BRACE : '' )
              ,  ( notTooLong(s) ? BRACE : '' )
              + '}',
            )(s)
          )
        )
        case is.nonnullable(x): return ''
      }
      function notTooLong(ss: string | string[]): boolean {
        return maxWidth 
          > 0
          + ' * '.length 
          + offset 
          + (typeof ss === 'string' ? ss : ss.join()).length
      }
    }
  )

  return ''
    + wrapWith[0]
    + `${__.repeat(lhsOffset)} * ${__.repeat(rhsOffset)}`
    + loop(u, rhsOffset + indent)
    + wrapWith[1]
}

export declare namespace multiline {
  type Options = {
    indent?: number
    leftOffset?: number
    rightOffset?: number
    bracesSeparator?: string
    bracketsSeparator?: string
    keyValueSeparator?: string
    whitespaceUnit?: string
    wrapWith?: [before: string, after: string]
    maxWidth?: number
  }
}
export namespace multiline {
  export const defaults = {
    indent: 2,
    leftOffset: 0,
    rightOffset: 0,
    wrapWith: ['', ''],
    whitespaceUnit: ' ',
    bracesSeparator: ' ',
    bracketsSeparator: ' ',
    keyValueSeparator: ' ',
    maxWidth: 100,
  } satisfies Required<multiline.Options>
}
