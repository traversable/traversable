import * as fs from "node:fs"
import * as path from "node:path"
import * as vi from "vitest"

import { JsonPointer, fc, tree } from "@traversable/core"
import { fn, map } from "@traversable/data"
import { openapi } from "@traversable/openapi"

/** @internal */
const Object_entries = globalThis.Object.entries

const PATH = {
  __generated__: path.join(path.resolve(), "packages", "openapi", "test", "__generated__"),
  target: path.join(path.resolve(), "packages", "openapi", "test", "__generated__", "arb.json"),
} as const

vi.describe("〖⛳️〗‹‹‹ ❲@traversable/openapi/arbitrary❳", () => {
  vi.test("〖⛳️〗‹ ❲openapi.arbitrary❳: all generated refs resolve to their original value", () => {
    const doc = fc.peek(openapi.arbitrary())

    /** 
     * Here we write the generated OpenAPI spec to disc.
     * 
     * This turns out to be incredibly useful for debugging "integration tests" 
     * using propery-base testing, since it gives you an artifact on disc, something you 
     * can inspect (rather than 10K loc in-memory, where you're at the mercy of your tooling's 
     * diagnostics to sift through things).
     * 
     * Better yet, writing to disc means we can take advantage of static analysis. That means
     * we can perform type-checking too, which can be a huge time-saver.
     * 
     * Especially when you're generating thousands of specs at a time, like we do before a release 😅
     * Honestly, I don't think we'd be able to do that if we weren't writing to disc at least some of
     * the time.
     */
    if (!fs.existsSync(PATH.__generated__)) void (fs.mkdirSync(PATH.__generated__))
    void fs.writeFileSync(PATH.target, JSON.stringify(doc, null, 2))

    const componentSchemas = fn.pipe(
      Object_entries(doc.components?.schemas!).filter(([k]) => k.startsWith("/paths/")),
      map(([k, v]) => [k, JsonPointer.toPath(k), v] satisfies [string, string[], openapi.Schema.any])
    )

    componentSchemas.forEach(([originalRef, jsonPointerPath, schema]) => {
      /** 
       * @example
       * vi.assert.equal(
       *   originalRef, 
       *   "/paths/~1cKx1~1{X9beE2J1gWW}~1jWiL84x2~1{NHQN4VO4X22x}~1Ic3/put/requestBody/content/text~1xml/schema",
       * )
       */
      vi.assert.isTrue(originalRef.startsWith("/paths/"))

      /** 
       * @example
       * vi.assert.deepEqual(
       *   jsonPointerPath, [
       *   '',
       *   'paths',
       *   '/cKx1/{X9beE2J1gWW}/jWiL84x2/{NHQN4VO4X22x}/Ic3',
       *   'put',
       *   'requestBody',
       *   'content',
       *   'text/xml',
       *   'schema'
       * ])
       */
      vi.assert.equal(jsonPointerPath[0], "")

      /**
       * @example 
       * vi.assert.deepEqual({ 
       *   "$ref": "#/components/schemas/paths/~1cKx1~1{X9beE2J1gWW}~1a/put/requestBody/content/text~1xml/schema" 
       * })
       */
      const dereferenced: { $ref: string } = tree.get(doc, ...jsonPointerPath) as never
      vi.assert.isTrue(dereferenced.$ref.startsWith("#/"))

      /**
       * @example
       * vi.assert.deepEqual(
       *   roundtrip, [
       *   '',
       *   'paths',
       *   '/cKx1/{X9beE2J1gWW}/jWiL84x2/{NHQN4VO4X22x}/Ic3',
       *   'put',
       *   'requestBody',
       *   'content',
       *   'text/xml',
       *   'schema'
       * ])
       */
      const roundtrip = JsonPointer.toPath(dereferenced.$ref.slice("#/components/schemas".length))

      /** make sure we come up with the same pointer after a roundtrip */
      vi.assert.deepEqual(roundtrip, jsonPointerPath)
      /** make sure we come up with the same _reference_ after a roundtrip */
      vi.assert.equal(doc.components?.schemas?.[originalRef], schema)
    })
  })
})
