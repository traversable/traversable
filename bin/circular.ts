import * as process from "node:process"
import * as glob from "glob"
import madge from "madge"
import { Print } from "./util.js"
import { EMOJI } from "./metadata.js"

madge(
  glob.globSync(`packages/*/src/**/*.ts`),
  {
    detectiveOptions: {
      ts: {
        skipTypeImports: true,
      },
    },
  },
).then((res) => {
  const circular = res.circular()
  if (circular.length) {
    Print()
    Print(Print.invert(`[❕️] Critical `))
    Print()
    Print(Print.strong(`Circular dependencies detected (${circular.flat(1).length}) \n${EMOJI.WOW}\n`))
    Print()
    Print(circular.map((xs) => xs.map((x) => `packages/${x}`)))
    Print()
    Print(`Please fix them and re-build from scratch by running ` + Print.strong(`pnpm reboot`) + `.`)
    Print()
    process.exit(1)
  }
  else { globalThis.console.log(`No circular dependencies found ${EMOJI.FACTS}`) }
}).catch(globalThis.console.error)
