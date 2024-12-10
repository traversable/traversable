import { registry } from "@traversable/registry"

import * as vi from "vitest"

const TestURI = "TestURI" as const
const TestSym = Symbol.for(TestURI)
const _registry = { [TestURI]: TestSym } as const

const Registry = registry.create(_registry)
declare module "@traversable/registry" { 
  interface SymbolRegistry extends registry.Register<typeof _registry> {} 
}

vi.describe(`〖⛳️〗‹‹‹ ❲@traverable/registry❳`, () => {
  vi.it(`〖⛳️〗› ❲registry.create❳`, () => {
    vi.assert.equal((Registry.get("TestURI") ?? "").toString(), `Symbol(${TestURI})`)
  })
})
