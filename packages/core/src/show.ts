import type { prop, props, unicode } from "@traversable/data"
import { ANSI, char, fn, map } from "@traversable/data"
import { Invariant, PATTERN } from "@traversable/registry"
import type { inline } from "any-ts"

type Nullable =
  | undefined
  | null
  ;
type Scalar =
  | boolean
  | number
  | string
  ;
type Primitive =
  | Nullable
  | Scalar
  ;
type Serializable =
  | Nullable
  | Scalar
  | readonly Serializable[]
  | { [K in string]+?: Serializable }
  ;

type Part<T, K extends keyof T = keyof T> = never | { [P in K]+?: T[P] }

export declare namespace serialize {
  /**
   * ### {@link Hook `serialize.Hook`}
   */
  interface Hook<S = Serializable> 
    { (src: S, ctx: Context): string }

  /**
   * ### {@link Continuation `serialize.Continuation`}
   */
  interface Continuation<S = Serializable>
    { (src: S, ctx: Context): string }

  /**
   * ### {@link HookWithContinuation `serialize.HookWithContinuation`}
   */
  interface HookWithContinuation<S = Serializable> 
    { (src: S, ctx: Context, loop: Hook): string }

  /**
   * ### {@link Options `serialize.Options`}
   */
  type Options = 
    | Preset
    | Part<
      & OptionsBase
      & { colors?: Part<Colors> | ThemeName }
      & { hooks?: Part<Hooks> }
    >

  /**
   * ### {@link OptionsBase `serialize.OptionsBase`}
   */
  type OptionsBase = {
    maxDepth: number
    newline: string
    tab: string
  }

  type ThemeName = keyof typeof themes
  type Preset = keyof typeof presets

  /**
   * ### {@link Context `serialize.Context`}
   */
  interface Context extends 
    OptionsBase, 
    InternalState, 
    inline<{
      colors: Colors
      currentDepth: number
      hooks: Hooks
      offset: number
      path: prop.any[]
    }> {}

  type InternalStateKey = keyof InternalState
  interface InternalState extends inline<{
    offset: number
    currentDepth: number
    path: prop.any[]
    circular: prop.any[][]
    refCount: number
    refs: { pathToSeen: prop.any[], at: prop.any[] }[]
    seen: globalThis.WeakMap<{}, prop.any[]>
  }> {}

  interface Colors {
    array(_: string): string
    bigint(_: string): string
    boolean(_: string): string
    circular(_: string): string
    key(_: string): string
    number(_: string): string
    object(_: string): string
    ref(_: string): string
    string(_: string): string
  }

  /**
   * ### {@link Hooks `serialize.Hooks`}
   */
  interface Hooks extends 
    Branches, 
    Terminals {}

  /**
   * ### {@link Terminals `serialize.Terminals`}
   */
  interface Terminals {
    bigint: Hook<bigint>
    boolean: Hook<boolean>
    circular: Hook<object>
    key: Hook<prop.any>
    null: Hook<Nullable>
    number: Hook<number>
    string: Hook<string>
    truncate: Hook<Serializable>
  }

  /**
   * ### {@link Branches `serialize.Branches`}
   */
  interface Branches {
    array: HookWithContinuation<readonly Serializable[]>
    object: HookWithContinuation<{ [x: string]: Serializable }>
  }
}

/** @internal */
const Object_entries = globalThis.Object.entries
/** @internal */
const Object_is = globalThis.Object.is
/** @internal */
const fn_exhaustive = (_: never) => 
  Invariant.FailedToExhaustivelyMatch("@traversable/core/show::fn_exhaustive", _)
/** @internal */
const Object_isObject 
  : (u: unknown) => u is globalThis.Record<string, unknown>
  = (u): u is never => { return typeof u === "object" && u !== null }
