import { fc, test } from "@fast-check/vitest"
import * as vi from "vitest"

import { Option, fn, map, object } from "@traversable/data"

const Object_keys = globalThis.Object.keys

const some = fc.anything().filter((x) => x != null).map(Option.some)
const none = fc.constant(Option.none())
const option: fc.Arbitrary<Option<unknown>> = fc.oneof(some, none)
const options = fc.dictionary(fc.string(), option)
const optionals = fc.dictionary(fc.string(), fc.anything())

vi.describe("〖️⛳️〗‹‹‹ ❲@traversable/data/Option❳", () => {
  // test.prop([options], { 
  //   examples: [
  //     [{"":{"_tag":"@traversable/registry/URI::Option.None"}}]
  //   ] 
  // })(
  //   "〖️⛳️〗› ❲Option.toPartial❳", (opts) => {
  //     const partial = Option.toPartial(opts)
  //     for (const k in opts) {
  //       const ov = opts[k]
  //       const pv = partial[k]
  //       if (pv == null) 
  //         vi.assert.isTrue(Option.isSome(ov) || Option.isNone(ov))
  //       else (
  //         vi.assert.isFalse(Option.isSome(pv)),
  //         vi.assert.isFalse(Option.isNone(pv))
  //       )
  //     }
  //   }
  // )

  const cointoss = () => Math.random() > 0.5


  // const subset
    // : <const T extends {}>(x: T) => Partial<T>
    // = (x: { [ix: number]: unknown }) => fn.pipe(map(x, (_, k) => k), object.filter.defer(cointoss))// object.filter.defer(cointoss))

  

  test.prop([options], { 
    examples: [
      [{},]
    ] 
  })(
    "〖️⛳️〗› ❲Option.fromPartial❳", 
    (opts) => {


      const isString = (u: unknown) => typeof u === "string"
      fn.pipe(
        opts, 
        map((_, k) => k), 
        object.filter.defer(cointoss),
      )
    }
  )
})

      // const shape = {
      //   a(u: unknown): u is string { return isString(u) },
      //   b(u: unknown): u is string[] { return Array.isArray(u) && u.every(isString) },
      // } as const
      // const subset = Object_keys
      // const partial = Option.fromPartial(shape)({ a: "hey", c: "ho", d: undefined })
      // const subset = fn.pipe(
      //   Object.keys(opts),
      //   (ks) => map()

      // ) map(, () => Math.random() > 0.5)

      // for (const k in opts) {
      //   const ov = opts[k]
      //   const pv = partial[k]

      //   vi.assert.isTrue(pv)
      //   // if (pv == null) 
        // else (
        //   vi.assert.isFalse(Option.isSome(pv)),
        //   vi.assert.isFalse(Option.isNone(pv))
        // )

