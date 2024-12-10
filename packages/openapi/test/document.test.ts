import * as fs from "node:fs"
import * as path from "node:path"
import * as vi from "vitest"

import { JsonPointer, fc, tree } from "@traversable/core"
import { type entry, fn, map } from "@traversable/data"
import { openapi } from "@traversable/openapi"

const PATH = {
  __generated__: path.join(path.resolve(), "packages", "openapi", "test", "__generated__"),
  target: path.join(path.resolve(), "packages", "openapi", "test", "__generated__", "arb.json"),
} as const

vi.describe("〖⛳️〗‹‹‹ ❲@traversable/openapi/arbitrary❳", () => {
  vi.test("〖⛳️〗‹ ❲openapi.arbitrary❳: all generated refs resolve to their original value", () => {
    const doc = fc.peek(openapi.arbitrary())

    if (!fs.existsSync(PATH.__generated__)) void (fs.mkdirSync(PATH.__generated__))
    void fs.writeFileSync(PATH.target, JSON.stringify(doc, null, 2))

    const paths = fn.pipe(
      globalThis.Object.entries(doc.components?.schemas!).filter(([k]) => k.startsWith("/paths/")),
      map(([k, v]) => [JsonPointer.toPath(k), v] satisfies [string[], openapi.Schema.any])
    )

    paths.forEach(([path, movedSchema]) => {
      const pointer: { $ref: string } = tree.get(doc, ...path) as never
      const target = tree.get(doc, "components", "schemas", pointer.$ref)
      vi.assert.deepEqual(target, movedSchema)
    })
  })
})