/** @internal */
const Array_isArray: (u: unknown) => u is readonly Serializable[] = globalThis.Array.isArray
/** @internal */
const pathsAreEqual = (x: props.any) => (y: props.any) => {
  if (x.length !== y.length) return false
  for (let ix = 0; ix < x.length; ix++)
    if (!Object_is(x[ix], y[ix])) return false
  return true
}
/** @internal */
const pad 
  : (indent: number, fill?: string) => string
  = (indent, fill = " ") => {
    if(indent <= 0) return ""
    let todo = indent
    let out = ""
    while((todo--) > 0) out = out.concat(fill)
    return out
  }

const bigint
  : serialize.Hook<bigint>
  = (_) => `${_}n`
const boolean
  : serialize.Hook<boolean>
  = globalThis.String
const null_
  : serialize.Hook<Nullable>
  = globalThis.String
const string
  : serialize.Hook<string>
  = (s) => {
    return '"' + char.escape(s) + '"'
  }
const number
  : serialize.Hook<number>
  = (_) => _ + "" // Object_is(_, -0) ? "-0" : _ + ""
const circular
  : serialize.Hook<object>
  = (_, $) => `[Circular #/${$.seen.get(_)!.join("/")}]`

const primitive = (_: Primitive, $: serialize.Context) => {
  switch (true) {
    case (_ == null): return $.hooks.null(_, $)
    case (typeof _) === "boolean": return $.hooks.boolean(_, $)
    case (typeof _) === "number": return $.hooks.number(_, $)
    case (typeof _) === "string": return $.hooks.string(_, $)
    case (typeof _) === "bigint": return $.hooks.bigint(_, $)
    default: return fn_exhaustive(_)
  }
}


/**
 * ## {@link serialize `show.serialize`} 
 * ### ｛ {@link unicode.jsdoc.destructor ` ⛓️‍💥 `} ｝
 */
export function serialize<T extends Serializable>
  (serializable: T, options?: serialize.Options): string
export function serialize<T>
  (serializable: T, options?: serialize.Options): string
export function serialize
  (_: Serializable, options?: serialize.Options): string {
    const $ = contextFromOptions(options)
    let next = contextFromOptions(options)
    void loopRefs(_, next)
    return loop(_, ($.refs = next.refs, $))
  }

function parseKey(k: keyof any): string {
  const s = char.escape(globalThis.String(k))
  const hd = s[0]
  const end = s[s.length - 1]
  return typeof k === "symbol" ? s
    : PATTERN.identifier.test(s) ? s
    : hd === end && (
      hd === '"' || 
      hd === "'" || 
      hd === "`"
    ) ? s
    : '"' + s + '"'
}

function parseJsonKey(key: keyof any): string 
function parseJsonKey(
  k: keyof never, 
): string {
  const s = char.escape(globalThis.String(k))
  const hd = s[0]
  const end = s[s.length - 1]
  return hd === end && hd === '"' ? s : '"' + s + '"'
}

const loopRefs = fn.loopN<[_: Serializable, ctx: serialize.Context], void>(
  (_, $, loop) => {
    switch (true) {
      case $.maxDepth > 0 && $.currentDepth >= $.maxDepth:
      case (_ == null): 
      case (typeof  _) === "boolean":
      case (typeof  _) === "number":
      case (typeof  _) === "string":
      case (typeof  _) === "bigint": return void 0
      case Array_isArray(_): {
        if ($.seen.has(_)) {
          const pathToSeen = $.seen.get(_)
          void $.circular.push(pathToSeen!)
          void $.refs.push({ pathToSeen: pathToSeen!, at: $.path })
          return void 0
        }
        else {
          void ($.seen.set(_, $.path))
          void $.currentDepth++
          void map(_, (_, ix) => loop(_, { ...$, path: [...$.path, ix] }))
          void $.currentDepth--
          return void 0
        }
      }
      case Object_isObject(_): {
        if ($.seen.has(_)) {
          const pathToSeen = $.seen.get(_)
          void $.circular.push(pathToSeen!)
          void $.refs.push({ pathToSeen: pathToSeen!, at: $.path })
          return void 0
        } else {
          void ($.seen.set(_, $.path))
          void $.currentDepth++
          void map(_, (_, ix) => loop(_, { ...$, path: [...$.path, ix] }))
          void $.currentDepth--
          return void 0
        }
      }
      default: return fn.exhaustive(_)
    }
  }
)

