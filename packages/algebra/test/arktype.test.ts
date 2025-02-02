import * as fs from "node:fs"
import * as vi from "vitest"

import { ark, seed } from "@traversable/algebra"
import type { JsonSchema } from "@traversable/core"
import type { OpenAPI } from "@traversable/openapi"
import type { _ } from "@traversable/registry"

seed({ 
  regenerateSeedFilesOnSave: true,
  exclude: [],
  include: {
    description: true,
    example: true,
  }
})

vi.describe("〖️⛳️〗‹‹‹ ❲@traversable/algebra/ark❳", () => {
  vi.it("〖️⛳️〗› ❲ark.generate❳", async () => {
    const document
      : OpenAPI.doc<JsonSchema.any> 
      = JSON.parse(fs.readFileSync(seed.PATH.specs.arbitrary).toString("utf8"))
    const schemas = ark.generateAll({ 
      document, 
      header: [
        ...ark.defaults.header, 
        `import $doc from "../__specs__/arbitrary.hack.js"`
      ]
    })

    fs.writeFileSync(seed.PATH.targets.ark, schemas.join("\n\n") + "\n")
    vi.assert.isTrue(fs.existsSync(seed.PATH.targets.ark))
  })
})
