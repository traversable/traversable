import * as fs from "node:fs"
import * as path from "node:path"
import * as vi from "vitest"
import { z } from "zod"

import prettier from "@prettier/sync"
import { Traversable, fc, is, test, tree } from "@traversable/core"
import { fn, map } from "@traversable/data"
import { arbitrary } from "@traversable/openapi"

import { zod } from "@traversable/algebra"
import { _ } from "@traversable/registry"
import IR = zod.IR

const DIR = path.join(path.resolve(), "packages", "algebra", "test", "__generated__")
const PATH = {
  generated: DIR,
  spec: path.join(DIR, "traversable.gen.json"),
  targets: {
    jsdocHack: path.join(DIR, "traversable.gen.json.ts"),
    zod: path.join(DIR, "zod.gen.ts"),
  }
} as const

const PATTERN = {
  CleanPathName: /(\/|~|-|{|})/g
} as const

const generateSpec = () => fn.pipe(
  arbitrary({ include: { examples: true, description: true } }),
  fc.peek,
  tree.modify("components", "schemas")(map(Traversable.fromJsonSchema)),
  JSON.stringify,
)

const Array_isArray 
  : <T>(u: unknown) => u is readonly T[]
  = globalThis.Array.isArray

interface Invertible { [x: keyof any]: keyof any }

const sub
  : <const D extends Invertible>(dict: D) => (text: string) => string
  = (dict) => (text) => {
    let ks = [...text], out = "", k
    while ((k = ks.shift()) !== undefined) out += k in dict ? String(dict[k]) : k
    return out
  }

function iso<const D extends Invertible>(dict: D):  {
  to<S extends string>(text: S): string
  from<S extends string>(text: S): string
} {
  let rev: Invertible = {}
  for (const k in dict) rev[dict[k]] = k
  return { 
    to: function to(text: string) {
      let ks = [...text], out = "", k
      while ((k = ks.shift()) !== undefined) out += k in dict ? String(dict[k]) : k
      return out
    }, 
    from: function from(text: string) {
      let ks = [...text], out = "", k
      while ((k = ks.shift()) !== undefined) out += k in rev ? String(rev[k]) : k
      return out 
    }
  }
}

function mapKeysRec(f: (s: string) => string) {
  return <T>(x: T): {} | null | undefined => {
    switch (true) {
      case x == null:
      case typeof x === "boolean":
      case typeof x === "string":
      case typeof x === "number": return x
      case Array_isArray(x): return map(x, mapKeysRec(f))
      case !!x && typeof x === "object": {
        let out: Record<keyof any, unknown> = {}
        for (const k in x) out[f(k)] = mapKeysRec(f)(x[k])
        return out
      }
    }
  }
}

const pathify = fn.flow(
  mapKeysRec(sub({ "/": "𛰎", "{": "𛰧", "}": "𛰨", "~": "𛰃" })),
  JSON.stringify,
  (_) => prettier.format(_, { parser: "json" }),
  (_) => "export default " + _.trimEnd() + " as const;"
)


// const randomIdent = () => 
//   (Math.random().toString(32).split(".")[1] ?? "A")
//   .replace(/\d/, (_) => String.fromCharCode(_.charCodeAt(0) + 0x11))

const capitalize = (s: string) => s.charAt(0).toUpperCase().concat(s.slice(1))
const typeNameFromPath = (k: string) => capitalize(k.slice("/paths/".length).replace(PATTERN.CleanPathName, "_"))

