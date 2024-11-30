import { bench } from "@traversable/bench"
import * as vi from "vitest"

import pkg from "../package.json"

vi.describe(`〖⛳️〗‹‹‹ ❲${pkg.name}/version❳ (with v${pkg.version})`, () => {
	vi.it(`〖⛳️〗› ❲${pkg.name.slice("@traversable/".length)}.VERSION❳`, () => {
		const expected = `${pkg.name}@${pkg.version}`
		vi.assert.equal(bench.VERSION, expected)
	})
})
