import { execSync as $ } from "node:child_process"
import * as fs from "node:fs"
import * as path from "node:path"
import { WeightMap, registry } from "@traversable/registry"

import * as vi from "vitest"

const TestURI = "TestURI" as const
const TestSym = Symbol.for(TestURI)
const SymbolRegistry = { [TestURI]: TestSym } as const
const WeightRegistry = WeightMap

const PATH = {
  Weight: path.join(path.resolve(), "packages", "registry", "src", "tmp", "node-weight-by-type.json.js"),
} as const

const Registry = {
  symbol: registry.createSymbolRegistry(SymbolRegistry),
  // weight: registry.createWeightRegistry(WeightRegistry),
}
declare module "@traversable/registry" { 
  interface SymbolRegistry extends registry.RegisterSymbol<typeof SymbolRegistry> {} 
  interface WeightRegistry extends registry.RegisterWeight<typeof WeightRegistry> {}
}

let cache: number
// vi.beforeAll(() => {
  // $("./bin/pre-test.ts")
  // import(PATH.Weight).then((_) => (cache = _.WeightByType.allOf))
// })

vi.afterAll(() => {
})

vi.describe(`〖⛳️〗‹‹‹ ❲@traverable/registry❳`, () => {
  vi.it(`〖⛳️〗› ❲registry.createSymbolRegistry❳`, () => {
    vi.assert.equal((Registry.symbol.get("TestURI") ?? "").toString(), `Symbol(${TestURI})`)
  })
})


vi.describe(`〖⛳️〗‹‹‹ ❲@traverable/registry❳`, () => {
  vi.it(`〖⛳️〗› ❲registry.createWeightRegistry❳`, ({ skip }) => {
    // const prev = Registry.weight.get("allOf").weight

    // console.log("prev", prev)
    // vi.assert.isTrue(false)

    // TODO: re-implement this test
    vi.assert.isTrue(true)
    // vi.assert.equal(prev, prev)
    // vi.assert.equal(Registry.weight.write("allOf", prev + 1),  { prev, next: prev })
    // vi.assert.equal(Registry.weight.get("allOf").weight, prev + 1)
    // vi.assert.notEqual(cache, prev)
    // vi.assert.isTrue(Registry.weight.write("allOf", cache))
    // vi.assert.equal(cache, prev)

    // const next = Registry.weight.get("allOf").weight
    // skip()
    // vi.assert.equal(inc, next)
    // const next = Registry.weight.get("allOf").weight
    // vi.assert.equal(Registry.weight.get("allOf").weight, 3000)
  })
})