vi.describe("〖️⛳️〗‹‹‹ ❲@traversable/algebra/zod❳", () => {
  vi.it("〖️⛳️〗› ❲zod.derive❳", async () => {
    if (!fs.existsSync(PATH.generated)) fs.mkdirSync(PATH.generated, { recursive: true })
    if (!fs.existsSync(PATH.targets.zod)) fs.writeFileSync(PATH.targets.zod, "")
    if (!fs.existsSync(PATH.spec)) fs.writeFileSync(PATH.spec, prettier.format(generateSpec(), { parser: "json" }))
    if (!fs.existsSync(PATH.targets.jsdocHack)) fs.writeFileSync(PATH.targets.jsdocHack, "")

    /** 
     * TODO: generate tests that confirm that {@link zod.derive `derived`} and {@link zod.generate `generated`}
     * algebras are equivalent / at parity
     */
    const document = JSON.parse(fs.readFileSync(PATH.spec).toString("utf8"))

    fs.writeFileSync(
      PATH.targets.jsdocHack, 
      pathify(document),
    )

    const schemas
      : Record<string, Traversable.any>
      = document.components?.schemas ?? {}

    let generatedSchemas = [
      `import { z } from "zod"`, 
      `import type $doc from "./traversable.gen.json.js"`,
    ]
    let derivedSchemas: z.ZodTypeAny[] = []

    for (const k in schemas) {
      const jsonSchema = schemas[k]
      const options = {
        typeName: typeNameFromPath(k),
        futureFlags: {
          // includeLinkToOpenApiNode: "./traversable.gen.json"
        },
        document,
        absolutePath: ["components", "schemas", k],
      } satisfies Parameters<typeof zod.generate>[1]
      const schema = await zod.generate(jsonSchema, options)

      void generatedSchemas.push(schema)
    }

    for (const k in schemas) {
      const jsonSchema = schemas[k]
      const options = {
        typeName: typeNameFromPath(k),
        document,
        absolutePath: ["components", "schemas", k],
      } satisfies Parameters<typeof zod.generate>[1]

      const schema = await zod.derive(jsonSchema, options)
      void derivedSchemas.push(schema)
    }

    fs.writeFileSync(PATH.targets.zod, generatedSchemas.join("\n\n"))
    vi.assert.isTrue(fs.existsSync(PATH.targets.zod))
  })
})

