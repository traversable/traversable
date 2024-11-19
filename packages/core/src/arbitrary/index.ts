export * as fc from "./arbitrary.js"

import * as vi from "vitest"
import { test, fc } from "@fast-check/vitest"

export namespace Property {
  export declare namespace Roundtrip {
    interface Test<T, S> {
      to(t: T): S;
      from(s: S): T;
      arbitrary: fc.Arbitrary<T>;
    }
    interface Params<T> extends fc.Parameters<[T]> {
      assert?(l: T, r: T): void | boolean
    }
  }

  export function roundtrip<T, S>(
    test: Roundtrip.Test<T, S>, 
    params?: Roundtrip.Params<T>
  ): () => void
  /// impl.
  export function roundtrip<T, S>(
    { to, from, arbitrary }: Roundtrip.Test<T, S>,
    { assert = vi.assert.deepEqual, ...params }: Roundtrip.Params<T> = {},
  ) {
    return (): void => void test.prop(
      [arbitrary], 
      params ?? {}
    )(`〖🌐〗:: ${to.name} -> ${from.name}`, (gen) => {
      return assert(from(to(gen)), gen)
    })
  }
}
