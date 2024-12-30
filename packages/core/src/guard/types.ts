import type { keys } from "@traversable/data"

export interface Leaf { leaf: unknown }
export interface Path extends keys.any {}
export type Pathspec = readonly [...path: Path, leaf: Leaf]
