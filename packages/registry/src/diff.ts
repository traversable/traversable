export type { diff, Diff }

import type { Array, Dict, Primitive } from "./types.js"

/**
 * ## {@link diff `diff`}
 *
 * Extract the type-level diff between two arguments. Take a look at the examples to
 * get a sense for how it behaves.
 *
 * **Note:** {@link diff `diff`} is a typelevel function, and is therefore meant to be
 * used as a debugging tool at _compile-time only_.
 *
 * **Note:** {@link diff `diff`} is powered by {@link Diff `Diff`}, which
 * is a WIP. Currently array traversal and optional properties are not supported.
 *
 * @example
 * import { diff } from "@traversable/registry"
 *
 * const ex_01 = diff({ a: { b: { c: 1 } } }, { a: { b: { c: 2 } } })
 * //    ^? const ex_01: [ᐩᐮ: 1, ᐩᐭ: 2, ⴰⴰⴰ: ["a", "b", "c"]]
 *
 * const ex_02 = diff({ a: { b: { c: 1 }, d: 1000 }, e: "left only" }, { a: { b: { c: 2 }, d: 9000 } })
 * //    ^? const ex_02: [ᐩᐮ: 1, ᐩᐭ: 2, ⴰⴰⴰ: ["a", "b", "c"]] | [ᐩᐮ: 1000, ᐩᐭ: 9000, ⴰⴰⴰ: ["a", "d"]] [ᐩᐮ: "left only", ⴰⴰⴰ: ["e"]]
 */
function diff<const L, const R>(left: L, right: R): Diff<L, R>
function diff<const L, const R>(left: L, right: R) {
  return [left, right, []]
}

type Diff<L, R, $ extends Diff.Context = Diff.Context.init> = [L, R] extends [Primitive, Primitive]
  ? Diff.primitives<L, R, $>
  : [L, R] extends [Array, Array]
    ? Diff.arrays<L, R, $>
    : [L, R] extends [Dict, Dict]
      ? Diff.objects<L, R, $>
      : Diff.ᐃ<L, R, $["path"]>

declare namespace Diff {
  type primitives<L, R, _ extends Diff.Context> = L extends R
    ? never
    : R extends L
      ? never
      : Diff.ᐃ<L, R, _["path"]>
  type objects<
    L,
    R,
    _ extends Diff.Context,
    _shared = { [K in keyof (L | R)]: Diff<L[K], R[K], Context.next<K, _>> },
    _L = LeftOnly<L, R, _["path"]>,
    _R = RightOnly<L, R, _["path"]>,
    _out =
      | never
      | Exclude<_L[keyof _L], [never, any]>
      | Exclude<_R[keyof _R], [never, any]>
      | _shared[keyof _shared],
  > = _out

  /**
   * TODO: {@link Diff.arrays `Diff.arrays`}
   */
  type arrays<L, R, _ extends Diff.Context> = [L, R, _]

  interface Context {
    path: readonly (keyof any)[]
  }
  namespace Context {
    type init = never | { path: [] }
    type next<Next, Prev extends Context = Context> = never | { path: [...Prev["path"], Next] }
  }
  type LeftOnly<L, R, _ extends readonly unknown[]> =
    | never
    | {
        [K in keyof L as Exclude<keyof L, keyof R>]: K extends K
          ? [ᐩᐮ: L[Exclude<K, keyof R>], ⴰⴰⴰ: [..._, Exclude<K, keyof R>]]
          : never
      }
  type RightOnly<L, R, _ extends readonly unknown[]> =
    | never
    | {
        [K in keyof R as Exclude<keyof R, keyof L>]: K extends K
          ? [ᐩᐭ: R[Exclude<K, keyof L>], ⴰⴰⴰ: [..._, Exclude<K, keyof L>]]
          : never
      }
  type ᐃ<ᐩᐮ, ᐩᐭ, ⴰⴰⴰ> = never | [ᐩᐮ: ᐩᐮ, ᐩᐭ: ᐩᐭ, ⴰⴰⴰ: ⴰⴰⴰ]
}
