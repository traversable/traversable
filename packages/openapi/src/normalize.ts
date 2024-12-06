import { tree } from "@traversable/core"
import { accessors } from "./query.js"

export function normalize<T>(predicate: (t: T) => boolean) {
  return (document: { paths: { [x: string]: { [x: string]: {} } }, components?: { schemas?: {} }}) => {
    const a = accessors(predicate)(document.paths)
    // console.log("a", a)
    
    return a
  }
}
