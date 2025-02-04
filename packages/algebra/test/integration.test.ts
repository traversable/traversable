import * as fs from "node:fs"
import * as path from 'node:path'
import * as vi from "vitest"
import * as fc from 'fast-check'

import { seed, ark, typebox, zod, fastcheck } from "@traversable/algebra"
import type { JsonSchema } from "@traversable/core"
import type { OpenAPI } from "@traversable/openapi"
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

seed({ 
  regenerateSeedFilesOnSave: true,
  exclude: [],
  include: {
    description: true,
    example: true,
  }
})

vi.describe("〖️⛳️〗‹‹‹ ❲@traversable/algebra/ark❳", () => {
  const importDoc = `import $doc from "../__specs__/arbitrary.hack.js"`
  const document
    : OpenAPI.doc<JsonSchema.any> 
    = JSON.parse(fs.readFileSync(PATH.specs.arbitrary).toString("utf8"))

  const targets = {
    ark: ark.generateAll({ document, header: [...ark.defaults.header, importDoc] }),
    fastcheck: fastcheck.deriveAll({ document, header: [...fastcheck.defaults.header, importDoc] }),
    fastcheckS: fastcheck.generateAll({ document, header: [...fastcheck.defaults.header, importDoc] }),
    typebox: typebox.generateAll({ document, header: [...typebox.defaults.header, importDoc] }),
    zod: zod.generateAll({ document, header: [...zod.defaults.header, importDoc] }),
  }


  vi.it("〖️⛳️〗› ❲ark.generate❳", async () => {
    const { byName, order, meta: { header = '' } } = ark
      .generateAll({ document, header: [...ark.defaults.header, importDoc] })
    void fs.writeFileSync(PATH.targets.ark, [header, ...order .map((k) => byName[k])].join("\n\n") + "\n")
    void vi.assert.isTrue(fs.existsSync(PATH.targets.ark))
  })

  vi.it("〖️⛳️〗› ❲fastcheck.generate❳", async () => {
    const { byName, order, meta: { header = '' } } = fastcheck
      .generateAll({ document, header: [...fastcheck.defaults.header, importDoc, ...fastcheck.dependencies] })
    void fs.writeFileSync(PATH.targets.fastcheck, [header, ...order.map((k) => byName[k])].join("\n\n") + "\n")
    void vi.assert.isTrue(fs.existsSync(PATH.targets.fastcheck))
  })

  vi.it("〖️⛳️〗› ❲typebox.generate❳", async () => {
    const { byName, order, meta: { header = '' } } = typebox
      .generateAll({ document, header: [...typebox.defaults.header, importDoc] })
    void fs.writeFileSync(PATH.targets.typebox, [header, ...order .map((k) => byName[k])].join("\n\n") + "\n")
    void vi.assert.isTrue(fs.existsSync(PATH.targets.typebox))
  })

  vi.it("〖️⛳️〗› ❲zod.generate❳", async () => {
    const { byName, order, meta: { header = '' } } = zod
      .generateAll({ document, header: [...zod.defaults.header, importDoc] })
    void fs.writeFileSync(PATH.targets.zod, [header, ...order .map((k) => byName[k])].join("\n\n") + "\n")
    void vi.assert.isTrue(fs.existsSync(PATH.targets.zod))
  })

  vi.it("〖️⛳️〗› ❲integration❳: targets export the same identifiers", async () => {
    console.table({
      ark: targets.ark.order.length,
      fastcheck: targets.fastcheck.order.length,
      typebox: targets.typebox.order.length,
      zod: targets.zod.order.length,
    })
    vi.assert.equal(targets.ark.order.length, targets.fastcheck.order.length)
    vi.assert.equal(targets.ark.order.length, targets.typebox.order.length)
    vi.assert.equal(targets.ark.order.length, targets.zod.order.length)
    if (targets.ark.order.length > 0) {
      vi.assert.containsAllKeys(targets.typebox.byName, targets.ark.order)
      vi.assert.containsAllKeys(targets.zod.byName, targets.ark.order)
      vi.assert.containsAllKeys(targets.fastcheck.byName, targets.ark.order)
    }
    if (targets.typebox.order.length > 0) {
      vi.assert.containsAllKeys(targets.ark.byName, targets.typebox.order)
      vi.assert.containsAllKeys(targets.zod.byName, targets.typebox.order)
      vi.assert.containsAllKeys(targets.fastcheck.byName, targets.typebox.order)
    }
    if (targets.zod.order.length > 0) {
      vi.assert.containsAllKeys(targets.ark.byName, targets.zod.order)
      vi.assert.containsAllKeys(targets.typebox.byName, targets.zod.order)
      vi.assert.containsAllKeys(targets.fastcheck.byName, targets.zod.order)
    }
    if (targets.fastcheck.order.length > 0) {
      vi.assert.containsAllKeys(targets.ark.byName, targets.fastcheck.order)
      vi.assert.containsAllKeys(targets.typebox.byName, targets.fastcheck.order)
      vi.assert.containsAllKeys(targets.zod.byName, targets.fastcheck.order)
    }
  })
})
