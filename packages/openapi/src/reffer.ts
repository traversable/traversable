import { array, fn, map, prop, Result } from "@traversable/data"
import { is, tree, JsonPointer, or } from "@traversable/core"
import { Schema } from "./schema.js"
import { inline } from "any-ts"

type Refs = { [$ref: string]: Partial<Schema.any> }

// TODO: make this type better
type Doc = { 
  paths?: Record<string, Record<string, {}>>
  components?: {
    schemas?: Record<string, Record<string, {}>>
  }
}

type Flags = {
  debug: boolean
  logging: boolean
}

type Options = {
  document: Doc
  focus?: readonly string[]
  deps?: Partial<Deps>
  flags?: Partial<Flags>
}

interface Deps {
  logger: typeof globalThis.console.log
  // escapePath(path: Context["path"]): string
  createRef(path: Context["path"]): string[]
  // createHash(node: {}, ctx: Context): string | number
}

interface InternalState {
  path: prop.any[], 
  refs: Refs 
  cache: globalThis.WeakMap<{}, prop.any[]>
  cycles: { firstSeen: string, loc: string }[]
}

interface Context extends 
  globalThis.Required<globalThis.Omit<Options, "deps" | "flags">>,
  inline<{ deps: globalThis.Required<Deps>, flags: Flags }>,
  InternalState {}

namespace Invariant {
  export const CachedValueCannotBeNullable = (cacheKey: {} | null) =>
    fn.throw("Unexpected cached value of 'undefined' found when using key: ", cacheKey)
  export const UnexpectedNullableValue = () => 
    fn.throw("Encountered 'null' or 'undefined' in a context where a non-nullable value was expected")
}

const hasSchema = tree.has("schema", is.any.object)

const deps = {
  logger: globalThis.console.log,
  // escapePath: fn.flow(
  //   map(JsonPointer.escape),
  //   array.join("/"),
  // ),
  createRef: fn.flow(
    map(JsonPointer.escape),
  ),
} satisfies Context["deps"]

const flags = {
  debug: false,
  logging: false,
} satisfies Context["flags"]


const defaults = {
  path: [],
  cycles: [],
  focus: [],
  refs: {},
  deps,
  flags,
} satisfies Omit<Required<Context>, "cache" | "document">

function initializeContext(opts: Doc | Options, start: readonly string[]): Context {
  const cache = new globalThis.WeakMap() satisfies Context["cache"]
  const document = "document" in opts 
    ? opts.document satisfies Context["document"]
    : opts satisfies Context["document"]
  const deps = "deps" in opts 
    ? { ...defaults.deps, ...opts.deps } satisfies Context["deps"]
    : defaults.deps satisfies Context["deps"]
  const flags = "flags" in opts 
    ? { ...defaults.flags, ...opts.flags } satisfies Context["flags"]
    : defaults.flags satisfies Context["flags"]
  const focus = fn.pipe(
    "focus" in opts && opts.focus || [],
    xs => xs.concat(...start),
    // "deps" in opts && opts.deps?.createRef || defaults.deps.createRef,
  ) satisfies Context["focus"]
  return {
    ...defaults,
    // ..."deps" in opts && { ...defaults.deps, ...opts.deps },
    // ..."flags" in opts && { ...defaults.flags, ...opts.flags },
    deps,
    flags,
    cache,
    document,
    focus,
  } satisfies Context
}

function checkCache<T extends {} | null>(_: T, $: Context): Result<T, { $ref: string }>
function checkCache<T extends {} | null>(_: T, $: Context): Result<T, { $ref: string }> {
  console.log("  -+--> 🔎 AT 🔎", $.path)

  if (is.nullable(_)) return Invariant.UnexpectedNullableValue()
  else if ($.cache.has(_)) {
    const cachedPath = $.cache.get(_)
    console.log(" ⛳️ HAZ AT    ⛳️", $.path)
    console.log(" ⛳️ HAZ CACHED⛳️", cachedPath)
    console.log(" ⛳️ HAZ VALUE ⛳️", _)

    if (cachedPath == null) return Invariant.CachedValueCannotBeNullable(_)
    // const firstSeen = $.deps.escapePath(path)
    // const firstSeen = $.deps.createRef(path).join("/")
    const firstSeen = cachedPath.join("/")

    $.flags.logging && console.log("CACHE HIT", _)
    $.flags.debug && $.cycles.push({ firstSeen, loc: $.path.join("/") })
    void ($.refs[firstSeen] = _)

    return Result.err({ $ref: firstSeen })
  }
  else {
    console.log("  . . . 🚫 AT 🚫", $.path)
    // console.log(" . . . 🚫  no can HAZ, _:    🚫", _)
    void ($.cache.set(_, $.path))
    $.flags.logging && console.log("CACHE MISS", _)
    return Result.ok(_)
  }
}

const loop = fn.loopN<[cursor: {}, ctx: Context], {}>
  ((_, $, loop) => {
    $.flags.logging && (console.log("calling loop", _))
    switch (true) {
      case is.scalar(_): return _
      case is.nullable(_): return _
      case hasSchema(_): {
        console.log("HAS SCHEMA", $.path)
        return fn.pipe(
          checkCache(_.schema, { ...$, refs: $.refs, cache: $.cache, path: $.path }),
          // checkCache(_.schema, { ...$, refs: $.refs, cache: $.cache, path: [...$.path, "schema"] }),
          Result.map(
            (_) => {
              // const path = $.deps.createRef($.path)
              const $ref = $.path.concat("schema").join("/")
              const next = loop(_.schema, { ...$, refs: $.refs, cache: $.cache })
              void ($.refs[$ref] = next)
              
              return { $ref }
            }
          ),
          Result.union,
        )
      }
      case is.array(is.nonnullable)(_): return fn.pipe(
        checkCache(_, $),
        Result.map(map((x, ix) => loop(x, { ...$, refs: $.refs, cache: $.cache, path: [...$.path, ix] }))),
        Result.union,
      )
      case is.any.object(_): return fn.pipe(
        checkCache(_, $),
        Result.map(map((x, ix) => loop(x, { ...$, refs: $.refs, cache: $.cache, path: [...$.path, ix] }))),
        Result.union,
        // map((x, ix) => loop(x, { ...$, refs: $.refs, cache: $.cache, path: [...$.path, ix] }))
      )
      case is.nonnullable(_): return fn.throw(_)
      default: return fn.exhaustive(_)
    }
  })

export const reffer 
  : (opts: Doc | Options) => (start: readonly string[]) => [refs: {}, doc: {}, cycles: {}[]]
  = (opts) => (start) => {
    const ctx = initializeContext(opts, start)
    ctx.flags.logging && void (console.log("Initialized context:", ctx))
    
    const doc = fn.pipe(
      tree.get(ctx.document, ...start) ?? {},
      (x) => loop(x, ctx),
    )

    return [doc, ctx.refs, ctx.cycles]
  }
