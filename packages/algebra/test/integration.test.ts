import * as fs from "node:fs"
import * as path from 'node:path'
import * as vi from 'vitest'
import { z } from 'zod'

import { ark, fastcheck, seed, typebox, zod } from "@traversable/algebra"
import type { JsonSchema } from "@traversable/core"
import { fc } from "@traversable/core"
import type { OpenAPI } from "@traversable/openapi"
import { Schema } from "@traversable/openapi"
import type { _ } from "@traversable/registry"

export const TARGETS_DIR = path.join(path.resolve(), 'packages', 'algebra', 'test', '__generated__')
export const SPECS_DIR = path.join(path.resolve(), 'packages', 'algebra', 'test', '__specs__')
export const PATH = {
  dirs: {
    specs: SPECS_DIR,
    hacks: SPECS_DIR,
    targets: TARGETS_DIR,
  },
  specs: {
    dir: SPECS_DIR,
    arbitrary: path.join(SPECS_DIR, 'arbitrary.spec.json'),
    octokit: path.join(SPECS_DIR, 'octokit.spec.json'),
  },
  hacks: {
    dir: SPECS_DIR,
    arbitrary: path.join(SPECS_DIR, 'arbitrary.hack.ts'),
    octokit: path.join(SPECS_DIR, 'octokit.hack.ts'),
  },
  targets: {
    dir: TARGETS_DIR,
    ark: path.join(TARGETS_DIR, 'ark.target.ts'),
    fastcheck: path.join(TARGETS_DIR, 'fastcheck.target.ts'),
    octokit: path.join(TARGETS_DIR, `octokit.target.ts`),
    typebox: path.join(TARGETS_DIR, 'typebox.target.ts'),
    zod: path.join(TARGETS_DIR, 'zod.target.ts'),
    zodTypesOnly: path.join(TARGETS_DIR, 'zodtypesOnly.target.ts'),
  }
} as const

const allOf = (LOOP: fc.Arbitrary<unknown>, $: Schema.Constraints.Config) => Schema.allOf.base(fc.dictionary(LOOP), $)

seed({ 
  regenerateSeedFilesOnSave: true,
  exclude: ['allOf'],
  include: {
    description: false,
    example: false,
  },
  schemas: {
    allOf: {
      arbitrary: allOf,
    },
    anyOf: {
      minLength: 2,
      maxLength: 4,
    },
    oneOf: {
      minLength: 2,
      maxLength: 4,
    },
    tuple: {
      minLength: 1,
    },
  }
})

const tupleSchema = z.tuple([
  z.string().url(),
  z.number().int().min(8244).lt(13730),
  z.tuple([
  ])
])

