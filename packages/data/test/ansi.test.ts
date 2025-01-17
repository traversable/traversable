import { ANSI } from "@traversable/data"
import * as vi from "vitest"

vi.describe(`️〖⛳️〗‹‹‹ ❲${ANSI.yellow.bg(ANSI.red.fg("@traversable/data/color"))}❳ is red on yellow`, () => {
  vi.test(`〖️⛳️〗› ❲${ANSI.green.bg("color.color") + ""}❳: is green`, () => {
    const foreground = ANSI.yellow.fg("this text should have yellow foreground text")
    vi.assert.equal(foreground, "\u001b[38:2::250:215:21mthis text should have yellow foreground text\u001b[39m")

    const background = ANSI.yellow.bg("this text should have yellow background text")
    vi.assert.equal(background, "\u001b[48:2::250:215:21mthis text should have yellow background text\u001b[49m")
  })
})
