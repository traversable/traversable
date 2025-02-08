import type { _, Functor, IndexedFunctor, HKT, inline, Kind } from "@traversable/registry"
import { fn, map, object, string } from "@traversable/data"
import { Json } from "../json.js"

export {
  type Options,
  type Handlers,
  algebra,
  defaults,
  multiline,
}

/** @internal */
const isArray: <T>(u: unknown) => u is readonly T[] = globalThis.Array.isArray

type Handlers = { 
  null(node: null, config: Config): string
  undefined(node: undefined, config: Config): string
  boolean(node: boolean, config: Config): string
  number(node: number, config: Config): string
  string(node: string, config: Config): string
  array(node: readonly string[], config: Config): string
  object(node: Record<string, string>, config: Config): string
}

interface lambda extends HKT { [-1]: Context }

type Context = {
  depth: number
  offset: number
  isRoot: boolean
  bracketsSeparator: Options['bracketsSeparator']
  bracesSeparator: Options['bracesSeparator']
  indent: {} & Options['indent']
  keyValueSeparator: {} & Options['keyValueSeparator']
  leftGutter: {} & Options['leftGutter']
  leftPadding: {} & Options['leftPadding']
  leftMargin: {} & Options['leftMargin']
  maxWidth: {} & Options['maxWidth']
  wrapWith: {} & Options['wrapWith']
  whitespaceUnit: {} & Options['whitespaceUnit']
}

let firstRun = true
const MultilineFunctor: IndexedFunctor<Context, Json.lambda, Json.any> = {
  map: Json.map,
  mapWithIndex(f) {
    return (ctx, x) => {
      console.log('depth for x: ' + globalThis.JSON.stringify(x), ctx.depth)
      console.log('indent', ctx.indent)
      console.log('isRoot', ctx.isRoot)
      console.log('offset', ctx.offset)
      switch (true) {
        default: return fn.exhaustive(x)
        case x == null:
        case x === true:
        case x === false:
        case typeof x === 'number':
        case typeof x === 'string': return x
        case isArray(x): {
          const out = x.map((y) => f({ 
            ...ctx, 
            depth: ctx.depth + 1, 
            indent: ctx.indent + 1,
            isRoot: firstRun,
            offset: ctx.offset + ctx.indent,
          }, y))
          return (firstRun = false, out)
        }
        case !!x && typeof x === 'object': {
          const out = map(x, (y) => f({ 
            ...ctx, 
            depth: ctx.depth + 1,
            // indent: STATIC
            leftPadding: ctx.leftPadding + ctx.depth * ctx.indent,
            isRoot: firstRun,
            offset: ctx.offset + ctx.indent,
          }, y))
          return (firstRun = false, out)
        }
      }
    }
  }
}

