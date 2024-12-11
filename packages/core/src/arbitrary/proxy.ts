import type * as fc from "fast-check"
export * from "fast-check"

export type Arbitrary<T> = never | fc.Arbitrary<T>

export declare namespace Arbitrary { export { AnyArbitrary as any } }
export declare namespace Arbitrary {
  /** 
   * ## {@link AnyArbitrary `fc.Arbitrary.any`}
   * 
   * Least upper bound of {@link fc.Arbitrary `fc.Arbitrary`}.
   */
  type AnyArbitrary<
    T extends 
    | fc.Arbitrary<unknown> 
    = fc.Arbitrary<unknown>
  > = T
}
