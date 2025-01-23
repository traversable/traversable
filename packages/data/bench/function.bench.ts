import * as path from "node:path"
import { bench } from "@traversable/bench"
import { fn, map } from "@traversable/data"
import type { Functor, HKT, Kind, Traversable, Typeclass, _ } from "@traversable/registry"

import * as fc from "fast-check"


/////////////////
///    Fix    ///
export interface Fix<F extends HKT, T> 
  { unfixed: Fix.Unfixed<F, T> }
declare namespace Fix {
  export type Unfixed<F extends HKT, T> = Kind<F, Fix<F, T>>
  export interface lambda extends HKT<[F: HKT, T: _]> 
    { [-1]: Fix<this[0][0], this[0][1]> }
}

namespace Fix {
  export const fix
    : <F extends HKT, T>(unfixed: Fix.Unfixed<F, T>) => Fix<F, T> 
    = unfixed => ({ unfixed })
  export const unfix
    : <F extends HKT, T>(fixed: Fix<F, T>) => Fix.Unfixed<F, T> 
    = (fixed) => fixed.unfixed
}
///    Fix    ///
/////////////////

type Fold<F extends HKT, T> = (fixed: Fix<F, T>) => T

namespace Invariant {
  export function imap
    <F extends HKT, _F = any>(F: Functor<F, _F>)
      : <S, T>(
        alg: Functor.Algebra<F, S>, 
        to: (s: S) => T, 
        from: (t: T) => S
      ) => (x: Kind<F, T>) 
        => T

  export function imap<F extends HKT>(F: Functor<F>) {
    return <S, T>(
      alg: Functor.Algebra<F, S>, 
      to: (s: S) => T, 
      from: (t: T) => S
    ) => (x: Kind<F, T>) => fn.pipe(
      x,
      F.map(from),
      alg,
      to,
    )
  }
}

declare namespace Recursive {
  export type Catamorphism = { <F extends HKT>(F: Traversable<F>): <T>(g: Functor.Algebra<F, T>) => Fold<F, T> }
}

const PATH = {
  reports: path.join(path.resolve(), "packages", "data", "bench", "__reports__"),
} as const

const Array_isArray 
  : <T>(u: unknown) => u is readonly T[]
  = globalThis.Array.isArray
const JSON_stringify = globalThis.JSON.stringify
const Object_keys = globalThis.Object.keys

type Json = null | boolean | number | string | readonly Json[] | { [x: string]: Json }
declare namespace Json {
  type F<R> = null | boolean | number | string | readonly R[] | { [x: string]: R }
  interface lambda extends HKT { [-1]: F<this[0]> }
}

namespace Json {
  export const Functor: Functor<Json.lambda, Json> = {
    map(f) { 
      return (x) => {
        switch (true) {
          default: return fn.exhaustive(x)
          case x == null: return x
          case typeof x === "boolean": return x
          case typeof x === "number": return x
          case typeof x === "string": return x
          case Array_isArray(x): return map(x, f)
          case !!x && typeof x === "object": return map(x, f)
        }
      }
    }
  }

  export const fold = fn.cata(Json.Functor)
  export const unfold = fn.ana(Json.Functor)

  export const prettyPrintAlgebra: Functor.Algebra<Json.lambda, string> = (x) => {
    switch (true) {
      default: return fn.exhaustive(x)
      case x == null: return "null"
      case typeof x === "boolean": return `${x}`
      case typeof x === "number": return `${x}`
      case typeof x === "string": return JSON_stringify(x)
      case Array_isArray(x): return "[" + x.join(", ") + "]"
      case !!x && typeof x === "object": return ""
        + "{" 
        + Object_keys(x)
          .map((k) => JSON_stringify(k) + ": " + x[k]) 
          .join(", ")
        + "}"
    }
  }
}

// const rmChars = string.rmChars(" ", "(", ")", "-")
// const oracle = (s: string) => {
//   return s
//     .replaceAll(" ", "")
//     .replaceAll("(", "")
//     .replaceAll(")", "")
//     .replaceAll("-", "")
// }
// const outdir = PATH.reports
// const dataset = fc.sample(fc.string(), 10000)
// const benchmarks = [
//   ["rmChars", () => dataset.map(rmChars)],
//   ["oracle", () => dataset.map(oracle)],
// ] satisfies bench.Config["benchmarks"]
// void bench.run({ name: "string.rmChars", outdir, benchmarks })