type Algebra<Ctx> = Functor.IxAlgebra<Ctx, Json.lambda, string>
const algebra: Algebra<Context> = (ctx, x) => {
  switch (true) {
    default: return fn.exhaustive(x)
    case x === null: return 'null'
    case x === undefined: return 'undefined'
    case x === true: return 'true'
    case x === false: return 'false'
    case typeof x === 'number': return `${x}`
    case typeof x === 'string': return `"${x}"`
    case isArray(x): return x.length === 0 ? '[]' : fn.pipe(
      x.join(
        notTooLong(
          ctx.maxWidth, ctx.offset)(x) ? ', ' 
          : `,\n${ctx.whitespaceUnit.repeat(Math.max(0, ctx.leftPadding))}${ctx.leftGutter}${ctx.whitespaceUnit.repeat(Math.max(0, ctx.offset))}`
      ),
      (s) => notTooLong(ctx.maxWidth, ctx.offset)(s) ? s
      : string.between(
        `\n${ctx.whitespaceUnit.repeat(Math.max(0, ctx.leftMargin))}${ctx.leftGutter}${ctx.whitespaceUnit.repeat(Math.max(0, ctx.offset))}`,
        `\n${ctx.whitespaceUnit.repeat(Math.max(0, ctx.leftMargin))}${ctx.leftGutter}${ctx.whitespaceUnit.repeat(Math.max(0, ctx.offset))}`
      )(s),
      (s) => fn.pipe(
        s,
        string.between(''
          + '['
          +  ( notTooLong(ctx.maxWidth, ctx.offset)(s) ? ctx.bracketsSeparator : '' )
          ,  ( notTooLong(ctx.maxWidth, ctx.offset)(s) ? ctx.bracketsSeparator : '' )
          + ']',
        )
      )
    )
    case !!x && typeof x === 'object': {
      const xs = globalThis.Object.entries(x)
      return xs.length === 0 ? '{}' : fn.pipe(
        xs.map(([k, v]) => object.parseKey(k) + ':' + ctx.keyValueSeparator + v),
        (xs) => xs.join(
          notTooLong(ctx.maxWidth, ctx.offset)(xs)
          ? ', '
          : `,\n${ctx.whitespaceUnit.repeat(Math.max(0, ctx.leftMargin))}${ctx.leftGutter}${ctx.whitespaceUnit.repeat(Math.max(0, ctx.offset))}`
        ),
        (s) => notTooLong(ctx.maxWidth, ctx.offset)(s) ? s
        : string.between(
          `\n${ctx.whitespaceUnit.repeat(Math.max(0, ctx.leftMargin))}${ctx.leftGutter}${ctx.whitespaceUnit.repeat(Math.max(0, ctx.offset))}`,
          `\n${ctx.whitespaceUnit.repeat(Math.max(0, ctx.leftMargin))}${ctx.leftGutter}${ctx.whitespaceUnit.repeat(Math.max(0, ctx.offset))}`,
        )(s),
        (s) => string.between(''
          + '{'
          +  ( notTooLong(ctx.maxWidth, ctx.offset)(s) ? ctx.bracesSeparator : '' )
          ,  ( notTooLong(ctx.maxWidth, ctx.offset)(s) ? ctx.bracesSeparator : '' )
          + '}',
        )(s),
      )
    }
  }
}

const fold = fn.cataIx(MultilineFunctor)(algebra)

const multiline 
  : (json: Json.any, options?: Options) => string
  = (json, options) => ''
    + (options?.wrapWith?.[0] ?? '') 
    + fold({ ...defaults, ...options, isRoot: true, depth: 1, offset: options?.indent ?? defaults.indent }, json)
    // + fold(fn.tap("options")({ ...defaults, ...options, depth: 0, offset: 0 }), json)
    + (options?.wrapWith?.[1] ?? '')


/** @internal */
function parseOptions(options?: Options): Config
function parseOptions(options?: Options): Config {
  return !options ? { ...defaults, offset: 0 } satisfies Config : { 
    offset: 0 satisfies Config['offset'],
    indent: (options?.indent ?? defaults.indent) satisfies Config['indent'],
    maxWidth: (options?.maxWidth ?? defaults.maxWidth) satisfies Config['maxWidth'],
    wrapWith: (options?.wrapWith || defaults.wrapWith) satisfies Config['wrapWith'],
    leftMargin: (options?.leftMargin ?? defaults.leftMargin) satisfies Config['leftMargin'],
    leftPadding: (options?.leftPadding ?? defaults.leftPadding) satisfies Config['leftPadding'],
    leftGutter: (options?.leftGutter ?? defaults.leftGutter) satisfies Config['leftGutter'],
    handlers: (!options.handlers ? defaults.handlers : {
      undefined: options.handlers.undefined || defaults.handlers.undefined,
      null: options.handlers.null || defaults.handlers.null,
      boolean: options.handlers.boolean || defaults.handlers.boolean,
      string: options.handlers.string || defaults.handlers.string,
      number: options.handlers.number || defaults.handlers.number,
      array: options.handlers.array || defaults.handlers.array,
      object: options.handlers.object || defaults.handlers.object,
    }) satisfies Config['handlers'],
    whitespaceUnit: (options?.whitespaceUnit ?? defaults.whitespaceUnit) satisfies Config['whitespaceUnit'],
    bracesSeparator: (options?.bracesSeparator ?? defaults.bracesSeparator) satisfies Config['bracesSeparator'],
    bracketsSeparator: (options?.bracesSeparator ?? defaults.bracketsSeparator) satisfies Config['bracketsSeparator'],
    keyValueSeparator: (options?.keyValueSeparator ?? defaults.keyValueSeparator) satisfies Config['keyValueSeparator'],
  } satisfies Config
}

/** @internal */
function notTooLong(max: number, offset: number): (ss: string | readonly string[]) => boolean {
  return (ss) => max > ' * '.length + (
    typeof ss === 'string' 
      ? ss.length 
      : ss.reduce((x, y) => x + y.length, offset)
  )
}

