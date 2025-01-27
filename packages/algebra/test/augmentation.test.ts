import { createTarget } from "@traversable/algebra"
import { Extension, registry } from "@traversable/core"
import * as vi from "vitest"

interface Brr { type: "Brr", brr: number }
interface Bro { type: "Bro", bro: string }
interface Bun { type: "Bun", bun: boolean }

export const myExtensions = Extension.register({
  Brr(u: unknown): u is Brr { return !!u && typeof u === "object" && "type" in u && u.type === "Foo" },
  Bro(u: unknown): u is Bro { return !!u && typeof u === "object" && "type" in u && u.type === "Bar" },
  Bun(u: unknown): u is Bun { return !!u && typeof u === "object" && "type" in u && u.type === "Baz" },
} as const)

declare module "@traversable/core" { interface Extension extends Extension.register<typeof myExtensions> {} }

vi.describe("〖️⛳️〗‹‹‹ ❲@traversable/algebra/augmentation❳", () => {
  vi.it("〖️⛳️〗› ❲algebra/augmentation❳: registering extensions works in userland", async () => {
    Object.keys(myExtensions).forEach((k) => registry.has(k))
    vi.assertType<
      Extension.StructureMap<{}, {
        readonly Brr: Extension.Registered<"Brr", Brr>
        readonly Bro: Extension.Registered<"Bro", Bro>
        readonly Bun: Extension.Registered<"Bun", Bun>
      }
    >>(registry)
  })

  vi.it("〖️⛳️〗› ❲algebra/augmentation❳: matchers are applied during evaluation", async () => {
    const za = createTarget({
      Bro(x, $) { return x.type  },
      Brr(x, $) { return x.type + 1 },
      Bun(x, $) { return x.type },
      allOf(x, $) { return x.type },
      anyOf(x, $) { return x.type },
      array(x, $) { return x.type },
      boolean(x, $) { return x.type },
      enum(x, $) { return x.type },
      const(x, $) { return x.type },
      integer(x, $) { return x.type },
      null(x, $) { return x.type },
      number(x, $) { return x.type },
      object(x, $) { return x.type },
      oneOf(x, $) { return x.type },
      record(x, $) { return x.type },
      string(x, $) { return x.type },
      tuple(x, $) { return x.type },
    })
  })
})
