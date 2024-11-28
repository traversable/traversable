import { fc, test } from "@fast-check/vitest"
import * as vi from "vitest"

import { string } from "@traversable/data"

vi.describe("〖🌍〗‹‹‹ ❲@traversable/data/string❳", () => {
  test.prop(
    [fc.string()], {
      // numRuns: 100_000,
      examples: [ 
        ["\\"], ["\\\\"], ["["], ["["], ["\\"], ["]"], ["{"], ["|"], 
        ["}"], ["("], [")"], ["/"], ["\""], ["-0"], ["-0-0"],
      ],
    }
  )("〖🌍〗‹ ❲string.escape <> string.unescape❳", (text) => 
    vi.assert.equal(
      string.unescape(string.escape(text)), 
      text
    )
  )
})
