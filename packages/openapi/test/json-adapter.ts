import { fc, test } from "@traversable/core"
import { fn } from "@traversable/data"
import { openapi } from "@traversable/openapi"
import * as vi from "vitest"

/** 
 * //////////////////////////////////////
 * ///   A 5-minute introduction to   ///
 * ///       PROPERTY TESTING         ///
 * //////////////////////////////////////
 * 
 * //////////////////////////////////////
 * ///
 * ///     featuring ...
 * ///
 * ///        darling of the indie OSS world ...
 * ///
 * ///
 * ///              my personal dark horse pick...
 * ///
 * ///              your new ace in the hole...
 * ///
 * ///              give it up for
 * ///
 * ///              the _powerful_       ... 🙀 🙀 🙀 ...
 * ///              the _poorly named_   ... 🙀 🙀 🙀 ...
 * ///             
 * ///
 * ///     the one and only: **FAST-CHECK**  
 * /// 
 * ///   😱 😱 😱 😱 😱 😱 😱 😱 😱 😱 😱 😱 😱 😱 😱 😱 😱
 * ///    😱 😱 😱 😱 😱 😱 😱 😱 😱 😱 😱 😱 😱 😱 😱 😱
 * ///     😱 😱 😱 😱 😱 😱 😱 😱 😱 😱 😱 😱 😱 😱 😱
 * ///
 * ///        you 🏆 beautiful unicorn that uses fast-check 
 * ///         🡳
 * ///         🡳  (winning)     previous you ... etc.
 * ///         🡳                  your enemies ... etc.
 * ///         🡳                    tech twitter ... etc.
 * ///         🡳                   🡳 🡳 🡳 🡳 🡳 🡳 🡳   (crying)
 * ///    🏁...🦄...................🏎️️💨......🐎.🏎️💨..🎢..🤕...
 * ///╭╥╥╥╥╥╥╥╥╥╥╥╥╥╥╥╥╥╥╥╥╥╥╥╥╥╥╥╥╥╥╥╥╥╥╥╥╥╥╥╥╥╥╥╥╥
 * /////////////////////////////////////////////////////
 * 
 * I'm on the clock; let's get started ⏳  
 * 
 * "Property testing" is a testing pattern for lazy developers.
 * 
 * It comes from the world of Haskell -- but you don't have to
 * know anything about Haskell to use it.
 * 
 * It has been ported to TypeScript by a library called 
 * [`fast-check`](https://github.com/dubzzz/fast-check) ✨✨,
 * which is what we'll be talking about today.
 * 
 * ## What's the big idea?
 * 
 * The main idea is simple:
 * 
 * - Humans are bad at writing tests.
 * - Humans are bad at thinking of edge cases. 
 * - Humans are lazy
 * 
 * Unless you just 🖤 luv writing unit tests 
 * (and if that's you, good for you! 😒 full disclosure, 
 * you probably won't like `fast-check`), you probably
 * find testing tedious, at best.
 * 
 * Libraries like `fast-check` are slowly becoming more popular,
 * but unfortunately, haven't _quite_ hit the mainstream yet.
 * 
 * Give it a couple years, and I suspect that will change.
 * 
 * You've probably used it before, indirectly.
 * 
 * without knowing it. If you've ever
 * used Jest (the testing framework) before, 
 * [they use it internally](https://github.com/jestjs/jest/blob/22029ba06b69716699254bb9397f2b3bc7b3cf3b/packages/expect/src/__tests__/matchers-toEqual.property.test.ts#L9)
 * to test their own assertions.
 * 
 * Spotify, for example, has been using property testing
 * [for years](https://engineering.atspotify.com/2015/06/rapid-check/).
 * 
 * But you don't have to be writing a library used by millions, like Jest,
 * or at a company with thousands of developers, like Spotify, to use it.
 * 
 * Let's give it a whirl.
 */

/** 
 * Here we access the `prop` method to define an invariant for the system
 * under test.
 */
