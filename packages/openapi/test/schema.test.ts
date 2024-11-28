import { fc, it, test } from "@traversable/core"
import * as vi from "vitest"

import { openapi } from "@traversable/openapi"

openapi.Schema.any

vi.describe("@traversable/core", () => {
  test.prop([openapi.Schema.any()], {})("openapi.Schema.any", (schema) => {

    const peek = fc.peek(openapi.Schema.any())

    // console.log("peek", peek)

    vi.assert.isTrue(openapi.Schema.is(schema))
  })
})

