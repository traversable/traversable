import { http } from "@traversable/http"
import * as vi from "vitest"
import pkg from "../package.json"

vi.describe("http", () => {
  vi.it("http.VERSION", () => {
    const expected = `${pkg.name}@${pkg.version}`
    vi.assert.equal(http.VERSION, expected)
  })
})