import * as vi from 'vitest'
import * as fs from "node:fs"
import * as path from 'node:path'

import type { JsonSchema } from "@traversable/core"
import { fc, schema, t } from "@traversable/core"
import type { OpenAPI } from "@traversable/openapi"
import { Schema } from "@traversable/openapi"
import type { _ } from "@traversable/registry"

import * as Box from '@sinclair/typebox'
import * as BoxValue from '@sinclair/typebox/value'
import { type as arktype } from 'arktype'
import * as Zod from 'zod'
import { 
  Generator, 
  seed, 
  //
  ark, 
  fastcheck, 
  trav, 
  typebox, 
  zod,
} from "@traversable/algebra"

const REGENERATE_SEED_FILES_ON_SAVE = false;
const GENERATING = {
  ark: true,
  fastcheck: true,
  trav: false,
  typebox: false,
  zod: true,
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
      try { return BoxValue.Assert(schematic, u); } 
      catch (AssertError) { return AssertError }
    }
  }

// const allOf = (LOOP: fc.Arbitrary<unknown>, $: Schema.Constraints.Config) =>
//   Schema.allOf.base(Schema.object.base({ properties: LOOP, additionalProperties: LOOP }, $), $)

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
    allOf: {
      // arbitrary: allOf,
      minLength: 1,
      maxLength: 2,
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
    t: () => trav.deriveAll({ document, header: [...trav.defaults.header, importDoc] }),
    box: () => typebox.deriveAll({ document, header: [...typebox.defaults.header, importDoc] }),
    zod: () => zod.deriveAll({ document, header: [...zod.defaults.derive.header, importDoc] }),
  }
  const compiled = {
    ark: () => ark.compileAll({ document, header: [...ark.defaults.header, importDoc] }),
    fastcheck: () => fastcheck.compileAll({ document, header: [...fastcheck.defaults.header, importDoc] }),
    t: () => trav.compileAll({ document, header: [...trav.defaults.header, importDoc] }),
    box: () => typebox.compileAll({ document, header: [...typebox.defaults.header, importDoc] }),
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
        includeJsdocLinks: false,
        includeLinkToOpenApiNode: false,
        includeExamples: true,
        includeDescription: false,
      }
    }),
  }

  vi.it.skip("〖️⛳️〗› ❲pet.generate❳", async () => {
    const { byName, order, meta: { header = '' } } = compiled.pet()
    void fs.writeFileSync(PATH.targets.pet, [header, ...order.map((k) => byName[k])].join("\n\n") + "\n")
    void vi.assert.isTrue(fs.existsSync(PATH.targets.pet))
  })

  vi.it.skip("〖️⛳️〗› ❲ark.generate❳", async () => {
    const { byName, order, meta: { header = '' } } = compiled.ark()
    void fs.writeFileSync(PATH.targets.ark, [header, ...order .map((k) => byName[k])].join("\n\n") + "\n")
    void vi.assert.isTrue(fs.existsSync(PATH.targets.ark))
  })

  vi.it.skip("〖️⛳️〗› ❲fastcheck.generate❳", async () => {
    const { byName, order, meta: { header = '' } } = compiled.fastcheck()
    void fs.writeFileSync(PATH.targets.fastcheck, [header, ...order.map((k) => byName[k])].join("\n\n") + "\n")
    void vi.assert.isTrue(fs.existsSync(PATH.targets.fastcheck))
  })

  vi.it.skip("〖️⛳️〗› ❲traversable.generate❳", async () => {
    const { byName, order, meta: { header = '' } } = compiled.t()
    void fs.writeFileSync(PATH.targets.trav, [header, ...order.map((k) => byName[k])].join("\n\n") + "\n")
    void vi.assert.isTrue(fs.existsSync(PATH.targets.trav))
  })

  vi.it.skip("〖️⛳️〗› ❲typebox.generate❳", async () => {
    const { byName, order, meta: { header = '' } } = compiled.box()
    void fs.writeFileSync(PATH.targets.typebox, [header, ...order .map((k) => byName[k])].join("\n\n") + "\n")
    void vi.assert.isTrue(fs.existsSync(PATH.targets.typebox))
  })

  vi.it("〖️⛳️〗› ❲zod.generate❳", async () => {
    const { byName, order, meta: { header = '' } } = compiled.zod()
    void fs.writeFileSync(PATH.targets.zod, [header, ...order .map((k) => byName[k])].join("\n\n") + "\n")
    void vi.assert.isTrue(fs.existsSync(PATH.targets.zod))
  })

  let arks
    : false | Generator.All<arktype.Any<any>> 
    = GENERATING.ark && derived.ark()
  let boxes
    : false | Generator.All<Box.TAnySchema> 
    = GENERATING.typebox && derived.box()
  let fastchecks
    : false | Generator.All<fc.Arbitrary<unknown>> 
    = GENERATING.fastcheck && derived.fastcheck()
  let ts
    : false | Generator.All<t.type> 
    = GENERATING.trav && derived.t()
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
    try {
    } catch (e) {
      console.error(e)
    }

    let results = Array.of<Record<string, unknown>>()
    let failures = Array.of<{ key: string, error: unknown, input: unknown, vendor: string }>()

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
        const result = {
          key: k,
          zod: zodSchema?.safeParse(unknown),
          ark: arkParse(arkSchema)(unknown),
          t: travSchema?.is(unknown),
          box: boxParse(boxSchema)(unknown),
        }
        const bools = {
          ...result.ark !== undefined && { ark: !(result.ark instanceof arktype.errors) }, 
          ...result.box !== undefined && { box: !(result.box instanceof BoxValue.AssertError) },
          ...result.t !== undefined && { t: result.t },
          ...result.zod !== undefined && { zod: result.zod?.success },
        } as const
        const success = {
          ...result,
          zod: result.zod?.data,
        }
        const failure = {
          ...result,
          zod: result.zod?.error,
        }

        for (const bk in bools) {
          const bool = bools[bk as keyof typeof bools]
          if (bool === undefined) continue
          else if (bool === true) results.push(success[bk as never])
          else failures.push({
            key: k,
            error: failure[bk as never],
            input: JSON.stringify(unknown),
            vendor: bk,
          })
        }
        // /paths/~1uptaRkgbW~1{q5S}~1lPw~1{XN1EK0XIHP}/put/responses/283/content/text~1plain/schema
        // /paths/~1uptaRkgbW~1{q5S}~1lPw~1{XN1EK0XIHP}/get/responses/231/content/application~1x-www-form-urlencoded/schema

        if (failures.length !== 0) {
          const ____ = `===================================\n`
          for (const failure of failures) {
            console.group(`\n\n\n${____}${____}\tVALIDATION FAILURE\n${____}\nvendor: ${failure.vendor.toUpperCase()}`)
            console.debug(`\nErrors: \n\n${JSON.stringify(failure.error, null, 2)}\n\n`)
            if (zodSchema) console.debug(`\nzod.toString(zodSchema)\n\n`, zod.toString(zodSchema), '\n\n')
            if (travSchema) console.debug(`\nschema.toString(travSchema)\n\n`, schema.toString(travSchema), '\n\n')
            console.debug(`\nInput: \n\n${failure.input}\n\n`)
            console.groupEnd()
          }
          vi.assert.fail(
            `\n\nVALIDATION FAILED\n`,
          )
        }

        console.log(result)
      }
    }

  })

})

