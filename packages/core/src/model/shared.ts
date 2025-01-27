import type { newtype } from "@traversable/registry"

// TODO: consider renaming some of these
export interface Enum<M extends {} = {}> extends newtype<M> { enum: readonly unknown[] }
export interface Const<M extends {} = {}> extends newtype<M> { const: unknown }
export interface Items<T, M extends {} = {}> extends newtype<M> { items: T }
export interface FiniteItems<T, M extends {} = {}> extends newtype<M> { items: readonly T[] }
export interface Props<T, M extends {} = {}> extends newtype<M> { properties: { [x: string]: T }, required?: readonly string[] }
export interface MaybeAdditionalProps<T, M extends {} = {}> extends newtype<M> { additionalProperties?: T }
export interface AdditionalProps<T, M extends {} = {}> extends newtype<M> { additionalProperties: T }
export interface Combinator<T, K extends string> extends newtype<{ [P in K]: readonly T[] }> {}
