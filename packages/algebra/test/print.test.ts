import * as vi from 'vitest'

import { Print } from '@traversable/algebra'

vi.describe('〖️⛳️〗‹‹‹ ❲@traversable/algebra/Print❳', () => {
  vi.it('〖️⛳️〗› ❲Print.array❳', async () => {
    vi.expect(Print.array({ indent: 0 })('', '')).toMatchInlineSnapshot(`
      "
      "
    `)

    vi.expect(Print.array({ indent: 0 })('\n', '\n')).toMatchInlineSnapshot(`
      "


      "
    `)

    vi.expect(Print.array({ indent: 0, separator: ',' })('', 'a', 'b', 'c', '\n')).toMatchInlineSnapshot(`
      "
        a,
        b,
        c

      "
    `)
  })
})
