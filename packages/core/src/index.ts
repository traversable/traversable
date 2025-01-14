export * from "./exports.js";
export * as core from "./exports.js";

/** 
 * # {@link core `core`} 
 * 
 * The {@link core `core`} module includes all of the individual exports from
 * `@traversable/core`. A few usage examples are included below.
 * 
 * @example
 * import { core } from "@traversable/core"
 * 
 * const objectSchema = core.t.object({ abc: core.t.string() })
 * //    ^? const objectSchema: core.t.object<{ abc: core.t.string   }>
 * 
 * const jsonPointerToPath = core.JsonPointer.toPath("/f~0o~1o/bar/1/~1baz~0")
 * //    ^? const jsonPointerToPath: ["", "f~o/o", "bar", "1", "/baz~"]
 * 
 * const IsValidJsonSchemaObject = core.JsonSchema.object.is({ type: "object" })
 * //    ^? const IsValidJsonSchemaObject: boolean
 *
 * const treeFromPaths = core.tree.fromPaths([
 *   //  ^? const treeFromPaths: { abc: { def: 123, ghi: { jkl: 456, mno: { pqr: 789 } } } }
 *   [["abc", "def"], 123],
 *   [["abc", "ghi", "jkl"],  456],
 *   [["abc", "ghi", "mno", "pqr"],  789],
 * ])
 *
 * console.log(core.tree.toPaths({ abc: { def: 123, ghi: { jkl: 456, mno: { pqr: 789 } } } }))
 * // => [[["abc", "def"], 123], [["abc", "ghi", "jkl"],  456], [["abc", "ghi", "mno", "pqr"], 789]]
 */
declare module "./exports.js"
import * as core from "./exports.js";
