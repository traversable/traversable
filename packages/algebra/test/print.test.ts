import * as vi from "vitest"

import { Print } from "@traversable/algebra"

vi.describe("〖️⛳️〗‹‹‹ ❲@traversable/algebra/Print❳", () => {
  vi.it("〖️⛳️〗› ❲Print.array❳", async () => {
    vi.expect(Print.array({ indent: 0 })("", ...[], "")).toMatchInlineSnapshot(`
      "
      "
    `)
  })
})
