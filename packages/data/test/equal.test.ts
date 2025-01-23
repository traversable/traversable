import * as vi from "vitest"
import { fc, test } from "@fast-check/vitest"
import oracle from "lodash.isequal"

import { Equal } from "@traversable/data"

type Scalar = 
  | null 
  | undefined 
  | boolean 
  | bigint 
  | number 
  | string

const nullable = fc.constantFrom(null, undefined)
const boolean = fc.boolean()
const number = fc.oneof(fc.integer(), fc.float())
const bigint = fc.bigInt()
const string = fc.string()
const scalar 
  : fc.Arbitrary<Scalar>
  = fc.oneof(
    nullable, 
    boolean, 
    number, 
    bigint, 
    string
  )

type Tree =
  | Scalar
  | Tree[]
  | { [x: string]: Tree }

interface Arbitrary {
  scalar: Scalar
  array: Tree[]
  object: Record<string, Tree>
  any: Tree
}

const arbitrary: fc.LetrecValue<Arbitrary> = fc.letrec(
  (LOOP: fc.LetrecTypedTie<Arbitrary>) => ({
    scalar,
    array: fc.array(LOOP("any")),
    object: fc.dictionary(fc.string(), LOOP("any")),
    any: fc.oneof(
      LOOP("scalar"),
      LOOP("array"),
      LOOP("object"),
    ),
  })
)

vi.describe("〖️⛳️〗‹‹‹ ❲@traversable/data/Equal❳", () => {
  test.prop([arbitrary.any, arbitrary.any], {
    // numRuns: 100_000,
    examples: [
      [{ "": [] }, { "x": undefined }],
      [{ "x": undefined }, { "": [] }],
      [{ "": [] }, { " ": undefined }],
      [{ " ": undefined }, { "": [] }],
    ]
  })(
    "〖️⛳️〗› ❲Equal.deep❳: parity with oracle",
    (x, y) => {
      vi.assert.isTrue(Equal.deep(x, x))
      vi.assert.isTrue(Equal.deep(x, structuredClone(x)))
      vi.assert.isTrue(Equal.deep(structuredClone(x), x))
      vi.assert.isTrue(Equal.deep(y, y))
      vi.assert.isTrue(Equal.deep(y, structuredClone(y)))
      vi.assert.isTrue(Equal.deep(structuredClone(y), y))
      vi.assert.equal(
        oracle(x, y),
        Equal.deep(x, y),
      )
      vi.assert.equal(
        oracle(x, y),
        Equal.deep(y, x),
      )
      vi.assert.equal(
        oracle(y, x),
        Equal.deep(y, x),
      )
      vi.assert.equal(
        oracle(y, x),
        Equal.deep(x, y),
      )
    }
  )
})
