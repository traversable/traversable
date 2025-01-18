import * as vi from "vitest"
import { Extension } from "@traversable/core"

interface Brr<T> { tag: "Brr", brr: T }
interface Bro<T> { tag: "Bro", bro: T }
interface Bun<T> { tag: "Bun", bun: T }

export const myExtensions = Extension.register({
  Brr<T>(u: unknown): u is Brr<T> { return !!u && typeof u === "object" && "tag" in u && u.tag === "Foo" },
  Bro<T>(u: unknown): u is Bro<T> { return !!u && typeof u === "object" && "tag" in u && u.tag === "Bar" },
  Bun<T>(u: unknown): u is Bun<T> { return !!u && typeof u === "object" && "tag" in u && u.tag === "Baz" },
} as const)

declare module "@traversable/core" { interface Extension extends Extension.register<typeof myExtensions> {} }

declare const _9: Extension.Handlers<string, {}>


