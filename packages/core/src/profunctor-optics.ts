import { fn } from "@traversable/data"
import { URI } from "@traversable/registry"
import type { newtype } from "any-ts"

/** 
 * ## {@link Tuple `optic.Tuple`}
 * 
 * Binary [product type](https://en.wikipedia.org/wiki/Product_type).
 * 
 * See also: 
 * - {@link Either `optic.Either`} (dual)
 */
export interface Tuple<A, B> extends newtype<readonly [A, B]> {}
export declare namespace Tuple { export { Tuple_any as any } }
export declare namespace Tuple {
  type first<T extends Tuple.any> = T[0]
  type second<T extends Tuple.any> = T[1]
  type Tuple_any<T extends Tuple<unknown, unknown> = Tuple<unknown, unknown>> = T
}
export namespace Tuple {
  export function of<A, B>(first: A, second: B): Tuple<A, B> { return [first, second] }
  export function first<A, B>(tuple: Tuple<A, B>): A { return tuple[0] }
  export function second<A, B>(tuple: Tuple<A, B>): B { return tuple[1] }
}

/** 
 * ## {@link Either `optic.Either`}
 * 
 * Binary [sum type](https://en.wikipedia.org/wiki/Tagged_union).
 * 
 * See also: 
 * - {@link Tuple `optic.Tuple`} (dual)
 */
export type Either<S, T> = 
  | Either.left<S> 
  | Either.right<T>
  ;
export declare namespace Either { export { Either_any as any } }
export declare namespace Either {
  interface left<T> { _tag: URI.Left, left: T }
  interface right<T> { _tag: URI.Right, right: T }
  interface either<A, B, C> { (either: Either<A, B>): C }
  interface mapLeft<S, T> { <A>(either: Either<S, A>): Either<T, A> }
  interface map<A, B> { <T>(either: Either<T, A>): Either<T, B> }
  interface mapBoth<S, T, A, B> { (either: Either<S, A>): Either<T, B> }
  type Either_any<T extends Either<unknown, unknown> = Either<unknown, unknown>> = T
}
export namespace Either {
  export function left<T>(left: T): Either.left<T> { return { _tag: URI.Left, left } }
  export function right<T>(right: T): Either.right<T> { return { _tag: URI.Right, right } }

  export function map<A, B>(f: (a: A) => B): { <T>(either: Either<T, A>): Either<T, B> }
    { return (either) => Either.isRight(either) ? Either.right(f(either.right)) : either }
  export function mapLeft<S, T>(f: (s: S) => T): { <A>(either: Either<S, A>): Either<T, A> }
    { return (either) => Either.isLeft(either) ? Either.left(f(either.left)) : either }
  export function mapBoth<S, T, A, B>(f: (a: A) => B, g: (s: S) => T): { (either: Either<S, A>): Either<T, B> }
    { return (either) => Either.isRight(either) ? map(f)(either) : mapLeft(g)(either) }

  export function isRight<T, _>(either: Either<_, T>): either is Either.right<T>
    { return either._tag === URI.Right }
  export function isLeft<T, _>(either: Either<T, _>): either is Either.left<T>
    { return either._tag === URI.Left }

  export function fork<A, B, C>(onLeft: (a: A) => C, onRight: (b: B) => C): Either.either<A, B, C>
    { return (either) => Either.isLeft(either) ? onLeft(either.left) : onRight(either.right) }
}

/**
 * ## {@link Profunctor `optic.Profunctor`}
 *
 * - [ ] TODO: Move `Profunctor` to `data.Functor`
 */
export declare namespace Profunctor {
  interface dimap { 
    <S, T, A, B>(f: (s: S) => A, h: (b: B) => T): 
      (g: (a: A) => B) => (s: S) => T 
  }
}
export namespace Profunctor {
  export const dimap
    : Profunctor.dimap
    = (f, h) => (g) => fn.flow(f, g, h)
}

/**
 * ## {@link Iso `optic.Iso`}
 */
export type Iso<S, T, A, B> = (profunctor: (a: A) => B) => (s: S) => T
export declare namespace Iso {}
export namespace Iso {
  export const iso 
    : <S, T, A, B>(f: (s: S) => A, h: (b: B) => T) => Iso<S, T, A, B>
    = Profunctor.dimap
}

/**
 * ## {@link Strong `optic.Strong`}
 */