/** 
 * @example
 * z.object({ 
 *   _j9: z.intersection(
 *     z.unknown(), 
 *     z.object({ 
 *       $7$__: z.string().optional(),
 *       yC: z.string().optional() 
 *     })
 *   ),
 *   _0_: z.intersection(
 *     z.unknown(),
 *     z.object({ 
 *       _: z.string(),
 *       OA6_s8$j: z.number().int().multipleOf(22),
 *       EHk$3: z.object({
 *         $87___3: z.string(),
 *         $ly$: z.string(),
 *         $__: z.string(),
 *         _$2c: z.record(z.string()).optional(),
 *         Yy7$6$_aV: z.string().optional(),
 *         _rdxe: z.string().optional(),
 *         $1_2__y: z.string().optional(),
 *         $BcPJ$a_I6K: z.intersection(
 *           z.unknown(),
 *           z.object({ 
 *             _$$c_$t_J$$: z.string(),
 *             $o_9: z.record(z.string()),
 *             _: z.string(),
 *             r_WuRn_2l4: z.string(),
 *             UJ_1p$: z.string() 
 *           })
 *         ).optional(),
 *         L7sK$__: z.string().optional(),
 *         V6$$48: z.string().optional()
 *       }),
 *       $$$: z.string(),
 *       dj: z.number().int().gt(-1753205006892300),
 *       _7wA$h__: z.boolean(),
 *       ypt$3AX: z.string(),
 *       R_: z.record(z.record(z.string())).optional(),
 *       _$_3O_Z: z.union([z.boolean(), z.string(), z.string()]).optional()
 *     })
 *   ),
 *   _068: z.record(z.string()),
 *   Q$$vg: z.number().int().gt(-9576).lt(-7864),
 *   $N4_$$__: z.tuple([z.string(), z.string(), z.string(), z.null(), z.null()]),
 *   $_q$_6a8: z.intersection(
 *     z.unknown(),
 *     z.object({ 
 *       _$2$$$Do: z.string(),
 *       $: z.string().optional() 
 *     })
 *   ),
 *   O0$$2$35$$_: z.number(),
 *   $eAN: z.array(z.string()).optional(), 
 *   $Cc0QVo: z.object({
 *     $Yg_fKr: z.string(),
 *     Tz1U$f____q: z.object({ 
 *       d_C: z.object({ 
 *         _X4$B: z.null(),
 *         __I6: z.number(),
 *         _$_: z.string(),
 *         $8__K6S: z.object({ 
 *           H: z.boolean(),
 *           kwxlF_UgB: z.object({  
 *             s_: z.string(),
 *             h$$$D$__27P: z.string(),
 *             d$: z.string(),
 *             $4k$zS$c6: z.object({ 
 *               LmE04$tV: z.string(),
 *               $_$$_6$: z.string(),
 *               _: z.string(),
 *               B__f$IJdPM1: z.string() 
 *             }),
 *             qx4OP8_$$: z.null(),
 *             $$Fh: z.number(),
 *             $_$or07: z.boolean(),
 *             _7$o4_$7$x: z.number() 
 *           }),
 *           $S$l5: z.boolean(),
 *           _b$__uQ6: z.boolean(),
 *           _8: z.number(),
 *           _9o3__$K_4: z.object({
 *             x$__: z.number(),
 *             CT$pbx: z.null(),
 *             $NS1: z.string(),
 *             Q$$wPih: z.string(),
 *             $$g$__: z.boolean(),
 *             Y$: z.object({ K$qy_3$_: z.number(), __H: z.null() }),
 *             _Pu_3$7_8: z.number(),
 *             $r78_: z.number() 
 *           }),
 *           $R: z.boolean(),
 *           Di_a: z.null() 
 *         }),
 *         n_$h__: z.object({ 
 *           L: z.boolean(),
 *           Vn$Q_ul: z.number(),
 *           go_SJ$$1Q: z.null(),
 *           gCMy$: z.number(),
 *           $aK: z.string() 
 *         }),
 *         Y: z.object({ 
 *           $A1: z.null(),
 *           _: z.string(),
 *           _$$zv: z.object({ 
 *             _Hd: z.null(),
 *             Zs: z.boolean(),
 *             _: z.string(),
 *             $$9SQ_p8: z.number(),
 *             q0$Dl: z.null(),
 *             aoXs$x: z.string(),
 *             T0_z0$o_o: z.null() 
 *           }),
 *           __: z.string() 
 *         }),
 *         $$$$q: z.null(),
 *         yK7_: z.number(),
 *         $_$3A$a95Wb: z.number() 
 *       }) 
 *     }),
 *     _: z.number(),
 *     f$$T_$9$_S$: z.number(),
 *     $$7q: z.number(),
 *     i$: z.string()
 *   }).optional(),
 *   $ee_7$37: z.boolean().optional() 
 * }) 
 * 
 * {
 *   "_j9": [
 *     {
 *       "$7$__": "9M $+|",
 *       "yC": "20]Z2(:|U-U~x-<OR@.$d:u+5c1#H6@E4Sg QT-mn{)/u~vgzwQ1D!a^[r1n@35R8n,y{/"
 *     }
 *   ],
 *   "__0_": [
 *     {
 *       "_": "6\"T",
 *       "OA6_s8$j": 10406,
 *       "EHk$3": {
 *         "_$2c": {
 *           "Ab": "_",
 *           "": "X$[",
 *           " v$": "bi"
 *         },
 *         "Yy7$6$_aV": "__",
 *         "_rdxe": "[g7B",
 *         "$87___3": "*\"\"\" W&zFzN*F$&}`sx#%{a~|Rz @&}!$}$%vf}z\"X} $y+{\"hv#}#\"{&!xFv!%f#z!> o&c+&\"|~&&!A.{.:jX#V&%}J{Fi#~G#i t!V$/8AT9h(sRz##`Z]Am%*k&}\"|s~7#&&J$a%: #y% M[I0#x0t$#%UKL& &vl%P \"O.\"Wvx+Hp`nx!'(!} #Xd#Vt{ C|\"",
 *         "$ly$": "2_",
 *         "$__": "a",
 *         "$1_2__y": "l",
 *         "$BcPJ$a_I6K": [
 *           {
 *             "_$$c_$t_J$$": ")icKH2xga",
 *             "$o_9": {
 *               "W!%": "5",
 *               "N": "S* PPTRKX",
 *               "magna enim augue lectus curabitur consectetur convallis ipsum": "",
 *               "nec nonummy": "6;.tUgkw\\",
 *               "mQ'LO": "mbqU.38"
 *             },
 *             "_": "&",
 *             "r_WuRn_2l4": "j#R",
 *             "UJ_1p$": "<RcLV=~/"
 *           }
 *         ],
 *         "L7sK$__": "{pd",
 *         "V6$$48": "E^w@soLVk"
 *       },
 *       "$$$": "al",
 *       "dj": -1523641161463977,
 *       "_7wA$h__": false,
 *       "ypt$3AX": "lvV{q#>m|D8d-ez.FpYX*(%N]'|Ux/{@MchT&)]pMF-]!'G;ZKUWJrs2B?hVZzo+@:_fU=0Xj/Z-x6CzK-~&-uyD,@yr0dOH{J*JRmKajwQf}W{%N!@Q&HF12=%\\>VJ>O*PP1A|RsaD`n42Rk?cW}JIA%{U0i~i>%S\".IjX2</=fE8|#.*EC",
 *       "_$_3O_Z": "j}e\\//:0r/~\\50GJ7U<D"
 *     }
 *   ],
 *   "$eAN": [
 *     "Q>;>(\\",
 *     ")@",
 *     "] ",
 *     "b3V)>e!",
 *     "n>r",
 *     "']L>",
 *     "H",
 *     "",
 *     "z;P/yac=v"
 *   ],
 *   "_068": {
 *     "id volutpat": "vR}0{nmuh\"g>dB\"",
 *     "0WV_3mB^J": "h3!4&A>\"W9n'k*",
 *     "H=": "=Xj~vc-B^*a_fJ8f",
 *     "fermentum ullamcorper": "a0p6Wz7`~g<f\"Z#C"
 *   },
 *   "Q$$vg": -8328,
 *   "$ee_7$37": true,
 *   "$N4_$$__": [
 *     "te",
 *     "\"y",
 *     "con",
 *     null,
 *     null
 *   ],
 *   "$_q$_6a8": [
 *     {
 *       "_$2$$$Do": "\"zZ"
 *     }
 *   ],
 *   "O0$$2$35$$_": -3.4930338623046096e-28
 * }
 * */
