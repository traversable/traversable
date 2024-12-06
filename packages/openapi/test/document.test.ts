import * as fs from "node:fs"
import * as path from "node:path"
import * as vi from "vitest"

import { fc, JsonPointer } from "@traversable/core"
import { openapi } from "@traversable/openapi"
import { fn, map } from "@traversable/data"

const PATH = {
  __generated__: path.join(path.resolve(), "packages", "openapi", "test", "__generated__"),
  target: path.join(path.resolve(), "packages", "openapi", "test", "__generated__", "arb.json"),
} as const

vi.describe("〖⛳️〗‹‹‹ ❲@traversable/openapi/json-adapter❳", () => {
  vi.test("〖⛳️〗‹ ❲openapi.toJSON❳", () => {
    const doc = fc.peek(openapi.arbitrary())

    if (!fs.existsSync(PATH.__generated__)) 
      void (fs.mkdirSync(PATH.__generated__))

    void fs.writeFileSync(PATH.target, JSON.stringify(doc, null, 2))

    const paths = fn.pipe(
      Object.entries(doc.components?.schemas!).filter(([k]) => k.startsWith("/paths/")),
      map(([k, v]) => [JsonPointer.toPath(k), v])
    )

    /** 
     * Current behavior:
     * - [ ] TODO:
     *   1. append `schema` to the refpath
     *   2. pick `schema` from the matched object
     *   3. update only `schema` in source object
     *   4. only store the picked `schema` "components/schemas"
     * 
     * @example
     * 
     * const x = [
     *   '',
     *   'paths',
     *   '/QwJxO3m/{o59AEtcOidnHr}/{oiPrnSdANCe}/{Yt0838AQ7JG}/{a51}',
     *   'post',
     *   'parameters',
     *   '9'
     * ]
     * 
     * const y = {
     *   in: 'header',
     *   name: 'u_$pd$__',
     *   required: true,
     *   schema: [Object],
     *   deprecated: true
     * }
     */

    console.log("paths", paths)

  })
})
