#!/usr/bin/env pnpm dlx tsx
import { Command, Prompt } from "@effect/cli"
import { NodeContext, NodeRuntime } from "@effect/platform-node"
import { Effect } from "effect"

import { PACKAGES } from "./metadata.js"
import { main } from "./workspace-new.js"

const pkgName = Prompt.text({
  message: `What is the name of your package?`,
})

const env = Prompt.select({
  message: `Which environment will your package run in?`,
  choices: [
    { title: "node", value: "node" },
    { title: "react", value: "react" },
  ] as const
})

const visibility = Prompt.select({
  message: `Initialize the package as private (will not auto-publish)?`,
  choices: [
    { title: "true", value: true },
    { title: "false", value: false },
  ] as const
})


const localDeps = Prompt.list({
  message: `Which will your workspace depend on?\n\ncomma separated list containing any of: \n\n   ${
    [...PACKAGES].sort().map(pkg => pkg.slice("packages/".length)).join(", ")
  }\n` ,
  delimiter: ", "
})

const command = Command.prompt(
  "New workspace", 
  Prompt.all([pkgName, env, localDeps, visibility]),
  ([ pkgName, env, localDeps, private_ ]) => 
    Effect.sync(() => main({ pkgName, env, localDeps, private: private_, dryRun: false })
))

const cli = Command.run(command, {
  name: "Generate an empty package",
  version: "v0.0.1"
})

Effect.suspend(() => cli(globalThis.process.argv)).pipe(
  Effect.provide(NodeContext.layer),
  NodeRuntime.runMain
)
