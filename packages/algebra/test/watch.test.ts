import * as vi from "vitest"

import { Generator, type Handlers, type Options as Options_ } from "@traversable/algebra"

import type { Finite } from "@traversable/registry"

export declare namespace watch {
  type Required = {
    schemaFile: string
  }

  type Optional = Options_<string> & {
    outDir: string
  }

  type Options = (
    & Required 
    & Optional
  )

  interface Config extends 
    watch.Required, 
    globalThis.Required<watch.Optional> {

  }
}


export function watch(options: watch.Options): Promise<void> {
  return null as never
}

// watch.configure = ({ handlers, ...options }: watch.Options): watch.Config => {
//   const matchers = { 
//     ...zod.generated,  
//     Bro() { return "" },
//     Brr() { return "" },
//     Bun() { return "" },
//   } satisfies Handlers<string>

//   return {
//     ...Generator.fromMatchers(matchers)(options),
//     ...options,
//   }
// }

vi.describe("〖️⛳️〗‹‹‹ ❲@traversable/algebra❳", () => {
  vi.it("〖️⛳️〗› ❲watch❳", () => {
    vi.assert.isTrue(true)
  })
})
