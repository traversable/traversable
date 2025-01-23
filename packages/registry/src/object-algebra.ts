import { HKT, _ } from "@traversable/registry/src/types"
import type { newtype } from "any-ts"
import { symbol } from "./symbol.js"

interface InvalidJson<_> {
  [symbol.TypeError]?: _
  [symbol.unit]: never
}

type JsonInductive<T> = [T] extends [undefined]
  ? InvalidJson<undefined>
  : [T] extends [(...args: any) => any]
    ? InvalidJson<globalThis.Function>
    : [T] extends [globalThis.Date]
      ? InvalidJson<globalThis.Date>
      : [T] extends [null]
        ? null
        : [T] extends [boolean]
          ? boolean
          : [T] extends [number]
            ? number
            : [T] extends [string]
              ? string
              : [T] extends [readonly unknown[]]
                ? { [I in keyof T]: JsonInductive<T[I]> }
                : [T] extends [object]
                  ? { [K in keyof T]: JsonInductive<T[K]> }
                  : {} | null

declare const record: Record<string, number | boolean>

declare function jsonInductive<T extends JsonInductive<T>>(json: T): T

jsonInductive({
  a: { b: { c: 1, d: [1, 2, 3, Math.random(), Math.random() > 1 ? true : "false"], e: record } },
})

interface Schema<S> {}

interface SchemaAlgebra<S> {
  const(value: {}): S
  array(): S[]
  record(): Record<string, S>
  product<T>(other: T): [S, T]
  intersection<T>(other: T): S & T
  union<T>(other: T): S | T
  sum<D extends keyof any, T>(discriminant: D, other: T): { [K in D]: S } | { [K in D]: T }
}

interface ConstAlgebra<T> {
  const(value: number): T
}

// "abstract factory" (trait?)
interface Showable {
  show(): string
}

class ShowableConst implements Showable {
  constructor(private readonly value: number) {}
  public show() {
    return this.value + ""
  }
}

class ShowableConstFactory implements ConstAlgebra<Showable> {
  public const(value: number): ShowableConst {
    return new ShowableConst(value)
  }
}

function makeThree<T>(factory: ConstAlgebra<T>): T {
  return factory.const(3)
}

const showableThree = makeThree(new ShowableConstFactory())

console.log(showableThree.show)

interface ConcattableAlgebra<T> extends ConstAlgebra<T> {
  concat(left: T, right: T): T
}

// #3: concrete factory that implements our abstract factory
class ShowableConcat implements Showable {
  constructor(
    public readonly left: Showable,
    public readonly right: Showable,
  ) {}
  public show() {
    return this.left.show().concat(this.right.show())
  }
}

// #4: class that provides the actual logic which performs the operation on our data type
class ShowableConcatFactory extends ShowableConstFactory implements ConstAlgebra<Showable> {
  public concat(left: Showable, right: Showable): Showable {
    return new ShowableConcat(left, right)
  }
}

function makeThreeFour<T>(factory: ConcattableAlgebra<T>): T {
  const three = makeThree(factory)
  return factory.concat(three, factory.concat(factory.const(4), factory.const(5)))
}

interface Evaluatable {
  evaluate(): number
}

class EvaluatableConst implements Evaluatable {
  constructor(private readonly value: number) {}
  evaluate(): number {
    return this.value
  }
}

class EvaluatableSum implements Evaluatable {
  constructor(
    public readonly left: Evaluatable,
    public readonly right: Evaluatable,
  ) {}
  evaluate(): number {
    return this.left.evaluate() + this.right.evaluate()
  }
}

class EvaluatableSumFactory implements ConstAlgebra<Evaluatable> {
  public const(value: number): Evaluatable {
    return new EvaluatableConst(value)
  }
  public concat(left: Evaluatable, right: Evaluatable): Evaluatable {
    return new EvaluatableSum(left, right)
  }
}

function makeFour<T>(factory: ConcattableAlgebra<T>): T {
  return factory.concat(factory.const(2), factory.const(2))
}

const four = makeFour(new EvaluatableSumFactory())
four.evaluate()

interface Compose<S extends {}, T extends {}> extends newtype<S & T> {}

namespace TS {
  declare namespace Algebra {
    interface Const<F> {
      const(value: number): F
    }
    interface Concat<F> {
      concat(left: F, right: F): F
    }
    interface Show<F> {
      show(left: F, right: F): string
    }
    interface Expr<F> extends Algebra.Const<F>, Algebra.Concat<F>, Algebra.Show<F> {}
    // TODO:
    // namespace Const { interface lambda extends HKT { [-1]: this[0] } }
  }

  interface Dict<T> {
    [x: string]: T
  }

  // function compose<A, B, C>(ab: Dict<(a: A) => B>, bc: Dict<(b: B) => C>): (a: A) => C
  function apply<A, B>(dict: Dict<(a: A) => B>): (a: A) => B {
    return Object.values(dict)[0]
  }

  namespace Algebra {
    // export function compose
    //   <S extends {}, T extends {}>(left: S, right: T): Compose<S, T>
    //   { return globalThis.Object.assign({}, left, right) }

    export const Const: <T>(of: Algebra.Const<T>["const"]) => Algebra.Const<T> = (of) => ({ const: of })

    export const Concat: <T>(concat: Algebra.Concat<T>["concat"]) => Algebra.Concat<T> = (concat) => ({
      concat,
    })

    export const Show: <T>(show: Algebra.Show<T>["show"]) => Algebra.Show<T> = (show) => ({ show })

    export const Expr: <T>(
      of: Algebra.Expr<T>["const"],
      concat: Algebra.Expr<T>["concat"],
      show: Algebra.Expr<T>["show"],
    ) => Algebra.Expr<T> = (of, concat, show) => ({ const: of, concat, show })

    export const NumericConst = Algebra.Const<number>((x) => x)
    export const NumericShow = Algebra.Show<number>((l, r) => l + "" + (r + ""))
    export const NumericConcat = Algebra.Concat<number>((l, r) => l + r)
    export const NumericExpr = Algebra.Expr<number>(
      NumericConst.const,
      NumericConcat.concat,
      NumericShow.show,
    )
  }

  // Evaluation logic

  const evaluateConstant = (value: number) => value
  const evaluateAddition = (left: number, right: number) => left + right

  // Stringification logic

  const stringifyConstant = (value: number) => String(value)
  const stringifyAddition = (left: string, right: string) => `${left} + ${right}`

  const stringifiableExpressionFactory = {
    constant: stringifyConstant,
    addition: stringifyAddition,
  }

  // Usage example

  function makeFour<E>(factory: Algebra.Expr<E>): E {
    return factory.concat(factory.concat(factory.const(1), factory.const(1)), factory.const(2))
  }

  console.log(makeFour(Algebra.NumericExpr)) // prints "4"
}
