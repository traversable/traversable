import { data } from "@traversable/data";
import * as vi from "vitest";

import pkg from "../package.json";

vi.describe("data", () => {
	vi.it("data.VERSION", () => {
		const expected = `${pkg.name}@${pkg.version}`;
		vi.assert.equal(data.VERSION, expected);
	});
});
