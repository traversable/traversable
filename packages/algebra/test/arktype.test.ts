import * as fs from "node:fs"
import * as vi from "vitest"

import { ark, seed, typeNameFromPath } from "@traversable/algebra"
import type { JsonSchema } from "@traversable/core"
import type { openapi } from "@traversable/openapi"
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
    const document: openapi.doc = JSON.parse(fs.readFileSync(seed.PATH.spec).toString("utf8"))
    const schemas = document.components?.schemas ?? {}
    let generatedSchemas = [
      `import { type } from "arktype"`, 
      `import $doc from "./traversable.gen.json.js"`,
    ]

    for (const k in schemas) {
      const schema = schemas[k]
      const options = {
        typeName: typeNameFromPath(k),
        document,
        absolutePath: ["components", "schemas", k],
      } satisfies Parameters<typeof ark.generate>[1]

      // TODO: fix this type assertion
      void generatedSchemas.push(ark.generate(schema as JsonSchema, options))
    }

    fs.writeFileSync(seed.PATH.targets.ark, generatedSchemas.join("\n\n") + "\n")
    vi.assert.isTrue(fs.existsSync(seed.PATH.targets.ark))
  })
})
