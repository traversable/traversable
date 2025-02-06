import { merge, t } from '@traversable/core'
import * as vi from 'vitest'

vi.describe("〖️⛳️〗‹‹‹ ❲@traversable/algebra/Format❳", () => {
  vi.it("〖️⛳️〗› ❲Format.multiline❳", () => {
    type schema_01 = t.typeof<typeof schema_01>
    const schema_01 = t.object({
      a: t.object({
        b: t.array(t.string()),
        c: t.tuple(t.string(), t.string()),
      })
    })
    const f = merge(schema_01)
    const defaults = { a: { b: [], c: [ 'default-left', 'default-right' ] } } as const

    vi.expect(f(defaults)).toStrictEqual(defaults)
    vi.expect(f(defaults, { a: { c: ['user-defined'] } })).toMatchInlineSnapshot(`
      {
        "a": {
          "b": [],
          "c": [
            "user-defined",
            "default-right",
          ],
        },
      }
    `)

    vi.expect(
      f(
        defaults,
        { 
          a: {
            b: [ 'user-defined-1', 'user-defined-2' ], 
            c: [ undefined, 'user-defined-3' ] 
          } 
        }
      )
    ).toMatchInlineSnapshot(`
      {
        "a": {
          "b": [
            "user-defined-1",
            "user-defined-2",
          ],
          "c": [
            "default-left",
            "user-defined-3",
          ],
        },
      }
    `)

    const schema_02 = t.object({
      a: t.tuple(
        t.object({ 
          b: t.array(
            t.object({ 
              c: t.tuple(t.string()),
              d: t.number(),
            })
          ),
          e: t.boolean(),
        }),
        t.object({
          f: t.array(t.array(t.string())),
        })
      ),
      g: t.tuple(
          t.object({ 
            h: t.tuple(
              t.const(123)
            ),
          })
        )
    })

    const g = merge(schema_02)

    vi.expect(
      g({
        a: [
          {
            b: [
              {
                c: [
                  'ho',
                ],
                d: 9000,
              },
              {
                c: [
                  'nah',
                ],
                d: 10_000,
              },
              {
                c: [
                  'nah',
                ],
                d: 11_000,
              }
            ],
            e: false,
          },
          { f: [['yo']] },
        ],
        g: [{
          h: [
            123,
          ]
        }]
      },
      {
        a: [
          {
            b: [
              {
                c: ["override-1"],
                d: 9001,
              },
              {
                c: ["override-2"]
              }
            ]
          }
        ]
      })
    ).toMatchInlineSnapshot(`
      {
        "a": [
          {
            "b": [
              {
                "c": [
                  "override-1",
                ],
                "d": 9001,
              },
              {
                "c": [
                  "override-2",
                ],
              },
            ],
            "e": false,
          },
          {
            "f": [
              [
                "yo",
              ],
            ],
          },
        ],
        "g": [
          {
            "h": [
              123,
            ],
          },
        ],
      }
    `)

  })
})

