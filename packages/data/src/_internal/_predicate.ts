import type { Indexable } from "@traversable/registry"

import type { any } from "./_any.js";
import type { key } from "./_key.js";

const isObject = (u: unknown): u is { [x: string]: unknown } => u !== null && typeof u === "object"
const Object_hasOwn = <K extends key.any>(u: unknown, k: K): u is { [P in K]: unknown } => 
  isObject(u) && globalThis.Object.prototype.hasOwnProperty.call(u, k)

export function has<K extends key.any>(prop: K): (u: unknown) => u is any.indexedBy<K>
export function has<K extends key.any, T>(prop: K, guard: (u: unknown) => u is T): (u: unknown) => u is { [P in K]: T }
export function has<K extends key.any, T> /// impl.
  (prop: K, guard: (u: unknown) => u is T = (() => true) as never) 
  { return (u: unknown): u is never => isObject(u) && Object_hasOwn(u, prop) && guard(u[prop]) }
