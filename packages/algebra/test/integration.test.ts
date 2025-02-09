import * as fs from "node:fs"
import * as path from 'node:path'
import { type as arktype } from 'arktype'
import * as vi from 'vitest'

import { ark, fastcheck, seed, trav, typebox, zod,  } from "@traversable/algebra"
import type { JsonSchema } from "@traversable/core"
import { fc } from "@traversable/core"
import type { OpenAPI } from "@traversable/openapi"
import { Schema } from "@traversable/openapi"
import type { _ } from "@traversable/registry"

const REGENERATE_SEED_FILES_ON_SAVE = false;


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
    pet: path.join(SPECS_DIR, 'pet.spec.json'),
  },
  hacks: {
    dir: SPECS_DIR,
    arbitrary: path.join(SPECS_DIR, 'arbitrary.hack.ts'),
    octokit: path.join(SPECS_DIR, 'octokit.hack.ts'),
    pet: path.join(SPECS_DIR, 'pet.hack.ts'),
  },
  targets: {
    dir: TARGETS_DIR,
    ark: path.join(TARGETS_DIR, 'ark.target.ts'),
    fastcheck: path.join(TARGETS_DIR, 'fastcheck.target.ts'),
    octokit: path.join(TARGETS_DIR, `octokit.target.ts`),
    pet: path.join(TARGETS_DIR, 'pet.target.ts'),
    trav: path.join(TARGETS_DIR, 'trav.target.ts'),
    typebox: path.join(TARGETS_DIR, 'typebox.target.ts'),
    zod: path.join(TARGETS_DIR, 'zod.target.ts'),
    zodTypesOnly: path.join(TARGETS_DIR, 'zodtypesOnly.target.ts'),
  }
} as const

const allOf = (LOOP: fc.Arbitrary<unknown>, $: Schema.Constraints.Config) => 
  Schema.allOf.base(Schema.object.base({ properties: LOOP, additionalProperties: LOOP }, $), $)

