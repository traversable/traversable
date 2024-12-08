import { interpret } from "@traversable/interpret"
import * as vi from "vitest"
import pkg from "../package.json"

vi.describe("interpret", () => {
  vi.it("interpret.VERSION", () => {
    const expected = `${pkg.name}@${pkg.version}`
    vi.assert.equal(interpret.VERSION, expected)
  })
})