import type * as fc from "fast-check"
export * from "fast-check"

export type Arbitrary<T> = never | fc.Arbitrary<T>

export declare namespace Arbitrary { 
  export { 
    AnyArbitrary as any,
    InferArbitrary as infer,
    MapArbitrary as map,
    ArbitraryShape as shape,
    UnmapArbitrary as unmap,
  }
}
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

  type InferArbitrary<T> = T extends fc.Arbitrary<infer U> ? U : never
  type MapArbitrary<T> = never | { -readonly [K in keyof T]: fc.Arbitrary<T[K]> }
  type ArbitraryShape<T extends { [x: string]: Arbitrary.any } = { [x: string]: Arbitrary.any }> = T
  type UnmapArbitrary<T> = never | { -readonly [K in keyof T]: InferArbitrary<T[K]> }
}