const loop = fn.loopN<[_: Serializable, $: serialize.Context], string>(
  (_, $, loop) => {
    switch (true) {
      case $.maxDepth > 0 && $.currentDepth >= $.maxDepth: return $.hooks.truncate(_, $)
      case (_ == null): return $.hooks.null(_, $)
      case (typeof  _) === "boolean": return $.colors.boolean($.hooks.boolean(_, $))
      case (typeof  _) === "number": return $.colors.number($.hooks.number(_, $))
      case (typeof  _) === "string": return $.colors.string($.hooks.string(_, $))
      case (typeof  _) === "bigint": return $.hooks.bigint(_, $)
      case Array_isArray(_): {
        if ($.seen.has(_)) return $.colors.circular($.hooks.circular(_, $))
        else void ($.seen.set(_, $.path))
        return $.hooks.array(_, $, loop)
      }
      case Object_isObject(_): {
        if ($.seen.has(_)) return $.colors.circular($.hooks.circular(_, $))
        else void ($.seen.set(_, $.path))
        return $.hooks.object(_, $, loop)
      }
      default: return fn.exhaustive(_)
    }
  })

const truncate 
  : serialize.Hook<Serializable>
  = (_, $) => {
    return Array_isArray(_) ? $.colors.array("[") + _.map(() => "{…}").join(", ") + $.colors.array("]")
    : Object_isObject(_) ? $.colors.object("[Object]")
    : primitive(_, $)
  }

const object 
  : serialize.HookWithContinuation<{ [x: string]: Serializable }>
  = (_, $, loop) => fn.pipe(
    map(_, 
      (_, k) => {
        return fn.pipe(
          ($.currentDepth++, _),
          (_) => loop(_, { ...$, offset: $.offset + $.tab.length, path: [...$.path, k] }),
          (_) => ($.currentDepth--, _),
        )
      }
    ),
    Object_entries,
    (_) => _.length === 0 ? "{}" : fn.pipe(
      _,
      map(
        ([k, x]) => {
          return $.hooks.key(k, $) + ":" + ($.tab.length === 0 ? "" : " ") + x
        }
      ),
      (_) => _.join("," + $.newline + pad($.offset)),
      (_) => $.colors.object("{") + $.newline + pad($.offset) + _ + $.newline + pad($.offset - $.tab.length) + $.colors.object("}"),
    )
  )

const getPrefix = ($: serialize.Context) => (key: prop.any) => {
  const currentPath = $.path.concat(key)
  const refPaths = $.refs.filter((ref) => pathsAreEqual(currentPath)(ref.pathToSeen))
  return fn.pipe(
    refPaths.reduce((refPath, { at }) => refPath + at.join("/"), ""),
    (ref) => ref.length > 0 ? "<ref #/" + ref + ">" : ref,
    $.colors.ref,
  )
}

const array 
  : serialize.HookWithContinuation<readonly Serializable[]>
  = (_, $, loop) => {
    return fn.pipe(
      _,
      (_) => ($.currentDepth++, _),
      map((_, ix) => loop(_, { ...$, offset: $.offset + $.tab.length, path: [...$.path, ix] })),
      (_) => ($.currentDepth--, _),
      (_) => _.join("," + $.newline + pad($.offset)),
      (_) => $.colors.array("[") + $.newline + pad($.offset) + _ + $.newline + pad($.offset - $.tab.length) + $.colors.array("]"),
    )
  }

const key
  : serialize.Hook<prop.any>
  = (_, $) => {
    const prefix = getPrefix($)(_)
    return prefix + $.colors.key(parseKey(_)) // + ":" + ($.tab.length > 0 ? " " : "")
  }

