import * as vi from "vitest"
import { test, fc } from "@fast-check/vitest"

import { show } from "@traversable/core"

vi.describe(` 〖⛳️️〗‹‹‹ ❲@traversable/data/show❳`, () => {
  vi.test(`〖️⛳️️〗 ›  ❲show.serialize❳`, () => {
    const ex_01 = show.serialize(
      { "a-": { b: { c: { d: 1, e: false, f: null, }, g: [null], h: [ { i: "hey", j: "whaaaat" }, {}, ], k: 9 }, } },
      { newline: "", tab: "" },
    )

    vi.assert.equal( 
      ex_01, `{"a-":{"b":{"c":{"d":1,"e":false,"f":null},"g":[null],"h":[{"i":"hey","j":"whaaaat"},{}],"k":9}}}`
    )
  })

  vi.it(`〖️⛳️️〗 ›  ❲show.serialize❳: supports custom newline, tab chars`, () => {
    vi.assert.equal(
      show.serialize({
        "a-": { 
          b: [1, 2, 3], 
          c: { d: 1, e: false, f: null }, 
          g: [null], 
          h: [ { i: "hey", j: "whaaaat" }, {} ], 
        }, 
      }, "readable"),
      [
        "{",
        `  "a-": {`,
        "    b: [", "      1,", "      2,", "      3", "    ],",
        "    c: {", "      d: 1,", "      e: false,", "      f: null", "    },",
        "    g: [", "      null", "    ],",
        "    h: [", "      {", "        i: \"hey\",", "        j: \"whaaaat\"", "      },", "      {}", "    ]",
        "  }",
        "}",
      ].join("\n")
    )
  })

  vi.it(
    `〖️⛳️️〗 ›  ❲show.serialize❳: handles circular references`,
    () => {
      const ex_01 = {
        A: {
          B: { C: void 0 as any as {}, D: void 0 as any as {} },
          E: { F: { G: "A.B.C.D.E.F.G" } },
          H: { I: void 0 as any as {} },
        },
      }

      void (ex_01.A.B.C = ex_01.A.E.F)
      void (ex_01.A.H.I = ex_01.A.B)
      void (ex_01.A.B.D = ex_01.A.E)

      const serialized = show.serialize(ex_01, "readable")
      vi.assert.deepEqual(
        serialized, 
        [
          `{`,
          `  A: {`,
          `    <ref #/A/H/I>B: {`,
          `      <ref #/A/B/D/F>C: {`,
          `        G: "A.B.C.D.E.F.G"`,
          `      },`,
          `      <ref #/A/E>D: {`,
          `        F: [Circular #/A/B/C]`,
          `      }`,
          `    },`,
          `    E: [Circular #/A/B/D],`,
          `    H: {`,
          `      I: [Circular #/A/B]`,
          `    }`,
          `  }`,
          `}`,
        ].join("\n")
      )
  })

  test.prop([fc.jsonValue()], {
    // numRuns: 10_000,
  })(
  `〖️⛳️️〗 ›  ❲show.serialize❳: roundtrip`, (json) => {
      const stringified = globalThis.JSON.stringify(json)
      const serialized = show.serialize(json)
      vi.assert.equal(serialized, stringified)
    }
  )
})
