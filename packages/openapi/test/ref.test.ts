import { is, tree } from "@traversable/core"
import { Result, fn } from "@traversable/data"
import { OpenAPI, Ref } from "@traversable/openapi"
import * as vi from "vitest"

const doc_01 = OpenAPI.new({
  components: {
    schemas: {
      abc: {
        type: "object",
        properties: {
          def: { $ref: "#/components/schemas/jkl" },
          ghi: { $ref: "#/components/schemas/pqr"},
        }
      },
      jkl: { $ref: "#/components/schemas/mno" },
      mno: { $ref: "#/components/schemas/abc/properties/def" },
      pqr: { type: "object", properties: { stu: { type: "integer" } } },
      vwx: { 
        type: "array", 
        items: { 
          type: "object", 
          properties: { 
            y: { $ref: "#/components/schemas/abc/properties/def" }, 
            z: { $ref: "#/components/schemas/vwx/items" } 
          } 
        } 
      },
      stu: { $ref: "#/components/schemas/mno" }
    }
  },
})

const doc_02 = OpenAPI.new({
  components: {
    schemas: {
      abc: {
        type: "object",
        properties: {
          def: { $ref: "#/components/schemas/pqr" },
          ghi: { $ref: "#/components/schemas/z" },
        }
      },
      jkl: { type: "object", properties: { mno: { $ref: "#/components/schemas/abc" } } },
      pqr: { type: "object", properties: { stu: { type: "object", properties: { vwx: { $ref: "#/components/schemas/abc/properties" } } } } },
      z: { type: "array", items: { $ref: "#/components/schemas/abc" } },
      A: { type: "boolean" }
    }
  },
})

const graph = Object.entries(Ref.resolveAll(doc_02))
// console.log('graph', JSON.stringify(graph, null, 2))


vi.describe("〖⛳️〗‹‹‹ ❲@traversable/openapi/Ref.resolve❳", () => {
  vi.test("〖⛳️〗‹ ❲Ref.resolve❳: handles circular references", () => {
    vi.assert.throws(
      () => Ref.resolve("#/components/schemas/abc/properties/def")(doc_01),
      /circular reference/,
    )
    vi.assert.throws(
      () => Ref.resolve("#/components/schemas/vwx/items/properties/y")(doc_01),
      /circular reference/,
    )
  })

  vi.test("〖⛳️〗‹ ❲Ref.resolve❳: returns `undefined` if predicate fails", () => {
    vi.assert.equal(
      Ref.resolve("#/components/schemas/abc/properties/ghi", tree.has("type", is.literally("nonsense")))(doc_01),
      void 0
    )
  })

  vi.test("〖⛳️〗‹ ❲Ref.resolve❳: resolves shallow value", () => {
    vi.assert.equal(
      Ref.resolve("#/components/schemas/pqr")(doc_01),
      doc_01.components.schemas.pqr,
    )
  })

  vi.test("〖⛳️〗‹ ❲Ref.resolve❳: resolves deeply nested value", () => {
    vi.assert.equal(
      Ref.resolve("#/components/schemas/vwx/items/properties/z")(doc_01),
      doc_01.components.schemas.vwx.items,
    )
  })


  // vi.test("〖⛳️〗‹ ❲Ref.resolveAll❳: handles circular references", () => {
    // vi.assert.throws(
    //   () => Ref.resolveAll(doc_01),
    //   /circular reference/,
    // )
    // vi.assert.throws(
    //   () => Ref.resolveAll(doc_01),
    //   /circular reference/,
    // )
  // })

  // vi.test("〖⛳️〗‹ ❲Ref.resolveAll❳: returns `undefined` if predicate fails", () => {
  //   vi.assert.equal(
  //     Ref.resolveAll(doc_01),
  //     void 0
  //   )
  // })

  // vi.test("〖⛳️〗‹ ❲Ref.resolveAll❳: resolves shallow value", () => {
  //   vi.assert.equal(
  //     Ref.resolveAll(doc_01),
  //     {},
  //   )
  // })

  vi.test("〖⛳️〗‹ ❲Ref.resolve❳: resolves deeply nested value", () => {

    /*
    {
      pqr: { type: "object", properties: { stu: { type: "integer" } } },

      abc: { type: "object", properties: {
        def: { $ref: "#/components/schemas/jkl" },
        ghi: { $ref: "#/components/schemas/pqr"}, } },

      jkl: { $ref: "#/components/schemas/mno" },

      mno: { $ref: "#/components/schemas/abc/properties/def" },

      vwx: { type: "array", items: { type: "object", properties: { 
        y: { $ref: "#/components/schemas/abc/properties/def" }, 
        z: { $ref: "#/components/schemas/vwx/items" } } } },
    }
    */

    vi.expect(Ref.resolveAll(doc_01))
    .toMatchInlineSnapshot(`
      {
        "#/components/schemas/abc/properties/def": "#/components/schemas/abc/properties/def",
        "#/components/schemas/jkl": "#/components/schemas/jkl",
        "#/components/schemas/mno": "#/components/schemas/mno",
        "#/components/schemas/pqr": "#/components/schemas/pqr",
        "#/components/schemas/vwx/items": "#/components/schemas/vwx/items",
      }
    `)
      // {
      //    "#/components/schemas/abc/properties/def": {
      //      "$ref": "#/components/schemas/jkl",
      //    },
      //    "#/components/schemas/jkl": {
      //      "$ref": "#/components/schemas/mno",
      //    },
      //    "#/components/schemas/mno": {
      //      "$ref": "#/components/schemas/abc/properties/def",
      //    },
      //    "#/components/schemas/pqr": {
      //      "properties": {
      //        "stu": {
      //          "type": "integer",
      //        },
      //      },
      //      "type": "object",
      //    },
      //    "#/components/schemas/vwx/items": {
      //      "properties": {
      //        "y": {
      //          "$ref": "#/components/schemas/abc/properties/def",
      //        },
      //        "z": {
      //          "$ref": "#/components/schemas/vwx/items",
      //        },
      //      },
      //      "type": "object",
      //    }
      // }
  })
})

/* 

  {
    graph: {
      ABC/props/DEF -> JKL -> MNO -> ABC/props/DEF
      VWX/items/props/Y -> ABC/props/DEF
      VWX/items/props/Z -> VWX/items
      PQR/props/STU -> <leaf>

  }

  
    JKL: [
      ABC/DEF,

    ]

    MNO: [
      JKL,
    ]
  }
*/