vi.describe("〖️⛳️〗‹‹‹ ❲@traversable/algebra/zod❳", () => {
  const Null = IR.make.null()
  const examples = {
    null: Null,
    boolean: IR.make.boolean(),
    number: IR.make.number(),
    string: IR.make.string(),
    literal: IR.make.literal({ literal: null }),
    optional: IR.make.optional(Null),
    array: IR.make.array(Null),
    record: IR.make.record(Null),
    object: IR.make.object({ a: Null }),
    tuple: IR.make.tuple([Null, Null]),
    intersection: IR.make.intersection([Null, Null]),
    union: IR.make.union([Null, Null]),
  } as const

  vi.it("〖️⛳️〗› ❲zod.IR.make❳", () => {
    vi.assert.deepEqual(
      { tag: z.ZodFirstPartyTypeKind.ZodNull, meta: {} },
      examples.null, 
    )
    vi.assert.deepEqual(
      { tag: z.ZodFirstPartyTypeKind.ZodBoolean, meta: {} },
      examples.boolean, 
    )
    vi.assert.deepEqual(
      { tag: z.ZodFirstPartyTypeKind.ZodNumber, meta: {} },
      examples.number,
    )
    vi.assert.deepEqual(
      { tag: z.ZodFirstPartyTypeKind.ZodString, meta: {} },
      examples.string, 
    )
    vi.assert.deepEqual(
      { tag: z.ZodFirstPartyTypeKind.ZodLiteral, meta: { literal: null } },
      examples.literal, 
    )
    vi.assert.deepEqual(
      { tag: z.ZodFirstPartyTypeKind.ZodOptional, meta: {}, def: Null },
      examples.optional, 
    )
    vi.assert.deepEqual(
      { tag: z.ZodFirstPartyTypeKind.ZodArray, meta: {}, def: Null },
      examples.array, 
    )
    vi.assert.deepEqual(
      { tag: z.ZodFirstPartyTypeKind.ZodRecord, meta: {}, def: Null },
      examples.record, 
    )
    vi.assert.deepEqual(
      { tag: z.ZodFirstPartyTypeKind.ZodObject, meta: {}, def: { a: Null } },
      examples.object, 
    )
    vi.assert.deepEqual(
      { tag: z.ZodFirstPartyTypeKind.ZodTuple, meta: {}, def: [Null, Null] },
      examples.tuple, 
    )
    vi.assert.deepEqual(
      { tag: z.ZodFirstPartyTypeKind.ZodIntersection, meta: {}, def: [Null, Null] },
      examples.intersection,
    )
    vi.assert.deepEqual(
      { tag: z.ZodFirstPartyTypeKind.ZodUnion, meta: {}, def: [Null, Null] },
      examples.union, 
    )
  })

  vi.it("〖️⛳️〗› ❲zod.IR.is❳", () => {
    vi.assert.isTrue(IR.is.null(examples.null))
    vi.assert.isFalse(IR.is.null(examples.boolean))

    vi.assert.isTrue(IR.is.boolean(examples.boolean))
    vi.assert.isFalse(IR.is.boolean(examples.null))

    vi.assert.isTrue(IR.is.number(examples.number))
    vi.assert.isFalse(IR.is.number(examples.null))

    vi.assert.isTrue(IR.is.string(examples.string))
    vi.assert.isFalse(IR.is.string(examples.null))

    vi.assert.isTrue(IR.is.array(examples.array))
    vi.assert.isFalse(IR.is.array(examples.null))

    vi.assert.isTrue(IR.is.record(examples.record))
    vi.assert.isFalse(IR.is.record(examples.null))

    vi.assert.isTrue(IR.is.object(examples.object))
    vi.assert.isFalse(IR.is.object(examples.null))

    vi.assert.isTrue(IR.is.tuple(examples.tuple))
    vi.assert.isFalse(IR.is.tuple(examples.null))

    vi.assert.isTrue(IR.is.intersection(examples.intersection))
    vi.assert.isFalse(IR.is.intersection(examples.null))

    vi.assert.isTrue(IR.is.union(examples.union))
    vi.assert.isFalse(IR.is.union(examples.null))
  })

  // /** 
  //  * Order of operations:
  //  * 
  //  * 1. Use {@link IR.arbitrary `IR.arbitrary`} to generate a pseudo-random
  //  *    intermediate representation of a Zod schema (arbitrary #1)
  //  * 2. From the IR, derive the corresponding Zod schema
  //  * 3. From the schema, derive a _separate_ arbitrary (arbitrary #2); this arbitrary will
  //  *    be responsible for generating data that schema should be able to parse
  //  * 4. Generate data from the arbitrary #2
  //  * 5. Parse the generated data using the generated schema 
  //  *
  //  * If this test is able to produce a counter-example, that indicates that _something_
  //  * in the chain isn't working properly.
  //  * 
  //  * This test is the moral equivalent of an integration test: we're trading granularity
  //  * for confidence that our programs can be composed together, and that their composition
  //  * has not caused any loss of fidelity.
  //  * 
  //  * TODO: depending on how coarse this tests proves to be, it might be worth decomposing
  //  * this test, so we have our cake and eat it too.
  //  */
  // test.prop(
  //   [IR.arbitrary({ 
  //     exclude: [
  //       /** 
  //        * TODO: __turn on property tests for intersections__
  //        * 
  //        * These are currently off because I haven't figured out how to 
  //        * programmatically generate tests intersections without quickly
  //        * running into schemas that are impossible to satisfy.
  //        * 
  //        * There's probably a clever way to do it, but I'm walking away from
  //        * this problem for now.
  //        */
  //       "intersection",
  //     ] 
  // }).tree], {
  //   numRuns: 10_000,
  // })(
  //   "〖️⛳️〗› ❲zod.IntermediateRepresentation❳", (ir) => {
  //     const schema = IR.toSchema(ir)
  //     const arbitrary = IR.toArbitrary(ir)
  //     const mock = fc.peek(arbitrary)
  //     const parsed = schema.safeParse(mock)
  //     if (!parsed.success) {
  //       console.group("failure:")
  //       console.dir(["mock", mock], { depth: 10 })
  //       console.dir(["error", parsed.error], { depth: 10, getters: true })
  //       console.log(IR.toString(ir))
  //       console.groupEnd()
  //     }
  //     vi.assert.isTrue(parsed.success)
  //   }
  // )

})
