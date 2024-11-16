#!/usr/bin/env pnpm dlx tsx
import { Command, Prompt } from "@effect/cli"
import { NodeContext, NodeRuntime } from "@effect/platform-node"
import { Effect } from "effect"

import { PACKAGES } from "./metadata.js"
import { main } from "./workspace-new.js"


const pkgToRm = Prompt.select({
  message: `Which package would you like to cleanup (remove)?`,
  choices: [...PACKAGES].sort().map(pkg => pkg.slice("packages/".length)).map((pkg) => ({ title: pkg, value: pkg }))
})

const cleanup = Command.prompt(
  "Cleanup workspace", 
  Prompt.all([ pkgToRm ]),
  ([ pkgName ]) => 
    Effect.sync(() => main.cleanup({ pkgName })
))

const cli = Command.run(cleanup, {
  name: "Generate an empty package",
  version: "v0.0.1"
})

Effect.suspend(() => cli(globalThis.process.argv)).pipe(
  Effect.provide(NodeContext.layer),
  NodeRuntime.runMain
)

// const pkgToRm = Prompt.text({
//   message: `What is the name of your package?`,
// })
// const visibility = Prompt.select({
//   message: `Initialize the package as private (will not auto-publish)?`,
//   choices: [
//     { title: "true", value: true },
//     { title: "false", value: false },
//   ] as const
// })
// const localDeps = Prompt.list({
//   message: `Which will your workspace depend on?\n\ncomma separated list containing any of: \n\n   ${
//     [...PACKAGES].sort().map(pkg => pkg.slice("packages/".length)).join(", ")
//   }\n` ,
//   delimiter: ", "
// })