const defaults = {
  indent: 2,
  leftGutter: '', //  * ', // TODO: don't use this as the default
  leftPadding: 0,
  leftMargin: 0,
  // rightPadding: 0,
  // rightMargin: 0,
  bracesSeparator: ' ',
  bracketsSeparator: ' ',
  keyValueSeparator: ' ',
  maxWidth: 100,
  wrapWith: ['', ''] satisfies [any, any],
  whitespaceUnit: ' ',
  ///
  offset: 0,
  handlers: {
    null(x) { return `${x}` },
    undefined(x) { return `${x}` },
    boolean(x) { return `${x}` },
    number(x) { return `${x}` },
    string(x) { return `"${x}"` },
    array(xs, $) { 
      return xs.length === 0 ? '[]' : fn.pipe(
        xs.join(
          notTooLong(
            $.maxWidth, $.offset)(xs) ? ', ' 
            : `,\n${$.whitespaceUnit.repeat($.leftPadding)} * ${$.whitespaceUnit.repeat($.offset)}`
        ),
        (s) => notTooLong($.maxWidth, $.offset)(s) ? s
        : string.between(
          `\n${$.whitespaceUnit.repeat($.leftMargin)} * ${$.whitespaceUnit.repeat($.offset)}`,
          `\n${$.whitespaceUnit.repeat($.leftMargin)} * ${$.whitespaceUnit.repeat($.offset - $.indent)}`
        )(s),
        (s) => fn.pipe(
          s,
          string.between(''
            + '['
            +  ( notTooLong($.maxWidth, $.offset)(s) ? $.bracketsSeparator : '' )
            ,  ( notTooLong($.maxWidth, $.offset)(s) ? $.bracketsSeparator : '' )
            + ']',
          )
        )
      )
    },
    object(x, $) {
      const xs = globalThis.Object.entries(x)
      return xs.length === 0 ? '{}' : fn.pipe(
        xs.map(([k, v]) => object.parseKey(k) + ':' + $.keyValueSeparator),
        (xs) => xs.join(
          notTooLong($.maxWidth, $.offset)(xs)
          ? ', '
          : `,\n${$.whitespaceUnit.repeat($.leftMargin)} * ${$.whitespaceUnit.repeat($.offset)}`
        ),
        (s) => notTooLong($.maxWidth, $.offset)(s) ? s
        : string.between(
          `\n${$.whitespaceUnit.repeat($.leftMargin)} * ${$.whitespaceUnit.repeat($.offset)}`,
          `\n${$.whitespaceUnit.repeat($.leftMargin)} * ${$.whitespaceUnit.repeat($.offset - $.indent)}`,
        )(s),
        (s) => string.between(''
          + '{'
          +  ( notTooLong($.maxWidth, $.offset)(s) ? $.bracesSeparator : '' )
          ,  ( notTooLong($.maxWidth, $.offset)(s) ? $.bracesSeparator : '' )
          + '}',
        )(s),
      )
    },
  } as const satisfies Config['handlers']
}


interface Config extends inline<{ [K in keyof Options]-?: Options[K] }> { offset: number }

