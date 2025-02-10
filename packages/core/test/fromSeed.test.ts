import * as vi from "vitest"
import { Arbitrary, schema, t } from "@traversable/core"
import { test, fc } from "@fast-check/vitest"

// fc.constant(schema.fromSeed(fc.sample(Arbitrary.TagTree.tree, 0)[0]))


const arb = Arbitrary.TagTree.tree.map((tag) => [tag, schema.fromSeed(tag)] satisfies [any, any])

test.skip.prop([arb], { verbose: 0 })(
  '',
  ([tag, ast]) => {
    // console.log('arbitrary schema', schemaotoString(s))


    try {
      console.log("TAG:", JSON.stringify(tag, (k, v) => typeof v === 'symbol' ? v.description : v, 2))
      console.log("AST:", ast)
      console.log("STR:", schema.toString(ast))
    } catch (e) {
      console.error("TAG:", tag)
      console.error("AST:", ast)

      throw e
    }

    vi.assert.equal(1, 1)
  }
)

vi.describe("〖️⛳️〗‹‹‹ ❲@traversable/core/schema❳", () => {
  vi.it.skip("〖️⛳️〗› ❲schema.fromSeed❳", () => {
    // const seeds =  fc.sample(schema.arbitrary, 1)
    // console.log(seeds)
    // console.log('arbitrary schema', schema.fromSeed(seed))
    vi.assert.equal(2, 2)

    // TagTree.fold(TagTree.make)
    // schema.fromSeed()
    // vi.assert.isTrue(false)

  })
})

