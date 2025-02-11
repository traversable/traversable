import * as fs from "node:fs"
import * as path from 'node:path'
import * as vi from 'vitest'

import type { JsonSchema } from "@traversable/core"
import { fc, schema, type t } from "@traversable/core"
import type { OpenAPI } from "@traversable/openapi"
import type { _ } from "@traversable/registry"

import type * as Box from '@sinclair/typebox'
import * as BoxValue from '@sinclair/typebox/value'
import { 
  type Generator, 
  //
  ark, 
  fastcheck, 
  seed, 
  trav, 
  typebox, 
  zod,
} from "@traversable/algebra"
import { type as arktype } from 'arktype'
import type * as Zod from 'zod'

const REGENERATE_SEED_FILES_ON_SAVE = false;
const GENERATING = {
  ark: true,
  fastcheck: true,
  box: true,
  zod: true,
  t: false,
}

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
  }
} as const

const arkParse
  : (type?: arktype.Any) => (u: unknown) => unknown
  = (type) => (u) => {
    if (!type) return void 0
    else {
      try { return type.assert(u) } 
      catch(typeError) { return typeError }
    }
  }

const boxParse
  : (schematic?: Box.TAnySchema) => (u: unknown) => unknown
  = (schematic?: Box.TAnySchema) => (u: unknown) => {
    if (!schematic) return void 0
    else {
      try { return BoxValue.Parse(schematic, u); } 
      catch (AssertError) { return (console.log('AssertError', AssertError), AssertError) }
    }
  }

seed({
  regenerateSeedFilesOnSave: REGENERATE_SEED_FILES_ON_SAVE,
  exclude: [],
  include: {
    description: true,
    example: true,
  },
  schemas: {
    sortBias: {
      allOf: 0,
      anyOf: 1,
      oneOf: 1,
      any: 1,
      array: 1,
      boolean: 1,
      const: 1,
      integer: 1,
      null: 1,
      number: 1,
      object: 1,
      record: 1,
      string: 1,
      tuple: 1,
    },
    allOf: { minLength: 1, maxLength: 2 },
    anyOf: { minLength: 2, maxLength: 2 },
    oneOf: { minLength: 2, maxLength: 2 },
    tuple: { minLength: 1 },
  }
})

