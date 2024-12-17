import { fc, test } from "@fast-check/vitest"
import * as vi from "vitest"

import { key } from "@traversable/data"

const preventsPoisoning = test.prop(
  [fc.oneof(fc.string(), fc.integer(), fc.float())], 
  { 
    examples: [ 
      [-0],
      ["__proto__"],
      ["toString"],
    ],
  }
)

vi.describe("〖️⛳️〗‹‹‹ ❲@traversable/data/key❳", () => {
  preventsPoisoning("〖️⛳️〗› ❲key.as❳", (k) => {
    const propertyName = key.as(k)
    const object: { [x: string]: number } = globalThis.Object.defineProperty(
      globalThis.Object.create(null),
      propertyName,
      { value: 123 }
    )
    vi.assert.equal(object[propertyName], 123)
  })
})
