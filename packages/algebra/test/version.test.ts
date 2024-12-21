import { algebra } from "@traversable/algebra"
import * as vi from "vitest"
import pkg from "../package.json"

vi.describe("〖️⛳️〗‹‹‹ ❲@traversable/algebra❳", () => {
  vi.it("〖️⛳️〗› ❲algebra.VERSION❳", () => {
    const expected = `${pkg.name}@${pkg.version}`
    vi.assert.equal(algebra.VERSION, expected)
  })
})
