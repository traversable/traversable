import type {
  BuiltIns,
  Context,
  ExtensionName,
  ExtensionSet,
  Handlers,
  UserDef,
  UserDefs,
} from "@traversable/core"
import { Extension, Extension_match2 } from "@traversable/core"
import * as vi from "vitest"

interface Brr<T> { tag: "Brr", brr: T, $$$: 1 }
interface Bro<T> { tag: "Bro", bro: T, dude: 2 }
interface Bun<T> { tag: "Bun", bun: T, good?: 3 }

export const myExtensions = Extension.register({
  Brr<T>(u: unknown): u is Brr<T> { return !!u && typeof u === "object" && "tag" in u && u.tag === "Foo" },
  Bro<T>(u: unknown): u is Bro<T> { return !!u && typeof u === "object" && "tag" in u && u.tag === "Bar" },
  Bun<T>(u: unknown): u is Bun<T> { return !!u && typeof u === "object" && "tag" in u && u.tag === "Baz" },
} as const)

declare module "@traversable/core" { interface Extension extends Extension.register<typeof myExtensions> {} }

vi.describe(`〖⛳️〗‹‹‹ ❲@traversable/core/guard❳`, () => {
  vi.it(`〖⛳️〗› ❲guard: t.const❳: primitive values`, () => {
    // const createMatchers = Extension_match2({
    //   "~standard": {
    //     validate: (u: unknown) => { return { value: { abc: 123 }, issues: [] } },
    //     version: 1,
    //     vendor: "inline"
    //   }
    // });
    
    // const match = createMatchers({
    //   Bro: (bro, ix) => [bro.tag, bro.dude] as const satisfies [any, any],
    //   Bun: (bun, ix) => [bun.tag, bun.good] as const satisfies [any, any],
    //   allOf: (allOf, ix) => [allOf.type, allOf.allOf] as const satisfies [any, any],
    // })
    // match(
    //   { abc: 123, }, 
    //   { type: "allOf", allOf: [] }
    // )

    const match2 = Extension.match({
      handlers: {
        allOf: (x) => "ho" as const,
      }
    })


  })
})
