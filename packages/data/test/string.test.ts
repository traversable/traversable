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
  )("〖🌍〗› ❲string.escape <> string.unescape❳", (text) => 
    vi.assert.equal(
      string.unescape(string.escape(text)), 
      text
    )
  )
})

vi.describe("〖️⛳️️〗‹‹‹ ❲@traversable/data/string❳", () => {
  vi.test(
    `〖️⛳️〗› ❲string.slurpWhile❳ (with examples)`, 
    () => {
      vi.assert.deepEqual(string.slurpWhile((c, _seen) => c === "" )(""), { slurped: "", unslurped: "" })
      vi.assert.deepEqual(string.slurpWhile((c, _seen) => c === "#" )(""), { slurped: "", unslurped: "" })
      vi.assert.deepEqual(string.slurpWhile((c, _seen) => c === "" )("a"), { slurped: "", unslurped: "a" })
      vi.assert.deepEqual(string.slurpWhile((c, _seen) => c === "a" )(""), { slurped: "", unslurped: "" })
      vi.assert.deepEqual(string.slurpWhile((c, _seen) => c === "#" )("abc"), { slurped: "", unslurped: "abc" })
      vi.assert.deepEqual(string.slurpWhile((c, _seen) => c === "#" )("abc#def"), { slurped: "", unslurped: "abc#def" })
      vi.assert.deepEqual(string.slurpWhile((c, _seen) => ["a", "b", "c"].includes(c) )("abc#"), { slurped: "abc", unslurped: "#" })
    }
  )

  vi.test(
    `〖️⛳️〗› ❲string.slurpUntil❳ (with examples)`, 
    () => {

      vi.assert.deepEqual(string.slurpUntil((c, _seen) => c === "!" )("!"), { slurped: "", unslurped: "!" })
      vi.assert.deepEqual(string.slurpUntil((c, _seen) => c === "#" )(""), { slurped: "", unslurped: "" })
      vi.assert.deepEqual(string.slurpUntil((c, _seen) => c === "" )(""), { slurped: "", unslurped: "" })
      vi.assert.deepEqual(string.slurpUntil((c, _seen) => c === "#" )(""), { slurped: "", unslurped: "" })
      vi.assert.deepEqual(string.slurpUntil((c, _seen) => c === "" )("a"), { slurped: "a", unslurped: "" })
      vi.assert.deepEqual(string.slurpUntil((c, _seen) => c === "a" )(""), { slurped: "", unslurped: "" })
      vi.assert.deepEqual(string.slurpUntil((c, _seen) => c === "#" )("abc"), { slurped: "abc", unslurped: "" })
      vi.assert.deepEqual(string.slurpUntil((c, _seen) => c === "#" )("abc#def"), { slurped: "abc", unslurped: "#def" })
      vi.assert.deepEqual(string.slurpUntil((c, _seen) => c === "#" )("abc#"), { slurped: "abc", unslurped: "#" })
    }
  )
  
  const arbitrary = fc.tuple(
    fc.string({ minLength: 1, maxLength: 1 }), 
    fc.integer({ min: 1, max: 20 }), 
    fc.string()
  )
  // Here, we filter out inputs where the body starts with the char
  // we're testing for in the predicate, not because `slurpUntil`
  // isn't able to handle cases like these, but because it makes
  // the semantics of our predicate non-deterministic (we can no
  // longer conclusively assert that `slurpUntil` stops at the index
  // we provided)
  .filter(([char, , body]) => !body.startsWith(char))
  
  test.prop(
    [arbitrary], {
      // numRuns: 100_000,
    }
  )(`〖️⛳️〗› ❲string.slurpUntil❳`, ([char, count, body]) => {
    const head = char.repeat(count)
    const text = head.concat(body)
    const result = string.slurpUntil((_) => _ !== char)(text)

    vi.assert.deepEqual(result, { slurped: char.repeat(count), unslurped: body })
  })

  test.prop(
    [arbitrary], {
      // numRuns: 100_000,
    }
  )(`〖️⛳️〗› ❲string.slurpWhile❳`, ([char, count, body]) => {
    const head = char.repeat(count)
    const text = head.concat(body)
    const result = string.slurpWhile((_) => _ === char)(text)

    vi.assert.deepEqual(result, { slurped: char.repeat(count), unslurped: body })
  })
})
