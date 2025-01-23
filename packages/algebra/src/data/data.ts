import { Traversable, core } from "@traversable/core";
import { keyOf$ } from "@traversable/core/guard/combinators";
import { fn, map } from "@traversable/data";
import type { Functor, HKT, Homomorphism, Kind, _, newtype } from "@traversable/registry";
import { homomorphism } from "@traversable/registry";


export type Expr = 
  | Nullary
  | Unary<Expr>
  | Binary<Expr, Expr>
  ;

type Nullary = 
  { kind: "*" }
interface Unary<T> 
  { kind: "* -> *", value: T }
interface Binary<L, R>
  { kind: "* -> * -> *", left: L, right: R }
interface Variadic<T>
  { kind: "(* -> *) -> *" }

type ExprF<R> =
  | Nullary
  | Unary<R>
  | Binary<R, R>
  ;

interface ExprLambda extends HKT { [-1]: ExprF<this[0]> }

namespace Nullary {
  export declare const map: <A, B>(f: (a: A) => B) => (F: Nullary) => Nullary
}
namespace Unary {
  export declare const map: <A, B>(f: (a: A) => B) => (F: Unary<A>) => Unary<B>
}
namespace Binary {
  export const of: <L, R>(left: L, right: R) => Binary<L, R> = (left, right) => ({ kind: "* -> * -> *", left, right })
  export const mapLeft: <A, B>(f: (a: A) => B) => <C>(F: Binary<A, C>) => Binary<B, C> = (f) => (F) => Binary.of(f(F.left), F.right)
  export const mapeRight: <A, B>(f: (a: A) => B) => <C>(F: Binary<C, A>) => Binary<C, B> = (f) => (F) => Binary.of(F.left, f(F.right))
  export const bimap: <A, B>(f: (a: A) => B) => (F: Binary<A, A>) => Binary<B, B> = (f) => (F) => Binary.of(f(F.left), f(F.right))
  export const diag: <A, B, C, D>(f: (a: A) => D, g: (b: B) => C) => (F: Binary<A, B>) => Binary<D, C> = (f, g) => (F) => Binary.of(f(F.left), g(F.right))
}

namespace Variadic {
}

export namespace Expr {
  export const Functor: Functor<ExprLambda> = {
    map(f) {
      return (s) => {
        switch (true) {
          default: return fn.exhaustive(s)
          case s.kind === "*": return Nullary.map(f)(s)
          case s.kind === "* -> *": return Unary.map(f)(s)
          case s.kind === "* -> * -> *": return Binary.bimap(f)(s)
        }
      }
    }
  }
}

namespace Coalgebra {
  // export const Functor: Functor<ExprLambda, Homomorphism> = {
  //   map(f) {
  //     return (s) => {

  //     }
  //   }
  // }
}




// export declare namespace Expr {
  // interface lambda<R = unknown, F extends HKT = Id> extends HKT<R> { [-1]: Expr.F<this[0], F> }
  // type F<R, G extends HKT = Id> =
  //   | Nullary
  //   | Unary<R, Unary.Op, G>
  //   | Binary<R, R, Binary.Op, G>
// }
// export interface Nullary<T = string> { kind: "*", value: T }
// export namespace Nullary { 
//   /** ## {@link is `Nullary.is`} */
//   export const is 
//     : <T>(u: unknown) => u is Nullary<T>
//     = core.allOf$(
//       core.tree.has("kind", core.is.literally("*")),
//       core.tree.has("value"),
//     )
//   /** ## {@link Nullary.term `Nullary.term`} */
//   export const of 
//     : <const T>(value: T) => Nullary<T> 
//     = (value) => ({ kind: "*", value })
//   /** ## {@link Nullary.map `Nullary.map`} */
//   export const map
//     : <A, B>(f: (a: A) => B) => <T>(term: Nullary<T>) => Nullary<T>
//     = fn.constant(fn.identity)
// }

// export interface Unary<R, Op extends Unary.Op = Unary.Op, F extends HKT = Id> 
//   { kind: "* -> *", op: Op, value: Kind<F, R> }

// interface Id extends HKT { [-1]: this[0] }

// export declare namespace Unary {
//   type Op = string
//   /** ## {@link Unary.F `Unary.F`} */
//   interface lambda<Op extends string = string, F extends HKT = Id> extends HKT { [-1]: Unary<this[0], Op, F> }
//   // /** ## {@link Unary.Prefix `Unary.Prefix`} */
//   // interface Prefix<R> extends Unary<R, "prefix"> {}
//   // /** ## {@link Unary.Infix `Unary.Infix`} */
//   // interface Infix<R> extends Unary<R, "infix"> {}
// }

// export namespace Unary {
//   /** ## {@link Unary.is `Unary.is`} */
//   export const is
//     : <R, Op extends Unary.Op>(u: unknown) => u is Unary<R, Op>
//     = core.allOf$(
//       core.tree.has("kind", core.is.literally("* -> *")),
//       core.tree.has("op", core.is.string),
//       core.tree.has("value"),
//     )
//   /** ## {@link Unary.of `Unary.of`} */
//   export const of 
//     : <Op extends Unary.Op>(op: Op) => <const T>(value: T) => Unary<T, Op>
//     = (op) => (value) => ({ kind: "* -> *", op, value })
//   /** ## {@link Unary.prefix `Unary.prefix`} */
//   // export const prefix
//   //   : <const T>(value: T) => Prefix<T> 
//   //   = Unary.of("prefix")
//   // /** ## {@link Unary.infix `Unary.infix`} */
//   // export const infix
//   //   : <const T>(value: T) => Infix<T> 
//   //   = Unary.of("infix")
//   export const map
//     : <A, B>(f: (a: A) => B) => <Op extends Unary.Op>(term: Unary<A, Op>) => Unary<B, Op>
//     = (f) => (term) => Unary.of(term.op)(f(term.value))
// }

