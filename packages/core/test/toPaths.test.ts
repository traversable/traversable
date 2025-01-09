import * as vi from "vitest"

import { path } from "@traversable/core"
import { symbol } from "@traversable/registry"

vi.describe("〖️⛳️〗‹‹‹ ❲@traversable/core/path❳", () => {
  vi.it("〖️⛳️〗› ❲path.interpreter❳: interprets optional properties", () => {
    vi.assert.deepEqual(
      path.interpreter(path.docs, ["abc", symbol.optional, { leaf: {} } ] ),
      [ 'abc', '?' ]
    )
  })
})

