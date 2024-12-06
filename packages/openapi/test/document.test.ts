import * as fs from "node:fs"
import * as path from "node:path"
import * as vi from "vitest"

import { fc } from "@traversable/core"
import { openapi } from "@traversable/openapi"

const PATH = {
  target: path.join(path.resolve(), "packages", "openapi", "test", "__generated__", "arb.json")
} as const

vi.describe("〖⛳️〗‹‹‹ ❲@traversable/openapi/json-adapter❳", () => {
  vi.test("〖⛳️〗‹ ❲openapi.toJSON❳", () => {
    const doc = fc.peek(openapi.arbitrary())

    fs.writeFileSync(PATH.target, JSON.stringify(doc, null, 2))


  })
})