// export interface Binary<L, R, Op extends Binary.Op = Binary.Op, F extends HKT = Id> 
//   { kind: "* -> * -> *", op: Op, left: Kind<F, L>, right: Kind<F, R> }

// export declare namespace Binary {
//   type Op = string
//   /** ## {@link Binary.F `Binary.F`} */
//   interface F<Op extends Binary.Op, F extends HKT = Id> extends HKT<[_, _]> { [-1]: Binary<this[0][0], this[0][1], Op, F> }
// }

// export namespace Binary {
//   /** ## {@link Binary.is `Binary.is`} */
//   export const is
//     : <L, R, Op extends Binary.Op>(u: unknown) => u is Binary<L, R, Op>
//     = core.allOf$(
//       core.tree.has("kind", core.is.literally("* -> * -> *")),
//       core.tree.has("op", core.is.string),
//       core.tree.has("left"),
//       core.tree.has("right"),
//     )
//   ///
//   export const of
//     : <Op extends string>(op: Op) => <const L>(left: L) => <const R>(right: R) => Binary<L, R, Op>
//     = (op) => (left) => (right) => ({ kind: "* -> * -> *", op, left, right })
//   ///
//   export const map
//     : <A, B>(f: (a: A) => B) => <Op extends Binary.Op>(term: Binary<A, A, Op>) => Binary<B, B, Op>
//     = (f) => (term) => Binary.of(term.op)(f(term.left))(f(term.right))

//   export const mapLeft
//     : <A, B>(f: (a: A) => B) => <Op extends Binary.Op, C>(term: Binary<A, C, Op>) => Binary<B, C, Op>
//     = (f) => (term) => Binary.of(term.op)(f(term.left))(fn.identity(term.right))

//   export const mapRight
//     : <A, B>(f: (a: A) => B) => <Op extends Binary.Op, C>(term: Binary<C, A, Op>) => Binary<C, B, Op>
//     = (f) => (term) => Binary.of(term.op)(fn.identity(term.left))(f(term.right))
// }

// export namespace Indexed {
//   /** ## {@link Indexed.is `Indexed.is`} */
//   export const is
//     : <T>(u: unknown) => 
// }

// const evaluate = (expr: Expr.F<string[]>) => {
//   if (expr.kind === "* -> * -> *") {
//     expr.left
//   }


// }

// namespace Path {

// declare const expr: Expr.F<Traversable>

// if ("left" in expr) {
//   expr.left
// }

// export namespace Coalgebra {

//   export const fromTraversable
//     : Functor.Coalgebra<Expr.lambda, Traversable>
//     = (expr) => {
//       switch (true) {
//         default: return fn.exhaustive(expr)
//         case expr.type === "null": return Nullary.of("null")
//         case expr.type === "boolean": return Nullary.of("boolean")
//         case expr.type === "integer": return Nullary.of("integer")
//         case expr.type === "number": return Nullary.of("number")
//         case expr.type === "string": return Nullary.of("string")
//         case expr.type === "enum": return Nullary.of("enum")
//         // return Unary.of("enum")(expr.enum.map(fn.flow(globalThis.String), Nullary.of))
//         case expr.type === "allOf": return Unary.of("allOf")(expr.allOf)
//         case expr.type === "anyOf": return Unary.of("allOf")(expr.anyOf)
//         case expr.type === "oneOf": return Unary.of("oneOf")(expr.oneOf)
//         case expr.type === "array": return Unary.of("array")(expr.items)
//         case expr.type === "record": return Unary.of("record")(expr.additionalProperties)
//         case expr.type === "object": return Unary.of("object")(expr.properties)
//         case expr.type === "tuple": return Unary.of("tuple")(expr.items)
//       }
//     }
// }

// export namespace Algebra {
//   export const jsdoc
//   : <const T extends Record<keyof any, keyof any>>(table: T) => Functor.Algebra<Expr.lambda, Expr.F<(keyof any)[]>>
//   = (table) => (x) => {
//     const lookup
//       : (k: keyof any) => keyof any
//       = (k) => keyOf$(table)(k) ? table[k] 
//         : fn.throw("Lookup failed in 'Algebra.jsdoc.Unary.is', got:", x)

//     switch (true) {
//       default: return fn.exhaustive(x)
//       case Nullary.is(x): return x.value
//       case Unary.is(x): return x.value
//       case Binary.is(x): return x.left
//       }
//     }
//   }
// }
//         return 
//         // x.value.map(
//         //   fn.flow(
//         //     lookup,
//         //     x=>x,
//         //   )
//         // )
//         // fn.pipe(
//         //   x,
//         //   Unary.map(map(lookup)),
//         //   x=>x.value,
//         // )
//         // Unary.map(lookup)(x)
//       // case Binary.is(x): {
//       //   const xsss = fn.pipe(
//       //     // x.left.map(lookup),
//       //     Binary.of(x.op)(x.left.map(lookup))(x.right.map(lookup)),
//       //     x=>x,
//       //     // x=>x,
//       //   )

//       //   const y = Binary.mapLeft(lookup)(x.left.map(lookup))
//       //   return fn.pipe(
//       //     x,
//       //     Binary.mapLeft(lookup),
//       //   ) as never
//         // [...x.left, ...x.right]


// /**
//  * @example
//  * {
//  *   type: "object",
//  *   required: ["a"],
//  *   properties: {
//  *     a: { "type": "string" },
//  *     b: {
//  *       type: "object",
//  *       required: [],
//  *       properties: {
//  *         c: { type: "integer" }
//  *       }
//  *     }
//  *   }
//  * }
//  */

// Binary.of("object")(

// )
