import { execSync as $ } from "node:child_process"
import * as path from "node:path"
import * as vi from "vitest"
import * as API from "./__generated__/zod.gen.js"

import { type Handlers, Matchers, type Options as Options_, defineOptions, zod } from "@traversable/algebra"
import { Traversable, fc, is, test, tree } from "@traversable/core"
import { arbitrary, openapi } from "@traversable/openapi"

import type { Finite } from "@traversable/registry"

declare function finite<T extends Finite<T>>(x: T): Finite<T>


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

watch.configure = ({ handlers, ...options }: watch.Options): watch.Config => {
  const matchers = { 
    ...zod.generated,  
    Bro() { return "" },
    Brr() { return "" },
    Bun() { return "" },
  } satisfies Handlers<string>

  return {
    ...defineOptions(matchers)(options),
    ...options,
  }
}

vi.describe("〖️⛳️〗‹‹‹ ❲@traversable/algebra❳", () => {
  vi.it("〖️⛳️〗› ❲watch❳", () => {
    vi.assert.isTrue(true)
  })
})
