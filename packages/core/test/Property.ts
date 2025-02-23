import { test } from "@fast-check/vitest"
import type { fc } from "@traversable/core"

export namespace Property {
  export declare namespace Roundtrip {
    interface Test<T, S> {
      from(s: S): T
      to(t: T): S
      arbitrary: fc.Arbitrary<T>
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
    { assert, ...params }: Roundtrip.Params<T> = {},
  ) {
    return (): void => void test.prop(
      [arbitrary], 
      params ?? {}
    )(/** 〖🌐〗 */`〖🌍〗› ${to.name} -> ${from.name}`, (gen) => {
      return assert?.(from(to(gen)), gen)
    })
  }
}

