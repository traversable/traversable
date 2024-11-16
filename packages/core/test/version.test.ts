import { core } from "@traversable/core";
import * as vi from "vitest";

import pkg from "../package.json";

vi.describe("core", () => {
	vi.it("core.VERSION", () => {
		const expected = `${pkg.name}@${pkg.version}`;
		vi.assert.equal(core.VERSION, expected);
	});
});
