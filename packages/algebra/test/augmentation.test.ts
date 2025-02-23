import { Generator } from "@traversable/algebra"
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
    const za = Generator.derive({
      Bro(x, _) { return x.type  },
      Brr(x, _) { return x.type + 1 },
      Bun(x, _) { return x.type },
      allOf(x, _) { return x.type },
      any(x, _) { return x.type },
      anyOf(x, _) { return x.type },
      array(x, _) { return x.type },
      boolean(x, _) { return x.type },
      enum(x, _) { return x.type },
      const(x, _) { return x.type },
      integer(x, _) { return x.type },
      null(x, _) { return x.type },
      number(x, _) { return x.type },
      object(x, _) { return x.type },
      oneOf(x, _) { return x.type },
      record(x, _) { return x.type },
      string(x, _) { return x.type },
      tuple(x, _) { return x.type },
      $ref({ $ref: x }, $) { return typeof $.refs[x] === 'string' ? $.refs[x] : JSON.stringify($.refs[x]) }
    })
  })
})
