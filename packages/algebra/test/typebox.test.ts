import * as fs from "node:fs"
import * as vi from "vitest"

import { typebox } from "@traversable/algebra"
import type { JsonSchema } from "@traversable/core"
import type { openapi } from "@traversable/openapi"
import type { _ } from "@traversable/registry"

import { PATH, seed, typeNameFromPath } from "./seed.js"

seed({ 
  regenerateSeedFilesOnSave: false,
  exclude: [],
  include: {
    example: false,
  }
})

vi.describe("〖️⛳️〗‹‹‹ ❲@traversable/algebra/typebox❳", () => {
  vi.it("〖️⛳️〗› ❲typebox.generate❳", async () => {
    const document: openapi.doc = JSON.parse(fs.readFileSync(PATH.spec).toString("utf8"))
    const schemas = document.components?.schemas ?? {}
    let generatedSchemas = [
      'import * as T from "@sinclair/typebox"',
      'import $doc from "./traversable.gen.json.js"',
    ]

    for (const k in schemas) {
      const schema = schemas[k]
      const options = {
        typeName: typeNameFromPath(k),
        document,
        absolutePath: ["components", "schemas", k],
      } satisfies Parameters<typeof typebox.generate>[1]

      // TODO: fix this type assertion
      void generatedSchemas.push(typebox.generate(schema as JsonSchema, options))
    }

    fs.writeFileSync(PATH.targets.typebox, generatedSchemas.join("\n\n") + "\n")
    vi.assert.isTrue(fs.existsSync(PATH.targets.typebox))
  })
})

