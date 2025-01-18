import { fc, test } from "@fast-check/vitest"
import * as vi from "vitest"

import { array } from "@traversable/data"
import { symbol } from "@traversable/registry"

vi.describe(`〖️⛳️〗‹‹‹ ❲@traversable/data/array❳ is red on yellow`, () => {
  const isString = (u: any): u is string => typeof u === "string"

  vi.test.each([
    [[], -1],
    [[1], -1],
    [[1, 2], -1],
    [["a"], 0],
    [["a", "b"], 1],
    [[1, 2, "a"], 2],
    [[1, 2, "a", 3], 2],
    [["a", 3, 4], 0],
    [["a", "b", "c", 3], 2],
    [[symbol.object, 123, symbol.optional, symbol.anyOf, "hey"], 4],
  ])(`〖️⛳️〗› ❲array.lastIndexOf❳: array.lastIndexOf(%j) === %i`, 
    (xs, exp) => vi.assert.equal(array.lastIndexOf(isString)(xs), exp))
})
