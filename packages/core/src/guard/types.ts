import type { keys } from "@traversable/data"

export interface Leaf { leaf: unknown }
export interface Path extends keys.any {}
export type Pathspec = readonly [...path: Path, leaf: Leaf]
export type Widen<S> = S extends { valueOf(): infer T } ? T : S

export const _phantom
  : { <T>(): T; <T>(_: T): Widen<T> } 
  = () => void 0 as never
