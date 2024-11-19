import * as vi from "vitest"

import { core, fc, test, Property } from "@traversable/core"

const stripTargetChars = (component: string) => component.replace(/[~\/01]/g, "")

const unescapedChar = fc.constantFrom("/", "~")
const escapedChar = fc.constantFrom("~1", "~0")
const noEscapableChars = fc.alphanumeric().filter((x) => !x.includes("~") && !x.includes("/"))

const unescapedTokens = fc.tuple(
  fc.array(fc.alphanumeric()).map((xs) => xs.join("/")),
  fc.array(unescapedChar),
).map(([xs, ys]) => {
  let out: string[] = []
  for (let ix = 0, bound = Math.min(xs.length, ys.length); ix < bound; ix++) {
    const x = xs[ix]
    const y = ys[ix]
    const [l, r] = Math.random() > 0.5 ? [x, y] : [y, x]
    out.push(`${l}${r}`)
  }
  return out
})

const escapedTokens = fc.tuple(
  fc.array(noEscapableChars).map((xs) => xs.join("")),
  fc.array(escapedChar)
).map(
  ([xs, ys]) => {
    let out: string[] = []
    for (let ix = 0, bound = Math.min(xs.length, ys.length); ix < bound; ix++) {
      const x = xs[ix]
      const y = ys[ix]
      const [l, r] = Math.random() > 0.5 ? [x, y] : [y, x]
      out.push(`${l}${r}`)
    }
    return out
  }
)

/**
 * Generator for an unescaped JSON pointer token/component.
 * 
 * @example
 * console.log(fc.peek(unescaped)) // => "/abc~def/ghi"
 */
const unescaped = unescapedTokens.map((xs) => "/" + xs.join("/"))

/**
 * Generator for an escaped JSON pointer token/component.
 * 
 * @example
 * console.log(fc.peek(escaped)) // => "~1abc~0def~1ghi"
 */
const escaped = escapedTokens.map((xs) => xs.join(""))

/**
 * Generator for a JSON pointer path (elements of the array have not been escaped)
 * 
 * @example
 * console.log(fc.peek(escaped)) // => ["", "abc/def", "ghi~jkl"]
 */
const path = fc.array(noEscapableChars).map((xs) => ["", ...xs])

/**
 * Generator for a JSON pointer (where slashes indicate path delimiters, and the
 * remaining '~' and '/' chars have been escaped.
 * 
 * @example
 * console.log(fc.peek(pointer)) // => "/abc~1def/ghi~0jkl"
 */
const pointer = fc.array(noEscapableChars).map((xs) => "/" + xs.join("/"))

/** 
 * EXAMPLE-BASED TEST SUITE
 * 
 * These tests have been included for documentation purposes only --
 * while the tests do run, and can be somewhat useful for triaging,
 * the test suite that gives us the most confidence is the one
 * directly below this `describe` block.
 */
vi.describe("@traversable/core/json-pointer [examples]", () => {
  void test("JsonPointer.escape examples", () => {
    vi.assert.equal(core.JsonPointer.escape(""), "")
    vi.assert.equal(core.JsonPointer.escape("foo"), "foo")
    vi.assert.equal(core.JsonPointer.escape("foo~/"), "foo~0~1")
    vi.assert.equal(core.JsonPointer.escape("fo/o"), "fo~1o")
    vi.assert.equal(core.JsonPointer.escape("fo~o"), "fo~0o")
  })
  void test("JsonPointer.unescape examples", () => {
    vi.assert.equal(core.JsonPointer.unescape(""), "")
    vi.assert.equal(core.JsonPointer.unescape("foo"), "foo")
    vi.assert.equal(core.JsonPointer.unescape("foo~0~1"), "foo~/")
    vi.assert.equal(core.JsonPointer.unescape("fo~1o"), "fo/o")
    vi.assert.equal(core.JsonPointer.unescape("fo~0o"), "fo~o")
  })
  void test("JsonPointer.toPath examples", () => {
    vi.assert.deepEqual(core.JsonPointer.toPath(""), [])
    vi.assert.deepEqual(core.JsonPointer.toPath("/"), [""])
    vi.assert.throws(() => core.JsonPointer.toPath("does not start with fwd slash"))
    vi.assert.deepEqual(core.JsonPointer.toPath("/f~0o~1o/bar/1/~1baz~0"), ["", "f~o/o", "bar", "1", "/baz~"])
  })
})

/** 
 * PROPERTY-BASED TEST SUITE
 */
vi.describe("@traversable/core/json-pointer [properties]", () => {
  void test.prop([unescaped])("〖🌿〗:: JsonPointer.escape", (_) => 
    vi.assert.equal(
      stripTargetChars(_),
      stripTargetChars(core.JsonPointer.escape(_))
    )
  )

  void test.prop([escaped])("〖🌿〗:: JsonPointer.unescape", (_) => 
    vi.assert.deepEqual(
      stripTargetChars(core.JsonPointer.unescape(_)),
      stripTargetChars(_),
    )
  )

  void Property.roundtrip({ 
    to: core.JsonPointer.escape, 
    from: core.JsonPointer.unescape,
    arbitrary: unescaped
  }, {
    assert: vi.assert.equal,
    examples: [
      [""],
      ["/"],
      ["~"],
      ["~/~"],
      ["/~/"],
      ["//~"],
      ["~//"],
      ["~~/"],
      ["/~~"],
      ["~~~"],
      ["///"],
    ],
  })()

  void Property.roundtrip({
    to: core.JsonPointer.unescape,
    from: core.JsonPointer.escape,
    arbitrary: escaped,
  }, {
    assert: vi.assert.equal,
    examples: [
      [""],
      ["~1"],
      ["~0"],
      ["~0~1~0"],
      ["~1~0~1"],
      ["~1~1~0"],
      ["~0~1~1"],
      ["~0~0~1"],
      ["~1~0~0"],
      ["~0~0~0"],
      ["~1~1~1"],
    ],
  })();

  void Property.roundtrip({
    to: core.JsonPointer.fromPath,
    from: core.JsonPointer.toPath,
    arbitrary: path,
  }, {
    examples: [
      [[]],
      [[""]],
      [["", "a0"]]
    ],
  })();

  void Property.roundtrip({
    to: core.JsonPointer.toPath,
    from: core.JsonPointer.fromPath,
    arbitrary: pointer,
  })();
})
