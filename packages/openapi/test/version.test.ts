import { openapi } from "@traversable/openapi";
import * as vi from "vitest";
import pkg from "../package.json";

vi.describe("openapi", () => {
	vi.it("openapi.VERSION", () => {
		const expected = `${pkg.name}@${pkg.version}`;
		vi.assert.equal(openapi.VERSION, expected);
	});
});
