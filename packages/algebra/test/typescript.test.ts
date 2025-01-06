import * as fs from "node:fs"
import * as path from "node:path"
import * as vi from "vitest"

import { typescript } from "@traversable/algebra"
import { type JsonSchema, Traversable, fc, tree } from "@traversable/core"
import { fn, map } from "@traversable/data"
import { arbitrary } from "@traversable/openapi"

const PATH = {
  generated: path.join(path.resolve(), "packages", "algebra", "test", "__generated__"),
  target: path.join(path.resolve(), "packages", "algebra", "test", "__generated__", "typescript.gen.ts"),
  IR: path.join(path.resolve(), "packages", "algebra", "test", "__generated__", "intermediate.gen.json"),
  spec: path.join(path.resolve(), "packages", "algebra", "test", "__generated__", "typescript.gen.json"),
} as const

const PATTERN = {
  identFromPath: /(\/|~|{|}|-)/g,
}

const typeNameFromPath = (k: string) => k
  .split("/")
  .map((s) => s.charAt(0).toUpperCase().concat(s.slice(1)))
  .join("_")
  .replace(PATTERN.identFromPath, "")

vi.describe("〖️⛳️〗‹‹‹ ❲@traversable/algebra/typescript❳", () => {
  vi.it("〖️⛳️〗› ❲typescript.derive❳: ‹sanity› (highly-suspect)", () => {
    if (!fs.existsSync(PATH.generated)) fs.mkdirSync(PATH.generated)
    const spec: { components: { schemas: { [x: string]: JsonSchema } } } = fc.peek(arbitrary({ include: { examples: true, description: true }})) as never

    const doc = fn.pipe(
      spec,
      tree.modify("components", "schemas"),
      fn.apply(map(Traversable.fromJsonSchema)),

    ) 
    /* 
    {
      ...spec,
      components: {
        ...spec.components,
        schemas: map(spec.components.schemas, (jsonSchema) => Traversable.fromJsonSchema( jsonSchema))
      }
    }*/

    // TODO: rm?
    fs.writeFileSync(PATH.spec, JSON.stringify(doc, null, 2))

    let out = [`import { string, number } from "@traversable/registry"`]
    let jsonSchemas: unknown[] = []

    const schemas = spec.components.schemas
    for (const k in schemas) {
      const typeName = typeNameFromPath(k)
      const schema = schemas[k]
      // const jsonSchema = Traversable.fromJsonSchema(schema)
      out.push(typescript.derive(schemas[k], { typeName, flags: { nominalTypes: true } }))
      // jsonSchemas.push(jsonSchema)
    }

    console.log("out", jsonSchemas.map(((_) => JSON.stringify(_, null, 2))))

    fs.writeFileSync(PATH.target, out.join("\n"))

    // console.log(spec)
    vi.assert.isTrue(true)
  })
})