const hooks = {
  array,
  bigint,
  boolean,
  circular,
  key,
  null: null_,
  number,
  object,
  string,
  truncate,
} satisfies serialize.Hooks

const jsonKey = parseJsonKey satisfies serialize.Hook<prop.any>

const colors = {
  boolean: fn.identity, 
  string: fn.identity,
  array: fn.identity,
  bigint: fn.identity,
  circular: fn.identity,
  key: fn.identity,
  number: fn.identity,
  object: fn.identity,
  ref: fn.identity,
} satisfies serialize.Colors

const Hask = {
  array(_) { return ANSI.Hask.body.bg(ANSI.Hask.identifierTerm.fg(_)) + ""},
  bigint(_) { return ANSI.Hask.body.bg(ANSI.Hask.pragma.fg(_)) + "" },
  boolean(_) { return ANSI.Hask.body.bg(ANSI.Hask.glyph.fg(_)) + "" },
  key(_) { return ANSI.Hask.body.bg(ANSI.Hask.identifierType.fg(_)) + "" },
  number(_) { return ANSI.Hask.body.bg(ANSI.Hask.pragma.fg(_)) + "" },
  object(_) { return ANSI.Hask.body.bg(ANSI.Hask.comment.fg(_ )) + "" },
  string(_) { return ANSI.Hask.body.bg(ANSI.Hask.link.fg(_)) + "" },
  circular(_) { return ANSI.yellow.bg(ANSI.red.fg(_)) + "" },
  ref(_) { return ANSI.lightblue(_) },
} satisfies serialize.Colors

const HaskAlt = {
  array(_) { return ANSI.Hask.body.bg(ANSI.Hask.identifierType.fg(_)) + ""},
  bigint(_) { return ANSI.Hask.body.bg(ANSI.Hask.pragma.fg(_)) + "" },
  boolean(_) { return ANSI.Hask.body.bg(ANSI.Hask.link.fg(_)) + "" },
  key(_) { return ANSI.Hask.body.bg(ANSI.Hask.identifierTerm.fg(_)) + "" },
  number(_) { return ANSI.Hask.body.bg(ANSI.Hask.pragma.fg(_)) + "" },
  string(_) { return ANSI.Hask.body.bg(ANSI.Hask.glyph.fg(_)) + "" },
  object(_) { return ANSI.Hask.body.bg(ANSI.Hask.comment.fg(_ )) + "" },
  circular(_) { return ANSI.yellow.bg(ANSI.red.fg(_)) + "" },
  ref(_) { return ANSI.lightblue(_) },
} satisfies serialize.Colors

const Leuven = {
  array(_) { return ANSI.Leuven.body.bg(ANSI.Leuven.identifierType.fg(_)) + ""},
  bigint(_) { return ANSI.Leuven.body.bg(ANSI.Leuven.pragma.fg(_)) + "" },
  boolean(_) { return ANSI.Leuven.body.bg(ANSI.Leuven.link.fg(_)) + "" },
  key(_) { return ANSI.Leuven.body.bg(ANSI.Leuven.identifierTerm.fg(_)) + "" },
  number(_) { return ANSI.Leuven.body.bg(ANSI.Leuven.pragma.fg(_)) + "" },
  string(_) { return ANSI.Leuven.body.bg(ANSI.Leuven.glyph.fg(_)) + "" },
  object(_) { return ANSI.Leuven.body.bg(ANSI.Leuven.comment.fg(_ )) + "" },
  circular(_) { return ANSI.yellow.bg(ANSI.red.fg(_)) + "" },
  ref(_) { return ANSI.lightblue(_) },
} satisfies serialize.Colors

const themes = {
  Hask,
  HaskAlt,
  Leuven,
} satisfies Record<string, serialize.Colors>

const defaults = {
  maxDepth: 10,
  newline: "",
  tab: "",
  hooks,
  colors,
} satisfies globalThis.Omit<serialize.Context, keyof serialize.InternalState> //StateKey>

