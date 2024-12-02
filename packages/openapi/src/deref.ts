import { fn, map, Option, prop } from "@traversable/data"
import { is, tree, JsonPointer } from "@traversable/core"
import { Schema } from "./schema.js"
import { openapi } from "./types.js"

type Node = Schema.any | { [x: string]: Schema.any } | readonly Schema.any[]
type Refs = { [$ref: string]: Partial<Schema.any> }

type TempDocument = { 
  paths?: Record<string, Record<string, {}>>
  schemas?: Record<string, Record<string, {}>>
}

type Options = {
  focus?: readonly string[]
  /// TODO: make this type better
  document: TempDocument
}

interface Context extends Options {
  path: prop.any[]
  traversal: prop.any[]
}

/** 
 * ## {@link dereference `openapi.dereference`}
 * 
 * Given a ref node and 
 */
export function dereference(_: TempDocument): {
  (node: Schema.$ref): Option<tree.has<{}>>
  (node: Partial<Schema.$ref>): Option<tree.has<{}>>
}
export function dereference(_: Options): {
  (node: Schema.$ref): Option<tree.has<{}>>
  (node: Partial<Schema.$ref>): Option<tree.has<{}>>
}
export function dereference(opts: Options | TempDocument | Context) {
  const path = "document" in opts ? (opts.focus ?? []).map(JsonPointer.unescape) : []
  const ctx = "document" in opts 
    ? { ...opts, path } satisfies Context
    : { document: opts, path } satisfies Context

  return (node: Schema.$ref) => {
    const prefix = `#${ctx.focus?.join("/") ?? ""}` as const
    return fn.pipe(
      node,
      Option.guard((n) => (n.$ref ?? "").startsWith(prefix)),
      Option.map((n) => [...ctx.focus ?? [], ...(n.$ref ?? "").substring(prefix.length).split("/")]),
      Option.flatMap(
        (path) => fn.pipe(
          ctx.document,
          Option.guard(tree.has(...path)),
          Option.map((x) => tree.get(x, ...path)),
        )
      ),
      Option.chainNullable,
    )
  }
}

const loopRef = 
  (loop: (node: {}, refs: Refs, ctx: Context) => {}) => 
  //   fn.loopN
  // <[node: {}, refs: Refs, ctx: Context], {}>
  ((node: {}, refs: Refs, ctx: Context) => {
    return fn.pipe(
      node,
      Option.guard(tree.has("$ref", is.string)),
      Option.flatMap(
        (hasRef) => fn.pipe(
          hasRef,
          dereference({ document: ctx.document, focus: ctx.focus }),
          fn.tap("dereferenced" + ctx.path.join("/")),
          Option.map(
            fn.flow(
              (x) => loop(x, refs, ctx),

              (done) => {
                /**
                 * Mutate `refs` with the ref
                 */
                console.log("DONE, $ref", hasRef.$ref)
                void (refs[hasRef.$ref] = done)
                return done
              }
            ),
          ),
        ), 
      )
    )
  })

          // x=>x,
          // Option.map(
          // fn.flow(
          //   (x) => loop(x, refs, ctx),
          //   (done) => {
          //     /**
          //      * Mutate `refs` with the ref
          //      */
          //     refs[node.$ref] = done
          //     return done
          //   }
          //   ),
          // )
 
type FullyDerefContinuation = (node: {} | null | undefined, refs: Refs, ctx: Context) => {}

const loopFullyDeref = fn.loopN
  <[node: {} | null | undefined, refs: Refs, ctx: Context], {}>
  ((node, refs, ctx, loop) => {
    console.log("main loop, path:", ctx.path.join("/"))
    // console.log("\n\nREFS AT TOP OF LOOP FULLY DEREF\n", refs)

    switch (true) {
      case is.scalar(node): {
        return node
      }

      case tree.has("$ref", is.string)(node): {
        const $traversal = [...ctx.traversal, node.$ref]
        return fn.pipe(
          loopRef(loop)(node, refs, { ...ctx, traversal: $traversal }),
          () => ({ $ref: node.$ref, $traversal })

        )
      }

      case is.any.array(node): {
        // console.log("array at path", ctx.path.join("/"))
        return fn.pipe(
          node,
          map((x, ix) => loop(x, refs, { ...ctx, path: [...ctx.path, ix] })),
        )
      }

      case is.any.object(node): {
        // console.log("object at path", ctx.path.join("/"))
        return fn.pipe(
          node,
          map((x, k) => loop(x, refs, { ...ctx, path: [...ctx.path, JsonPointer.escape(k)] }))
        )
      }
      
      default: {

        // console.log("fall through at path", ctx.path.join("/"))
        return fn.exhaustive(node as never)
      }
    }
  })

export function fullyDereference(opts: TempDocument | Options) {
  const path = "document" in opts ? (opts.focus ?? []).map(JsonPointer.unescape) : []
  const traversal = [path.join("/")] satisfies Context["traversal"]
  const ctx = "document" in opts 
    ? { ...opts, path, traversal } satisfies Context
    : { document: opts, path, traversal } satisfies Context
  const refs: Refs = {}

  return (start: readonly string[]) => {

    const outish = fn.pipe(
      tree.get(ctx.document, ...start),
      Option.fromNullable,
      Option.map(
        fn.flow(
          (x) => loopFullyDeref(x, refs, ctx),
          x=>x,
        )
      )
    )

    return [refs, outish]
  }
}

function deref(xs: readonly Schema.any[], refs: Record<string, Schema.any>) {

}