export declare namespace Strong {
  interface dimap extends Profunctor.dimap {}
  interface first<A, B> 
    { <T>(tuple: Tuple<A, T>): Tuple<B, T> }
  interface second<A, B> 
    { <T>(tuple: Tuple<T, A>): Tuple<T, B> }
}
export namespace Strong {
  /** 
   * ### {@link dimap `optic.Strong.dimap`}
   * See also: 
   * - {@link Profunctor.dimap `Profunctor.dimap`}
   */
  export const dimap: Strong.dimap = Profunctor.dimap

  /** 
   * ### {@link first `optic.Strong.first`}
   */
  export function first<A, B>(f: (a: A) => B): 
    { <T>(tuple: Tuple<A, T>): Tuple<B, T> }
    { return ([a, t]) => Tuple.of(f(a), t) }

  /** 
   * ### {@link second `optic.Strong.second`}
   */
  export function second<A, B>(f: (a: A) => B): 
    { <T>(tuple: Tuple<T, A>): Tuple<T, B> }
    { return ([t, a]) => Tuple.of(t, f(a)) }
}

/**
 * ## {@link Lens `optic.Lens`}
 */
export interface Lens<S, T, A, B> { (strong: (a: A) => B): (s: S) => T }
export interface Lens_<S, A> extends Lens<S, S, A, A> {}
export namespace Lens {
  /** 
   * ### {@link undo `optic.Lens.undo`}
   */
  export const undo
    : <T, B>([b, mapBack]: Tuple<B, (b: B) => T>) => T
    = ([b, mapBack]) => mapBack(b)

  /**
   * ### {@link lens `optic.Lens.lens`}
   */
  export function lens<S, T, A, B>(f: (s: S) => Tuple<A, (b: B) => T>): Lens<S, T, A, B> {
    return (strong) => Strong.dimap(
      f,
      Lens.undo,
    )(Strong.first(strong))
  }

  /**
   * ### {@link lens_ `optic.Lens.lens_`}
   * 
   * Just like `Lens_<S, A>` is shorthand for `Lens<S, S, A, A>`, `Lens.lens_`
   * "fixes" the structure and focus of a `Lens.lens`, ensuring it does not
   * become type-changing when composed.
   * 
   * See also:
   * - {@link lens `optic.Lens.lens`}
   */
  export const lens_
    : <S, A>(f: (s: S) => Tuple<A, (a: A) => S>) => Lens_<S, A> 
    = Lens.lens
}

/**
 * ## {@link Choice `optic.Choice`}
 */
export declare namespace Choice {
  interface dimap extends Profunctor.dimap {}
  interface left<S, T> 
    { <A>(either: Either<S, A>): Either<T, A> }
  interface right<A, B> 
    { <S>(either: Either<S, A>): Either<S, B> }
}
export namespace Choice {
  /** 
   * ### {@link dimap `optic.Choice.dimap`}
   * See also: 
   * - {@link Profunctor.dimap `Profunctor.dimap`}
   */
  export const dimap: Choice.dimap = Profunctor.dimap
  /** 
   * ### {@link left `optic.Choice.left`}
   */
  export function left<S, T>(f: (s: S) => T): { <A>(either: Either<S, A>): Either<T, A> }
    { return (either) => Either.isLeft(either) ? Either.left(f(either.left)) : either }
  /** 
   * ### {@link right `optic.Choice.right`}
   */
  export function right<A, B>(f: (a: A) => B): { <S>(either: Either<S, A>): Either<S, B> }
    { return (either) => Either.isRight(either) ? Either.right(f(either.right)) : either }
}

/** 
 * ## {@link Prism `optic.Prism`}
 */
export interface Prism<S, T, A, B> { (choice: (a: A) => B): (s: S) => T }
export interface Prism_<S, A> extends Prism<S, S, A, A> {}
export namespace Prism {
  /** 
   * ### {@link right `optic.Prism.right`}
   */
  export const right
    : <B, A>(f: (b: B) => A) => (either: Either<A, B>) => A
    = (f) => Either.fork(fn.identity, f)
  /** 
   * ### {@link prism `optic.Prism.prism`}
   */
  export const prism
    : <S, T, A, B>(
      to: (s: S) => Either<T, A>, 
      from: (b: B) => NoInfer<T>
    ) => Prism<S, T, A, B>
    = (to, from) => (choice) => 
      Profunctor.dimap(
        to,
        Prism.right(from),
      )(Choice.right(choice))
}