seed({ 
  regenerateSeedFilesOnSave: REGENERATE_SEED_FILES_ON_SAVE,
  exclude: [],
  include: {
    description: true,
    example: true,
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

vi.describe("〖️⛳️〗‹‹‹ ❲@traversable/algebra/integration❳", () => {
  const importDoc = `import $doc from "../__specs__/arbitrary.hack.js"`
  const document
    : OpenAPI.doc<JsonSchema.any> 
    = JSON.parse(fs.readFileSync(PATH.specs.arbitrary).toString("utf8"))

  const derived = {
    ark: () => ark.deriveAll({ document, header: [...ark.defaults.header, importDoc] }),
    fastcheck: () => fastcheck.deriveAll({ document, header: [...fastcheck.defaults.header, importDoc] }),
    trav: () => trav.deriveAll({ document, header: [...trav.defaults.header, importDoc] }),
    typebox: () => typebox.deriveAll({ document, header: [...typebox.defaults.header, importDoc] }),
    zod: () => zod.deriveAll({ document, header: [...zod.defaults.derive.header, importDoc] }),
  }
  const compiled = {
    ark: () => ark.compileAll({ document, header: [...ark.defaults.header, importDoc] }),
    fastcheck: () => fastcheck.compileAll({ document, header: [...fastcheck.defaults.header, importDoc] }),
    trav: () => trav.compileAll({ document, header: [...trav.defaults.header, importDoc] }),
    typebox: () => typebox.compileAll({ document, header: [...typebox.defaults.header, importDoc] }),
    pet: () => zod.compileAll({
      ...zod.defaults.compile,
      document: JSON.parse(fs.readFileSync(PATH.specs.pet).toString('utf8')),
      header: [...zod.defaults.compile.header, `import $doc from "../__specs__/pet.hack.js"`],
    }),
    zod: () => zod.compileAll({ 
      ...zod.defaults.compile,
      document, 
      header: [...zod.defaults.compile.header, importDoc], 
      flags: {
        includeJsdocLinks: true,
        includeLinkToOpenApiNode: true,
        includeExamples: true,
      }
    }),
  }

  const arks = derived.ark()
  const arbitraries = derived.fastcheck()
  const travs = derived.trav()
  const typeboxes = derived.typebox()
  const zods = derived.zod()

  vi.it("〖️⛳️〗› ❲pet.generate❳", async () => {
    const { byName, order, meta: { header = '' } } = compiled.pet()
    void fs.writeFileSync(PATH.targets.pet, [header, ...order.map((k) => byName[k])].join("\n\n") + "\n")
    void vi.assert.isTrue(fs.existsSync(PATH.targets.pet))
  })


  vi.it("〖️⛳️〗› ❲ark.generate❳", async () => {
    const { byName, order, meta: { header = '' } } = compiled.ark()
    void fs.writeFileSync(PATH.targets.ark, [header, ...order .map((k) => byName[k])].join("\n\n") + "\n")
    void vi.assert.isTrue(fs.existsSync(PATH.targets.ark))
  })

  vi.it("〖️⛳️〗› ❲fastcheck.generate❳", async () => {
    const { byName, order, meta: { header = '' } } = compiled.fastcheck()
    void fs.writeFileSync(PATH.targets.fastcheck, [header, ...order.map((k) => byName[k])].join("\n\n") + "\n")
    void vi.assert.isTrue(fs.existsSync(PATH.targets.fastcheck))
  })

  vi.it("〖️⛳️〗› ❲trav.generate❳", async () => {
    const { byName, order, meta: { header = '' } } = compiled.trav()
    void fs.writeFileSync(PATH.targets.trav, [header, ...order.map((k) => byName[k])].join("\n\n") + "\n")
    void vi.assert.isTrue(fs.existsSync(PATH.targets.trav))
  })

  vi.it("〖️⛳️〗› ❲typebox.generate❳", async () => {
    const { byName, order, meta: { header = '' } } = compiled.typebox()
    void fs.writeFileSync(PATH.targets.typebox, [header, ...order .map((k) => byName[k])].join("\n\n") + "\n")
    void vi.assert.isTrue(fs.existsSync(PATH.targets.typebox))
  })

  vi.it("〖️⛳️〗› ❲zod.generate❳", async () => {
    const { byName, order, meta: { header = '' } } = compiled.zod()
    void fs.writeFileSync(PATH.targets.zod, [header, ...order .map((k) => byName[k])].join("\n\n") + "\n")
    void vi.assert.isTrue(fs.existsSync(PATH.targets.zod))
  })

  vi.it("〖️⛳️〗› ❲integration❳: targets export the same identifiers", async () => {

    /** 
     * Not strictly necessary since we test the generated assets
     * pretty thoroughly below, but over time I've found that surfacing
     * a nice, simple report helps me feel confident that I _don't_ need 
     * to break these tests open to rule out false positives. 
     * 
     * Little sanity checks like these go a long way, for me at least.
     */
    console.table({
      ark: arks.order.length,
      fastcheck: arbitraries.order.length,
      typebox: typeboxes.order.length,
      zod: zods.order.length,
    })

    vi.assert.equal(travs.order.length, arbitraries.order.length)
    vi.assert.equal(travs.order.length, arks.order.length)
    vi.assert.equal(travs.order.length, typeboxes.order.length)
    vi.assert.equal(travs.order.length, zods.order.length)
    if (arks.order.length > 0) {
      vi.assert.containsAllKeys(arbitraries.byName, arks.order)
      vi.assert.containsAllKeys(typeboxes.byName, arks.order)
      vi.assert.containsAllKeys(zods.byName, arks.order)
      vi.assert.containsAllKeys(travs.byName, arks.order)
    }
    if (typeboxes.order.length > 0) {
      vi.assert.containsAllKeys(arbitraries.byName, typeboxes.order)
      vi.assert.containsAllKeys(arks.byName, typeboxes.order)
      vi.assert.containsAllKeys(zods.byName, typeboxes.order)
      vi.assert.containsAllKeys(travs.byName, typeboxes.order)
    }
    if (zods.order.length > 0) {
      vi.assert.containsAllKeys(arbitraries.byName, zods.order)
      vi.assert.containsAllKeys(arks.byName, zods.order)
      vi.assert.containsAllKeys(typeboxes.byName, zods.order)
      vi.assert.containsAllKeys(travs.byName, zods.order)
    }
    if (arbitraries.order.length > 0) {
      vi.assert.containsAllKeys(arks.byName, arbitraries.order)
      vi.assert.containsAllKeys(travs.byName, arbitraries.order)
      vi.assert.containsAllKeys(typeboxes.byName, arbitraries.order)
      vi.assert.containsAllKeys(zods.byName, arbitraries.order)
    }
    if (travs.order.length > 0) {
      vi.assert.containsAllKeys(arbitraries.byName, travs.order)
      vi.assert.containsAllKeys(arks.byName, travs.order)
      vi.assert.containsAllKeys(typeboxes.byName, travs.order)
      vi.assert.containsAllKeys(zods.byName, travs.order)
    }
  })

  vi.it("〖️⛳️〗› ❲integration❳: validators validate", async () => {

    for (const k in arbitraries.byName) {
      const arbitrary = arbitraries.byName[k]
      const x = fc.sample(arbitrary, 1)[0]

      const zodSchema = zods.byName[k]
      const arkSchema = arks.byName[k]
      const travSchema = travs.byName[k]
      const typeboxSchema = typeboxes.byName[k]
      const results = {
        ark: arkSchema.assert(x),
        zod: zodSchema.safeParse(x),

      }
      const bools = {
        ark: !(results.ark instanceof arktype.errors),
        zod: results.zod.success,
      } as const
        

      for (const k in bools) {
        const bool = bools[k as keyof typeof bools]
        if (!bool) {
          vi.assert.fail(
            "\n\n[VALIDATION FAILURE]: ${k}\n", 
            JSON.stringify(results[k as keyof typeof results], null, 2), '\n'
          )
        }

      }
    }
  })

})
