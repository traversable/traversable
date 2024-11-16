import { bench } from "@traversable/bench";
import * as vi from "vitest";

import pkg from "../package.json";

vi.describe("bench", () => {
	vi.it("bench.VERSION", () => {
		const expected = `${pkg.name}@${pkg.version}`;
		vi.assert.equal(bench.VERSION, expected);
	});
});
