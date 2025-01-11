import * as fs from "node:fs"
import * as path from "node:path"
import * as vi from "vitest"

import { Traversable, fc, tree } from "@traversable/core"
import { fn, map } from "@traversable/data"
import { arbitrary } from "@traversable/openapi"

import { zod } from "@traversable/algebra"

const DIR = path.join(path.resolve(), "packages", "algebra", "test", "__generated__")
const PATH = {
  generated: DIR,
  spec: path.join(DIR, "traversable.gen.json"),
  targets: {
    zod: path.join(DIR, "zod.gen.ts"),
  }
} as const

const generateSpec = () => fn.pipe(
  arbitrary({ include: { examples: true, description: true }}),
  fc.peek,
  tree.modify("components", "schemas")(map(Traversable.fromJsonSchema)),
  JSON.stringify,
)

const randomIdent = () => 
  (Math.random().toString(32).split(".")[1] ?? "A")
  .replace(/\d/, (_) => String.fromCharCode(_.charCodeAt(0) + 0x11))

vi.describe("〖️⛳️〗‹‹‹ ❲@traversable/algebra/zod❳", () => {
  vi.it("〖️⛳️〗› ❲zod.derive❳", () => {
    if (!fs.existsSync(PATH.generated)) fs.mkdirSync(PATH.generated, { recursive: true })
    if (!fs.existsSync(PATH.targets.zod)) fs.writeFileSync(PATH.targets.zod, "")
    if (!fs.existsSync(PATH.spec)) fs.writeFileSync(PATH.spec, generateSpec())

    let generatedSchemas = [`import { z } from "zod"`, ""]
    const schemas
      : Record<string, Traversable.any>
      = JSON.parse(fs.readFileSync(PATH.spec).toString("utf8")).components?.schemas ?? {}

    for (const k in schemas) {
      const schema = schemas[k]
      const options = {
        typeName: randomIdent(),
        absolutePath: k as `/${string}`,
      }

      void generatedSchemas.push(zod.generate(schema, options))
    }

    fs.writeFileSync(PATH.targets.zod, generatedSchemas.join("\n\n"))

    vi.assert.isTrue(fs.existsSync(PATH.targets.zod))
  })
})