vi.describe("〖️⛳️〗‹‹‹ ❲@traversable/algebra/integration❳", () => {
  const importDoc = `import $doc from "../__specs__/arbitrary.hack.js"`
  const document
    : OpenAPI.doc<JsonSchema.any>
    = JSON.parse(fs.readFileSync(PATH.specs.arbitrary).toString("utf8"))

  const derived = {
    ark: () => ark.deriveAll({ document, header: [...ark.defaults.header, importDoc] }),
    fastcheck: () => fastcheck.deriveAll({ document, header: [importDoc] }),
    t: () => trav.deriveAll({ document, header: [importDoc] }),
    box: () => typebox.deriveAll({ document, header: [importDoc] }),
    zod: () => zod.deriveAll({ document, header: [importDoc] }),
  }

  const compiled = {
    ark: () => ark.compileAll({ document, header: [...ark.defaults.header, importDoc] }),
    fastcheck: () => fastcheck.compileAll({ document, header: [...fastcheck.defaults.header, importDoc] }),
    t: () => trav.compileAll({ document, header: [...trav.defaults.header, importDoc] }),
    box: () => typebox.compileAll({ document, header: [...typebox.defaults.header, importDoc] }),
    pet: () => zod.compileAll({
      document: JSON.parse(fs.readFileSync(PATH.specs.pet).toString('utf8')),
      header: [`import $doc from "../__specs__/pet.hack.js"`],
    }),
    zod: () => zod.compileAll({
      ...zod.defaults.compile,
      document,
      header: [importDoc],
      flags: {
        includeJsdocLinks: false,
        includeLinkToOpenApiNode: false,
        includeExamples: true,
        includeDescription: false,
      }
    }),
  }

  vi.it("〖️⛳️〗› ❲pet.generate❳", async () => {
    const { byName, order, meta: { header = '' } } = compiled.pet()
    void fs.writeFileSync(PATH.targets.pet, [header, ...order.map((k) => byName[k])].join("\n\n") + "\n")
    void vi.assert.isTrue(fs.existsSync(PATH.targets.pet))
  })

  vi.it("〖️⛳️〗› ❲ark.generate❳", async () => {
    if (GENERATING.ark) {
      const { byName, order, meta: { header = '' } } = compiled.ark()
      void fs.writeFileSync(PATH.targets.ark, [header, ...order .map((k) => byName[k])].join("\n\n") + "\n")
      void vi.assert.isTrue(fs.existsSync(PATH.targets.ark))
    } else console.log('SKIP: arktype')
  })

  vi.it("〖️⛳️〗› ❲fastcheck.generate❳", async () => {
    if (GENERATING.fastcheck) {
      const { byName, order, meta: { header = '' } } = compiled.fastcheck()
      void fs.writeFileSync(PATH.targets.fastcheck, [header, ...order.map((k) => byName[k])].join("\n\n") + "\n")
      void vi.assert.isTrue(fs.existsSync(PATH.targets.fastcheck))
    } else console.log('SKIP: fast-check')
  })

  vi.it("〖️⛳️〗› ❲traversable.generate❳", async () => {
    if (GENERATING.t) {
      const { byName, order, meta: { header = '' } } = compiled.t()
      void fs.writeFileSync(PATH.targets.trav, [header, ...order.map((k) => byName[k])].join("\n\n") + "\n")
      void vi.assert.isTrue(fs.existsSync(PATH.targets.trav))
    } else console.log('SKIP: traversable')
  })

  vi.it("〖️⛳️〗› ❲typebox.generate❳", async () => {
    if (GENERATING.box) {
      const { byName, order, meta: { header = '' } } = compiled.box()
      void fs.writeFileSync(PATH.targets.typebox, [header, ...order .map((k) => byName[k])].join("\n\n") + "\n")
      void vi.assert.isTrue(fs.existsSync(PATH.targets.typebox))
    } else console.log('SKIP: typebox')
  })

  vi.it("〖️⛳️〗› ❲zod.generate❳", async () => {
    if (GENERATING.zod) {
      const { byName, order, meta: { header = '' } } = compiled.zod()
      void fs.writeFileSync(PATH.targets.zod, [header, ...order .map((k) => byName[k])].join("\n\n") + "\n")
      void vi.assert.isTrue(fs.existsSync(PATH.targets.zod))
    } else console.log('SKIP: zod')
  })

  let arks
    : false | Generator.All<arktype.Any<any>> 
    = GENERATING.ark && derived.ark()
  let boxes
    : false | Generator.All<Box.TAnySchema> 
    = GENERATING.box && derived.box()
  let fastchecks
    : false | Generator.All<fc.Arbitrary<unknown>> 
    = GENERATING.fastcheck && derived.fastcheck()
  let ts
    : false | Generator.All<t.type> 
    = GENERATING.t && derived.t()
  let zods
    : false | Generator.All<Zod.ZodTypeAny> 
    = GENERATING.zod && derived.zod()

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
      fastcheck: fastchecks && fastchecks.order.length,
      ark: arks && arks.order.length,
      ts: ts && ts.order.length,
      typebox: boxes && boxes.order.length,
      zod: zods && zods.order.length,
    })

    if (ts && fastchecks) vi.assert.equal(ts.order.length, fastchecks.order.length)
    if (ts && arks) vi.assert.equal(ts.order.length, arks.order.length)
    if (ts && boxes) vi.assert.equal(ts.order.length, boxes.order.length)
    if (ts && zods) vi.assert.equal(ts.order.length, zods.order.length)
    if (arks && arks.order.length > 0) {
      if (fastchecks) vi.assert.containsAllKeys(fastchecks.byName, arks.order)
      if (boxes) vi.assert.containsAllKeys(boxes.byName, arks.order)
      if (zods) vi.assert.containsAllKeys(zods.byName, arks.order)
      if (ts) vi.assert.containsAllKeys(ts.byName, arks.order)
    }
    if (boxes && boxes.order.length > 0) {
      if (fastchecks) vi.assert.containsAllKeys(fastchecks.byName, boxes.order)
      if (arks) vi.assert.containsAllKeys(arks.byName, boxes.order)
      if (zods) vi.assert.containsAllKeys(zods.byName, boxes.order)
      if (ts) vi.assert.containsAllKeys(ts.byName, boxes.order)
    }
    if (zods && zods.order.length > 0) {
      if (fastchecks) vi.assert.containsAllKeys(fastchecks.byName, zods.order)
      if (boxes) vi.assert.containsAllKeys(boxes.byName, zods.order)
      if (arks) vi.assert.containsAllKeys(arks.byName, zods.order)
      if (ts) vi.assert.containsAllKeys(ts.byName, zods.order)
    }
    if (fastchecks && fastchecks.order.length > 0) {
      if (boxes) vi.assert.containsAllKeys(boxes.byName, fastchecks.order)
      if (arks) vi.assert.containsAllKeys(arks.byName, fastchecks.order)
      if (zods) vi.assert.containsAllKeys(zods.byName, fastchecks.order)
      if (ts) vi.assert.containsAllKeys(ts.byName, fastchecks.order)
    }
    if (ts && ts.order.length > 0) {
      if (fastchecks) vi.assert.containsAllKeys(fastchecks.byName, ts.order)
      if (boxes) vi.assert.containsAllKeys(boxes.byName, ts.order)
      if (arks) vi.assert.containsAllKeys(arks.byName, ts.order)
      if (zods) vi.assert.containsAllKeys(zods.byName, ts.order)
    }
  })



  vi.it("〖️⛳️〗› ❲integration❳: validators validate", { retry: 2 }, async () => {
    let results = Array.of<Record<string, unknown>>()
    let failures = Array.of<{ key: string, error: unknown, input: unknown, vendor: keyof typeof GENERATING }>()

    const target = [arks, fastchecks, boxes, zods, ts].find((_) => _ !== false)
    if (!target) throw globalThis.Error('Must make at least one assertion')

    for (const k in target.byName) {
      const zodSchema = zods ? zods.byName[k] : void 0
      const travSchema = ts ? ts.byName[k] : void 0
      const arkSchema = arks ? arks.byName[k] : void 0
      const boxSchema = boxes ? boxes.byName[k] : void 0
      const arbitrary = fastchecks && fastchecks.byName[k]

      if (arbitrary) {
        const unknown = fc.sample(arbitrary, 1)[0]
        const $ = {
          key: k,
          zod: zodSchema?.safeParse(unknown),
          ark: arkParse(arkSchema)(unknown),
          t: travSchema?.is(unknown),
          box: boxParse(boxSchema)(unknown),
        }

        const bools = {
          ...$.ark !== undefined && { ark: !($.ark instanceof arktype.errors) }, 
          ...$.box !== undefined && { box: !($.box instanceof BoxValue.AssertError) },
          ...$.t !== undefined && { t: $.t },
          ...$.zod !== undefined && { zod: $.zod?.success },
        } as const

        const err = {
          ...$,
          zod: $.zod?.error,
        }
        const ok = {
          ...$,
          zod: $.zod?.data,
        }

        for (const bk in bools) {
          const bool = bools[bk as keyof typeof bools]
          if (bool === undefined) continue
          else if (bool === true) results.push(ok[bk as never])
          else failures.push({
            key: k,
            error: err[bk as never],
            input: JSON.stringify(unknown),
            vendor: bk as keyof typeof bools,
          })
        }

        if (failures.length !== 0) {
          const ____ = `===================================\n`
          for (const failure of failures) {
            console.group(`\n\n\n${____}\tVALIDATION FAILURE${____}\nvendor: ${failure.vendor.toUpperCase()}`)
            console.debug(`\nErrors: \n\n${JSON.stringify(failure.error, null, 2)}\n\n`)

            if (failure.vendor === 'zod' && zodSchema) console.debug(`\nzod.toString\n\n`, zod.toString(zodSchema), '\n\n')
            if (failure.vendor === 'box' && boxSchema) console.debug(`\ntypebox.toString:\n\n`, typebox.toString(boxSchema), '\n\n')
            if (failure.vendor === 'ark' && arkSchema) console.debug(`\narktype schema:\n\n`, JSON.stringify(arkSchema, null, 2), '\n\n')
            if (failure.vendor === 't' && travSchema) console.debug(`\nschema.toString:\n\n`, schema.toString(travSchema), '\n\n')
            
            console.debug(`\nInput: \n\n${failure.input}\n\n`)
            console.groupEnd()
          }
          vi.assert.fail(
            `\n\nVALIDATION FAILED\n`,
          )
        }

        // console.log(ok)
      }
    }

  })
})
