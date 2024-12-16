import * as vi from "vitest"
import { fc, show, test } from "@traversable/core"
import { fn } from "@traversable/data"
import { Either, Kind, Left, Right, type Functor } from "@traversable/registry"
import { eqBuilder, interpret } from "@traversable/interpret"
import Ext = interpret.Ext
import Schema = interpret.JsonSchema


const functor: Functor<Ext.Kind> = Ext.functor
const ana = fn.ana(functor)

interface StringKind extends Kind<string> { ["~1"]: string }

const algebra: Functor.Algebra<Ext.Kind, string> = (n) => {
  const prefix = "u"
  let count = 0
  switch (true) {
    case Schema.is.null(n): return eqBuilder.null({ varname: `${prefix + count++}`, nextIndex: "", nextKey: "", pointer: "" })
    case Schema.is.boolean(n): return eqBuilder.boolean({ varname: `${prefix + count++}`, nextIndex: "", nextKey: "", pointer: "" })
    case Schema.is.integer(n): return eqBuilder.number({ varname: `${prefix + count++}`, nextIndex: "", nextKey: "", pointer: "" })
    case Schema.is.number(n): return eqBuilder.number({ varname: `${prefix + count++}`, nextIndex: "", nextKey: "", pointer: "" })
    case Schema.is.string(n): return eqBuilder.string({ varname: `${prefix + count++}`, nextIndex: "", nextKey: "", pointer: "" })
    case Schema.is.array(n): return eqBuilder.array({ varname: `${prefix + count++}`, nextIndex: "", nextKey: "", pointer: "" })
    case Schema.is.object(n): return eqBuilder.object({ varname: `${prefix + count++}`, nextIndex: "", nextKey: "", pointer: "" })
    case Schema.is.allOf(n): return fn.throw("Not implemented")
    case Schema.is.anyOf(n): return fn.throw("Not implemented")
    case Schema.is.oneOf(n): return fn.throw("Not implemented")
    default: return fn.exhaustive(n)
  }
}

const unfoldAna = fn.ana(Ext.functor)(algebra)


// function foldPara<T>(algebra: Functor.RAlgebra<Ext.Kind, T>): (schema: Ext) => T
function foldPara<T>(algebra: Functor.RAlgebra<Ext.Kind, T>) {
  return fn.para(Ext.functor)(algebra)
}


// export interface RCoalgebra<F extends URIS, A> {
//   (_: A): Kind<F, Either<Fix<F>, A>>
// }





/* 
{
"type": "object",
"properties": {
  "yz": [
    {
      "type": "boolean"
    },
    "let u0=;if(u0!==boolean)return false;"
  ]
}
}
*/
// [interpret.JsonSchema.Kind<unknown>, unknown]>) => unknown

interface Stream {
  varname: string
  pointer: string
  nextIndex: string | number
  nextKey: string | null
  minSize?: number
  children: string[]
  type: "null" | "boolean" | "integer" | "number" | "string" | "array" | "tuple" | "object" | "record"
}

