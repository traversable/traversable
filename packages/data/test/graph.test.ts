import { Graph } from "@traversable/data"
import * as vi from "vitest"

vi.describe("〖️⛳️〗‹‹‹ ❲@traversable/data/Graph❳", () => {
  vi.test("〖️⛳️〗› ❲Graph.sequence❳: it handles an empty graph", () => {
    vi.assert.deepEqual(
      Graph.sequence(new globalThis.Map()), 
      {
        safe: true,
        chunks: [],
        cycles: [],
      }
    )
  })

  vi.test("〖️⛳️〗› ❲Graph.sequence❳: it detects cycles", () => {
    vi.assert.deepEqual(
      Graph.sequence(
        new globalThis.Map([
          [ 'registry', ['http'] ],
          [ 'http', ['openapi' ] ],
          [ 'openapi', [ 'registry' ] ],
        ])
      ), 
      {
      safe: false,
      chunks: [[ 'registry', 'http', 'openapi']],
      cycles: [[ 'registry', 'http', 'openapi']],
    })
  })

  vi.test("〖️⛳️〗› ❲Graph.sequence❳: happy path", () => {
    vi.assert.deepEqual(
      Graph.sequence(
        new globalThis.Map([
          ['registry', []],
          ['openapi', [ 'bench' ]],
          ['http', [ 'core', 'data' ]],
          ['data', [ 'bench' ]],
          ['core', [ 'bench', 'data' ]],
          ['bench', [] ],
          ['algebra', [ 'bench', 'core', 'data', 'http', 'openapi', 'registry' ] ],
        ]),
      ),
      {
        safe: true,
        chunks: [
          [ 'registry', 'bench' ],
          [ 'openapi', 'data' ],
          [ 'core' ],
          [ 'http' ],
          [ 'algebra' ]
        ],
        cycles: []
      }
    )
  })
})