// test.prop(
//   //////////////
//   /// ARRANGE
//   /** 
//    * This is our "model".
//    * 
//    * A model is just a fancy way to say "code generator".
//    * 
//    * It looks really similar to zod, if you've used that library before 
//    * (in fact, zod was inspired by a library called `io-ts`, which comes from
//    * the same ecosystem as `fast-check`, so the similarity is not surprising).
//    * 
//    * Imagine if zod had a schema `z.json` that checked that its input was
//    * valid JSON (and not, for example, a function):
//    * 
//    * ```typescript
//    * const schema = z.json()
//    * schema.parse({ a: 1 })      // ✅
//    * schema.parse(null)          // ✅
//    * schema.parse(undefined)     // 🚫
//    * schema.parse(function() {}) // 🚫
//    * ```
//    * 
//    * Same thing: rather than a validator, we're defining a 
//    * code generator: 
//    * 
//    * @example
//    *  const generator = fc.json()
//    * 
//    *  // Here, we tell `fast-check` to generate 4 json values:
//    *  console.log(fc.sample(generator, 4))
//    *  // => { "a": 1 }
//    *  // => null
//    *  // => [0x77, -1e+29, { "": "" }]
//    *  // => -0
//    */
//   [fc.json()], 
//   { 
//     examples: [
//       /** 
//        * Here, we include the 2 tests at the bottom of this file.
//        * 
//        * Adding them here is a good signal to the reader as to what kind
//        * of corner cases that are possible, and also makes sure that our
//        * coverage for these cases doesn't lapse.
//        * 
//        * This is a great way to add confidence. Over time, as we fix bugs
//        * that fast-check finds, a best practice is to add them to the 
//        * `examples` object, that way we make sure we never have to deal
//        * with that bug again.
//        * 
//        */
//       [{ ["toString"]: "" }],
//       [{ ["__proto__"]: "" }],
//     ],
//     /** 
//      * If we ever get a failure and we want to play back the set of inputs 
//      * that caused it, get the seed from stdout:
//      * 
//      *                                                  🡻🡻 here
//      *  > Test run ...yada yada, etc., etc.... (with seed=-24913119)
//      * 
//      * and put it in the config object here:
//      */
//     // seed: -24913119,
//     /** 
//      * Tell fast check how many inputs to generate. You can configure this globally,
//      * or override it on a test-by-test basis:
//      */
//     // numRuns: 10_000,
//   }
// )(
// vi.describe("〖⛳️〗‹‹‹ ❲@traversable/core/tree❳", () => {
//   test.prop([fc.needleInAHaystack()])(
//     "〖⛳️〗‹‹‹ ❲@traversable/openapi❳: roundtrip",
//   
//     (input: fc.JsonValue) => {
//       /////////////
//       /// ACT
//       const output = fn.flow(oas.fromJSON, oas.toJSON)(input)
//       /////////////
//       /// ASSERT
//       void vi.assert.deepEqual(output, input)
//     }
//  )

vi.describe("〖⛳️〗‹‹‹ ❲@traversable/openapi/json-adapter❳", () => {
  vi.test("〖⛳️〗‹ ❲openapi.toJSON❳", () => {
    vi.assert.deepEqual(
      openapi.toJSON(
      {
        type: "object",
        required: ["a", "b"],
        properties: {
          a: { type: "boolean", const: true }, 
          b: { 
            type: "array", 
            minItems: 3,
            maxItems: 3,
            items: [
              { type: "number", const: 1 },
              { type: "null", nullable: true, enum: [null] },
              { 
                type: "object", 
                required: ["c"], 
                properties: { c: { type: "string", const: "" } },
              },
            ],
          },
        },
      } as const),
      { a: true, b: [1, null, { c: "" }] }
    )
  })

  vi.test("〖⛳️〗‹ ❲openapi.fromJSON❳", () => {
    vi.assert.deepEqual(
      openapi.fromJSON({ a: true, b: [1, null, { c: "" }]}),
      {
        type: "object",
        required: ["a", "b"],
        properties: {
          a: { type: "boolean", const: true }, 
          b: { 
            type: "array", 
            minItems: 3,
            maxItems: 3,
            items: [
              { type: "number", const: 1 },
              { type: "null", nullable: true, enum: [null] },
              { 
                type: "object", 
                required: ["c"], 
                properties: { c: { type: "string", const: "" } },
              },
            ],
          },
        },
      } as const,
    )
  })

  /** 
   * Hardcoded examples to make sure we're always protected against prototype poisoning
   * 
   * For more info see:
   * - [this blogpost](https://fast-check.dev/blog/2023/09/21/detect-prototype-pollution-automatically/)
   */
  vi.test("〖⛳️〗‹ ❲openapi.fromJSON❳: no prototype poisoning", () => {
    () => {
      vi.assert.deepEqual(
        openapi.fromJSON({ ["__proto__"]: "" }), 
        { 
          type: "object", 
          required: ["__proto__"], 
          properties: { 
            ["__proto__"]: { 
              type: "string", 
              const: "" 
            } 
          } 
        },
      )
      vi.assert.deepEqual(
        openapi.fromJSON({ ["toString"]: "" }), 
        { 
          type: "object", 
          required: ["toString"], 
          properties: { 
            ["toString"]: { 
              type: "string", 
              const: "" 
            } 
          }, 
        },
      )
    }
  })
})