type Options = {
  handlers?: Handlers
  /**
   * ### {@link defaults.indent `Options.indent`}
   *
   * Configures how many
   * {@link defaults.whitespaceUnit `Options.whitespaceUnit`}s
   * should be used when indenting.
   *
   * If unspecified, defaults to {@link defaults.indent `defaults.indent`}.
   *
   * @example
   *  import { Format } from "@traversable/core"
   *
   *  const ex_01 = Format.multiline({ x: { y: { z: 123 } } }, { indent: 4 })
   *
   *  console.log(ex_01) // =>
   *  //  "* {
   *  //   *     x: {
   *  //   *         y: {
   *  //   *             z: 123
   *  //   *         }
   *  //   *     }
   *  //   * }"
   *
   *  const ex_02 = Format.multiline(
   *    { DEF: { GHI: { JKL: 456 } } },
   *    { indent: 2, whitespaceUnit: "\t" },
   *  )
   *
   *  console.log(ex_02) // =>
   *  // "* {
   *  //  * \t\tDEF: {
   *  //  * \t\t\t\tGHI: {
   *  //  * \t\t\t\t\t\tJKL: 123
   *  //  * \t\t\t\t}
   *  //  * \t\t}
   *  //  * }"
   */
  indent?: number,
  /**
   * ### {@link defaults.leftMargin `multiline.Options.leftMargin`}
   *
   * Configures how many
   * {@link defaults.whitespaceUnit `Options.whitespaceUnit`}s
   * should be used when creating the left margin.
   *
   * Note that here, _margin_ translates to roughly "the distance 
   * from column 0, to the type or function that formatting
   * is being applied to", and _padding_ means "the indentation of
   * the current line of code, relative to the margin".
   *
   * If unspecified, defaults to {@link defaults.leftMargin `defaults.leftMargin`}.
   *
   * @example
   *  import { Format } from "@traversable/core"
   *  import * as vi from "vitest"
   *
   *  vi.expect(Format.multiline([1, [2, [3]]], { leftMargin: 4 }))
   *    .toMatchInlineSnapshot(`"     * [ 1, [ 2, [ 3 ] ] ]"`)
   */
  leftMargin?: number,
  /**
   * ### {@link defaults.leftPadding `multiline.Options.leftPadding`}
   *
   * Configures how many
   * {@link defaults.whitespaceUnit `Options.whitespaceUnit`}s
   * should be used when right-indenting.
   *
   * Note that here, _margin_ translates to roughly "the distance 
   * from column 0, to the type or function that formatting
   * is being applied to", and _padding_ means "the indentation of
   * the current line of code, relative to the margin".
   *
   * If unspecified, defaults to {@link defaults.leftPadding `defaults.leftPadding`}.
   *
   * @example
   *  import { Format } from "@traversable/core"
   *  import * as vi from "vitest"
   *
   *  vi.expect(Format.multiline([1, [2, [3]]], { leftPadding: 4 }))
   *    .toMatchInlineSnapshot(`" *     [ 1, [ 2, [ 3 ] ] ]"`)
   */
  leftPadding?: number,
  leftGutter?: string
  /**
   * ### {@link defaults.bracesSeparator `multiline.Options.bracesSeparator`}
   *
   * Configures what character (or characters) should be used when separating object
   * braces (`"{"` and `"}"`) from their contents
   *
   * If unspecified, defaults to
   * {@link defaults.bracesSeparator `defaults.bracesSeparator`}.
   */
  bracesSeparator?: string,
  /**
   * ### {@link defaults.bracketsSeparator `multiline.Options.bracketsSeparator`}
   *
   * Configures what character (or characters) should be used when separating array
   * brackets (`"["` and `"]"`) from their contents
   *
   * If unspecified, defaults to
   * {@link defaults.bracketsSeparator `defaults.bracketsSeparator`}.
   */
  bracketsSeparator?: string,
  /**
   * ### {@link defaults.keyValueSeparator `multiline.Options.keyValueSeparator`}
   *
   * Configures what character (or characters) should be used when separating properties,
   * i.e., what comes after the key + colon (`":"`), but before the value.
   *
   * If unspecified, defaults to
   * {@link defaults.keyValueSeparator `defaults.keyValueSeparator`}.
   */
  keyValueSeparator?: string,
  /**
   * ### {@link defaults.maxWidth `multiline.Options.maxWidth`}
   *
   * Configures the line's maximum width (how many characters before a forced linebreak).
   *
   * If unspecified, defaults to {@link defaults.maxWidth `defaults.maxWidth`}.
   */
  maxWidth?: number,
  /**
   * ### {@link defaults.wrapWith `multiline.Options.wrapWith`}
   *
   * If specified, the final output string will be sandwiched between the left and
   * right elements of {@link defaults.wrapWith `Options.wrapWith`}.
   *
   * If unspecified, defaults to {@link wrapWith `defaults.wrapWith`}.
   */
  wrapWith?: readonly [before: string, after: string],
  /**
   * ### {@link defaults.whitespaceUnit `multiline.Options.whitespaceUnit`}
   *
   * The whitespace unit represents a "space", and acts as the "multiplier" that all of
   * the numeric options use to determine how much whitespace to render. For example,
   * an {@link defaults.whitespaceUnit `Options.whitespaceUnit`} of `"---"`
   * with an {@link defaults.leftMargin `Options.leftMargin`} of `2` produces
   * a left gutter of `6` hyphens, i.e. `"------"`.
   *
   * If unspecified, defaults to {@link defaults.whitespaceUnit `defaults.whitespaceUnit`}.
   */
  whitespaceUnit?: string,
}