const presets = {
  json: {
    ...defaults,
    hooks: {
      ...hooks,
      key: jsonKey,
    },
  },
  minify: {
    ...defaults,
    newline: "",
    tab: "",
    hooks: {
      ...hooks,
      key: jsonKey,
    },
  },
  pretty: {
    ...defaults,
    colors: Hask,
    newline: "\n",
    tab: "  ",
  },
  pretty_2: {
    ...defaults,
    colors: HaskAlt,
    newline: "\n",
    tab: "  ",
  },
  leuven: {
    ...defaults,
    colors: Leuven,
    newline: "\n",
    tab: " ",
  },
  readable: {
    ...defaults,
    newline: "\n",
    tab: "  ",
    hooks: {
      ...defaults.hooks,
      key,
    },
  },
} as const satisfies Record<string, Omit<serialize.Context, serialize.InternalStateKey>>

const contextFromOptions 
  : (fromUser?: serialize.Options ) => serialize.Context
  = (fromUser?: serialize.Options ) => {
    const preset = presets.minify
    const internal = {
      seen: new globalThis.WeakMap(),
      path: [],
      refCount: 0,
      refs: [],
      circular: [],
      currentDepth: 0,
      offset
        : typeof fromUser === "object" 
        ? (fromUser?.tab?.length ?? preset.tab.length) 
        : typeof fromUser === "string" ? (presets[fromUser] ?? preset).tab.length
        : preset.tab.length,
    } satisfies serialize.InternalState
    const fallback = {
      ...preset,
      ...internal,
    } satisfies serialize.Context
    return fromUser === undefined ? fallback
    : typeof fromUser === "string" ? ({ 
      ...internal, 
      ...presets[fromUser] ?? preset 
    }) satisfies serialize.Context
    : ({
      ...internal,
      maxDepth: fromUser?.maxDepth ?? fallback.maxDepth,
      tab: fromUser?.tab ?? fallback.tab,
      newline: fromUser?.newline ?? fallback.newline,
      hooks: 
        ( fromUser?.hooks === undefined ? fallback.hooks 
        : typeof fromUser.hooks === "string" 
        ? (presets[fromUser.hooks ?? "default"]) : {
          bigint: fromUser.hooks.bigint ?? fallback.hooks.bigint,
          boolean: fromUser.hooks.boolean ?? fallback.hooks.boolean,
          key: fromUser.hooks.key ?? fallback.hooks.key,
          null: fromUser.hooks.null ?? fallback.hooks.null,
          number: fromUser.hooks.number ?? fallback.hooks.number,
          string: fromUser.hooks.string ?? fallback.hooks.string,
          circular: fromUser.hooks.circular ?? fallback.hooks.circular,
          truncate: fromUser.hooks.truncate ?? fallback.hooks.truncate,
          array: fromUser.hooks.array ?? fallback.hooks.array,
          object: fromUser.hooks.object ?? fallback.hooks.object,
        }
      ) satisfies serialize.Hooks,
      colors: 
        ( fromUser?.colors === undefined ? colors 
        : typeof fromUser.colors === "string" 
          ? fromUser.colors in themes ? themes[fromUser.colors] : colors 
        : {
          array: fromUser?.colors?.array ?? colors.array,
          bigint: fromUser?.colors?.bigint ?? colors.bigint,
          boolean: fromUser?.colors?.array ?? colors.boolean,
          key: fromUser?.colors?.key ?? colors.key,
          number: fromUser?.colors?.array ?? colors.number,
          object: fromUser?.colors?.object ?? colors.object,
          string: fromUser?.colors?.array ?? colors.string,
          circular: fromUser?.colors?.circular ?? colors.circular,
          ref: fromUser?.colors?.ref ?? colors.ref,
        }
      ) satisfies serialize.Colors,
  }) satisfies serialize.Context
}
