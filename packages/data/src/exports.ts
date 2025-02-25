export type { nonempty } from "./nonempty.js"
export type { any } from "./any.js"
export { type Ansi, ANSI } from "./ansi.js"

export type Compare<T> = import("@traversable/registry").Compare<T>
export type Equal<T = any> = import("@traversable/registry").Eq<T>
export type Err<T> = import("@traversable/registry").Err<T>
export type Monoid<T> = import("@traversable/registry").Monoid<T>
export type None = import("@traversable/registry").None
export type Ok<T> = import("@traversable/registry").Ok<T>
export type Predicate<T = any> = import("@traversable/registry").Predicate<T>
export type Semigroup<T> = import("@traversable/registry").Semigroup<T>
export type Some<T> = import("@traversable/registry").Some<T>

export type Either<L, R> = import("@traversable/registry").Either<L, R>
export type integer<_ = number> = import("@traversable/registry").integer<_>
export type Option<T = unknown> = import("@traversable/registry").Option<T>
export type Result<T = unknown, E = never> = import("@traversable/registry").Result<T, E>
export * as Either from "./either.js"
export { integer } from "./integer.js"
export * as Option from "./option.js"
export * as Result from "./result.js"

export { boolean } from "./boolean.js"
export { entry, entries } from "./entry.js"
export { key, keys } from "./key.js"
export { forEach, map } from "./map.js"
export { object } from "./object.js"
export { prop, props } from "./prop.js"
export { record } from "./record.js"
export { jsdoc, unicode } from "./unicode.js"

export * from "./version.js"
export * as Equal from "./equal.js"
export * as Graph from "./graph.js"
export * as array from "./array.js"
export * as char from "./char.js"
export * as fn from "./function.js"
export * as number from "./number.js"
export * as string from "./string.js"
export * as order from "./order.js"
export * as pair from "./pair.js"

export declare namespace Compare {
  export { Compare_any as any, Compare_object as object, Compare_infer as infer }
}
export declare namespace Compare {
  type Compare_any = Compare<any>
  type Compare_object<T> = never | Compare<{ -readonly [K in keyof T]: Compare.infer<T[K]> }>
  type Compare_infer<T> = [T] extends [Compare<infer U>] ? U : never
}