const test = z.union([
  z.array(
    z.tuple([
      z.array(
        z.string().min(50).max(240)
      ),
      z.string().min(96).max(219).regex(/\/\[\^J-X\]\|\//),
      z.string().email(),
      z.string().min(18).max(154),
      z.array(
        z.string().ulid()
      ),
      z.string().min(53).max(243)
    ])
  ),
  z.never()
])

const data = [ 'https://c.rh/', 9215, [] ]
const result = tupleSchema.safeParse(data)

vi.describe("〖️⛳️〗‹‹‹ ❲@traversable/algebra/integration❳", () => {
  const importDoc = `import $doc from "../__specs__/arbitrary.hack.js"`
  const document
    : OpenAPI.doc<JsonSchema.any> 
    = JSON.parse(fs.readFileSync(PATH.specs.arbitrary).toString("utf8"))

  const derived = {
    // ark: ark.deriveAll({ document, header: [...ark.defaults.header, importDoc] }),
    fastcheck: fastcheck.deriveAll({ document, header: [...fastcheck.defaults.header, importDoc] }),
    // typebox: typebox.deriveAll({ document, header: [...typebox.defaults.header, importDoc] }),
    zod: zod.deriveAll({ document, header: [...zod.defaults.header, importDoc], flags: { includeJsdocLinks: false, includeLinkToOpenApiNode: false, } }),
  }
  const compiled = {
    // ark: ark.compileAll({ document, header: [...ark.defaults.header, importDoc] }),
    fastcheck: fastcheck.compileAll({ document, header: [...fastcheck.defaults.header, importDoc] }),
    // typebox: typebox.compileAll({ document, header: [...typebox.defaults.header, importDoc] }),
    zod: zod.compileAll({ document, header: [...zod.defaults.header, importDoc], template: (x) => [x] }),
  }

  // vi.it("〖️⛳️〗› ❲ark.generate❳", async () => {
  //   const { byName, order, meta: { header = '' } } = compiled.ark
  //   void fs.writeFileSync(PATH.targets.ark, [header, ...order .map((k) => byName[k])].join("\n\n") + "\n")
  //   void vi.assert.isTrue(fs.existsSync(PATH.targets.ark))
  // })

  vi.it("〖️⛳️〗› ❲fastcheck.generate❳", async () => {
    const { byName, order, meta: { header = '' } } = compiled.fastcheck
    void fs.writeFileSync(PATH.targets.fastcheck, [header, ...order.map((k) => byName[k])].join("\n\n") + "\n")
    void vi.assert.isTrue(fs.existsSync(PATH.targets.fastcheck))
  })

  // vi.it("〖️⛳️〗› ❲typebox.generate❳", async () => {
  //   const { byName, order, meta: { header = '' } } = compiled.typebox
  //   void fs.writeFileSync(PATH.targets.typebox, [header, ...order .map((k) => byName[k])].join("\n\n") + "\n")
  //   void vi.assert.isTrue(fs.existsSync(PATH.targets.typebox))
  // })

  vi.it("〖️⛳️〗› ❲zod.generate❳", async () => {
    const { byName, order, meta: { header = '' } } = compiled.zod
    void fs.writeFileSync(PATH.targets.zod, [header, ...order .map((k) => byName[k])].join("\n\n") + "\n")
    void vi.assert.isTrue(fs.existsSync(PATH.targets.zod))
  })

  vi.it("〖️⛳️〗› ❲integration❳: targets export the same identifiers", async () => {
    console.table({
      // ark: derived.ark.order.length,
      fastcheck: derived.fastcheck.order.length,
      // typebox: derived.typebox.order.length,
      zod: derived.zod.order.length,
    })
    // vi.assert.equal(derived.ark.order.length, derived.fastcheck.order.length)
    // vi.assert.equal(derived.ark.order.length, derived.typebox.order.length)
    // vi.assert.equal(derived.ark.order.length, derived.zod.order.length)
    // if (derived.ark.order.length > 0) {
    //   vi.assert.containsAllKeys(derived.typebox.byName, derived.ark.order)
    //   vi.assert.containsAllKeys(derived.zod.byName, derived.ark.order)
    //   vi.assert.containsAllKeys(derived.fastcheck.byName, derived.ark.order)
    // }
    // if (derived.typebox.order.length > 0) {
    //   vi.assert.containsAllKeys(derived.ark.byName, derived.typebox.order)
    //   vi.assert.containsAllKeys(derived.zod.byName, derived.typebox.order)
    //   vi.assert.containsAllKeys(derived.fastcheck.byName, derived.typebox.order)
    // }
    if (derived.zod.order.length > 0) {
      // vi.assert.containsAllKeys(derived.ark.byName, derived.zod.order)
      // vi.assert.containsAllKeys(derived.typebox.byName, derived.zod.order)
      vi.assert.containsAllKeys(derived.fastcheck.byName, derived.zod.order)
    }
    if (derived.fastcheck.order.length > 0) {
      // vi.assert.containsAllKeys(derived.ark.byName, derived.fastcheck.order)
      // vi.assert.containsAllKeys(derived.typebox.byName, derived.fastcheck.order)
      vi.assert.containsAllKeys(derived.zod.byName, derived.fastcheck.order)
    }
    for (const k in derived.fastcheck.byName) {


      // console.group("\n\n\n\n===============   INTEGRATION TEST   ===============")
      // console.log("\n\nschemaName:", k, "\n")
      // console.log('\n\ncompiled.zod.byName[k]:\n', compiled.zod.byName[k], '\n')


      const arbitrary = derived.fastcheck.byName[k]

      const x = fc.sample(arbitrary, 1)[0]


      console.log('\n\nx:\n', x, '\n')


      const zodSchema = derived.zod.byName[k]
      console.log("zodSchema", zod.toString(zodSchema))

      const result = zodSchema.safeParse(x)


      // console.log('\n\nresult:\n', result, '\n')


      if (!result.success) {
        console.group("\n\n\n\n===============   INTEGRATION TEST (FAILURE)   ===============")
        console.log("\n\nRESULT is ERROR:\n", result.error, '\n')
        console.log("\n\nschemaName:", k, "\n")
        console.log('\n\nx:\n', x, '\n')
        console.log('\n\ncompiled.zod.byName[k]:\n', compiled.zod.byName[k], '\n')
        console.log('\n\nresult:\n', result, '\n')
        console.groupEnd()
      }

      vi.assert.isTrue(result.success)

    }
  })
})
