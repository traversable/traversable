import * as fs from "node:fs"
import * as vi from "vitest"

import { seed, typebox } from "@traversable/algebra"
import type { JsonSchema } from "@traversable/core"
import type { OpenAPI } from "@traversable/openapi"
import type { _ } from "@traversable/registry"

seed({ 
  regenerateSeedFilesOnSave: false,
  exclude: [],
  include: {
    example: false,
  }
})

vi.describe("〖️⛳️〗‹‹‹ ❲@traversable/algebra/typebox❳", () => {
  vi.it("〖️⛳️〗› ❲typebox.generate❳", async () => {
    const document
      : OpenAPI.doc<JsonSchema.any> 
      = JSON.parse(fs.readFileSync(seed.PATH.specs.arbitrary).toString("utf8"))
    const schemas = typebox.generateAll({ 
      document, 
      header: [
        ...typebox.defaults.header, 
        `import $doc from "../__specs__/arbitrary.hack.js"`
      ]
    })

    fs.writeFileSync(seed.PATH.targets.typebox, schemas.join("\n\n") + "\n")
    vi.assert.isTrue(fs.existsSync(seed.PATH.targets.typebox))
  })
})

