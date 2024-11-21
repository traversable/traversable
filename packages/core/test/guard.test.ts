import * as vi from "vitest"

import { Property, core, fc, is, test } from "@traversable/core"

/** 
 * =========================
 *    EXAMPLE-BASED TESTS
 * =========================
 * 
 * These tests are included as a form of documentation only.
 * 
 * The actual tests (the ones that give us the most confidence) 
 * are located in the `describe` block directly below this one.
 */
vi.describe("〖🩹〗 @traversable/core/is", () => {
  vi.it("〖🩹〗 is.object.of: validates required fields", () => {
    const ex_01 = is.object.of({
      abc: is.literally("ABC"),
      def: is.array.of(is.literally("DEF")),
      ghi: is.anyOf(is.literally("G"), is.literally("H"), is.literally("I")),
      // jkl: is.integer
    })

    void vi.assert.isTrue(
      ex_01({
        abc: "ABC",
        def: ["DEF"],
        ghi: "I",
      })
    )
  })

  vi.it("〖🩹〗 is.object.of: validates optional fields", () => {
    const ex_02 = is.object.of({
      mno: is.optional(is.string),
      pqr: is.optional(is.boolean),
      stu: is.optional(is.string),
    })
    void vi.assert.isTrue(ex_02({}))
    void vi.assert.isTrue(ex_02({ pqr: true }))
    void vi.assert.isTrue(ex_02({ pqr: false, mno: "true" }))
    void vi.assert.isFalse(ex_02({ mno: true }))
    void vi.assert.isFalse(ex_02({ pqr: "true" }))
    // "stu" field is allowed to be undefined because `exactOptionalPropertyTypes`
    // is `false`
    void vi.assert.isTrue(ex_02({ stu: undefined }))
  })

  vi.it("〖🩹〗 is.object.of: supports exactOptionalPropertyTypes", () => {
    const ex_02 = is.object.of({
      mno: is.optional(is.string),
      pqr: is.optional(is.boolean),
      stu: is.optional(is.string),
    }, { exactOptionalPropertyTypes: true })

    void vi.assert.isTrue(ex_02({}))
    void vi.assert.isTrue(ex_02({ pqr: true }))
    void vi.assert.isTrue(ex_02({ pqr: false, mno: "true" }))
    void vi.assert.isFalse(ex_02({ mno: undefined }))
    void vi.assert.isFalse(ex_02({ pqr: undefined }))
    void vi.assert.isFalse(ex_02({ stu: undefined }))
    void vi.assert.isFalse(ex_02({ mno: undefined, pqr: undefined }))
    void vi.assert.isFalse(ex_02({ mno: undefined, pqr: undefined, stu: undefined }))
    void vi.assert.isFalse(ex_02({ pqr: undefined, stu: undefined }))
    void vi.assert.isFalse(ex_02({ mno: undefined, stu: undefined }))
  })

  vi.it("〖🩹〗 is.object.of: validates mixed fields", () => {
    const ex_03 = is.object.of({
      // stu: is.optional(is.boolean),
      vwx: is.number,
    })
    void vi.assert.isTrue(ex_03({ vwx: 10 }))
    void vi.assert.isTrue(ex_03({ vwx: 100, stu: true }))
    void vi.assert.isFalse(ex_03({}))
    void vi.assert.isFalse(ex_03({ yz: "true" }))
  })
})