export function eq(schema: Ext): string {
  let count = 0
  const ralgebra
    : <T>(term: Ext.$<[Ext, Stream]>) => string
    = (n) => {
      console.log("n", JSON.stringify(n, null, 2))
      // console.log("right", right)
      const prefix = "u"
      switch (true) {
        case Schema.is.null(n): {
          return (console.log("Schema.is.null, n: "), { varname: `${prefix + count++}`, nextIndex: "", nextKey: "", pointer: "", type: n.type })
        }
        case Schema.is.boolean(n): {
          return (console.log("Schema.is.boolean, n: "), { varname: `${prefix + count++}`, nextIndex: "", nextKey: "", pointer: "", children: [], type: n.type })
        }
        case Schema.is.integer(n): {
          return (console.log("Schema.is.integer, n: "), { varname: `${prefix + count++}`, nextIndex: "", nextKey: "", pointer: "", children: [], type: n.type })
        }
        case Schema.is.number(n): {
          return (console.log("Schema.is.number, n: "), { varname: `${prefix + count++}`, nextIndex: "", nextKey: "", pointer: "", children: [], type: n.type })
        }
        case Schema.is.string(n): {
          return (console.log("Schema.is.string, n: "), { varname: `${prefix + count++}`, nextIndex: "", nextKey: "", pointer: "", children: [], type: n.type })
        }
        case Schema.is.array(n): {
          return (console.log("Schema.is.array, n: "), { varname: `${prefix + count++}`, nextIndex: "", nextKey: "", pointer: "", children: [] })
        }
        case Ext.is.tuple(n): {
          return (console.log("Schema.is.tuple, n: "), { varname: `${prefix + count++}`, nextIndex: "", nextKey: "", pointer: "", children: [] })
        }

        case Schema.is.object(n): {
          const l = n.properties[0]
          const r = n.properties[1]
          return {
            varname: `${prefix + count++}`,
            type: n.type,
            // pointer:

            children: fn.pipe(
              Object.values(n.properties),
              (xs) => xs.map(
                fn.flow(
                  fn.tap("property"),
                  ([z, stream]) => eqBuilder[stream.type]({ varname: z })
                // ([z, ss]) => z,
                
                )
              )
            ),

            
          }
          //   fn.pipe(
          //   Object.values(n.properties),
          //   fn.tap("properties"),
          //   (xs) => xs.map(([z, ss]) => z),
          // )

          // ) eqBuilder.object({ varname: })
          // (console.log("Schema.is.object, n: ", n), eqBuilder.object({ varname: `${prefix + count++}`, nextIndex: "", nextKey: "", pointer: "" }))
        }
        case Ext.is.allOf(n): return (console.log("Schema.is.allOf, n: ", n), fn.throw("Not implemented"))
        case Ext.is.anyOf(n): return (console.log("Schema.is.anyOf, n: ", n), fn.throw("Not implemented"))
        case Ext.is.oneOf(n): return (console.log("Schema.is.oneOf, n: ", n), fn.throw("Not implemented"))
        default: return (console.log("default, n: "), n)
      }
    }

  const fold = fn.para(Ext.functor)

  return "function eq(x){\n" + fn.apo(Ext.functor)(rcoalgebra) fold(ralgebra)(schema) + "\n}"
}

vi.describe("", () => {
  vi.it("", () => {
    const ex_01 = {
      type: "object",
      properties: {
        a: {
          type: "object",
          properties: {
            b: {
              type: "array",
              items: [
                { 
                  type: "object", 
                  properties: {
                    c: { type: "number" },
                    d: { type: "null" },
                    e: {
                      type: "array",
                      items: [
                        {
                          type: "array",
                          items: [
                            {
                              type: "array",
                              items: [
                                {
                                  type: "object",
                                  properties: {
                                    f: { type: "number" },
                                    g: { type: "number" },
                                  }
                                }
                              ]
                            }
                          ]
                        }
                      ]
                    },
                    f: { type: "number" }
                  }
                },
                { type: "object", properties: { g: { type: "number" } } }
              ]
            },
            h: { type: "number" },
          }
        }
      }
    } as const
    // {
    //   type: "object",
    //   properties: {
    //     abc: { type: "string", },                                        // u0
    //     def: { type: "null", },                                          // u1
    //     ghi: { type: "boolean", },                                       // u2
    //     jkl: { type: "number", },                                        // u3
    //     mno: { type: "integer", },                                       // u4
    //     pqr: { type: "string", },    //      u6                          // u5
    //     stu: { type: "array", items: { type: "number" } },               // u7
    //     vwx: { type: "object", properties: { yz: { type: "boolean" } } } // u9
    //   }
    // } as const

    // const actual = unfold(ex_01)
    const actual_2 = eq(ex_01)

    console.log("\n\n\nREUSLT\n\n", JSON.stringify(actual_2, null, 2)) // , "leuven")

    vi.assert.equal(actual_2, "")
    // vi.assert.equal(actual, "")
  })
})
