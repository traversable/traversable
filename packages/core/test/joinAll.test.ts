import { Format, Json, show } from "@traversable/core"
import { object } from "@traversable/data"
import * as vi from "vitest"

vi.describe("〖️⛳️〗‹‹‹ ❲@traversable/algebra/Format❳", () => {
  vi.it("〖️⛳️〗› ❲Format.joinAll❳", () => {
    Format.joinAll({ 
      // beforeEach: '  ', 
      // afterEach: '  ', 
      // joiner: (xs, d) => `\n${' '.repeat(2 * d)}`
    })(['1', ['2', { a: '3' }]])

    vi.expect(Format.joinAll({ 
      // beforeEach: '  ', 
      // afterEach: '  ', 
      joiner: (xs, d) => `\n${' '.repeat(2 * d)}`
    })(['t.object(', {a: 't.string()', b: ['t.object(', { c: 't.boolean()' }, ')'] }, ')'])).toMatchInlineSnapshot(`
      "t.object(
      {a: t.string() 
        b: t.object(
          {c: t.boolean() }
          ) }
      )"
    `)
  })
})
