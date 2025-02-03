#!/usr/bin/env pnpm dlx tsx
import * as path from "node:path"
import * as fs from "node:fs"
import { seed, zod } from "@traversable/algebra"
import { OpenAPI } from "@traversable/openapi"
import { JsonSchema, Traversable } from "@traversable/core"

seed({
  include: { 
    description: true, 
    example: true,
  },
})

const DIR = path.join(path.resolve(), "app", "client", "src", "schemas")
const PATH = {
  specs: {
    maybe: path.join(DIR, "maybe.spec.json"),
  },
  hacks: {
    maybe: path.join(DIR, "maybe.hack.ts"),
  },
  targets: {
    maybe: path.join(DIR, "maybe.target.ts")
  },
} as const

if (!fs.existsSync(PATH.hacks.maybe)) fs.writeFileSync(PATH.hacks.maybe, "")
if (!fs.existsSync(PATH.targets.maybe)) fs.writeFileSync(PATH.targets.maybe, "")

const raw: OpenAPI.doc<JsonSchema.any> = JSON.parse(fs.readFileSync(PATH.specs.maybe).toString("utf8"))
const spec = OpenAPI.map(raw, Traversable.fromJsonSchema)

fs.writeFileSync(
  PATH.hacks.maybe, 
  JSON.stringify(seed.preprocess(spec), null, 2),
)

const generated = zod.generate(spec.components.schemas.maybe, { document: spec })

console.log("generated",  generated)

fs.writeFileSync(PATH.targets.maybe, 
  [
    'import { z } from "zod"',
    'import $doc from "./maybe.hack.ts"',
    generated,
  ].join("\n")
)
