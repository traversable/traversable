#!/usr/bin/env pnpm dlx tsx
import { identity, pipe } from "effect"
import { $ } from "./process.js"

import { Print } from "./util.js"

type ShellCommand = readonly [name: string, $: () => void]
type ShellCommands = readonly ShellCommand[]

export const inputs = [
  ["clean", "pnpm run clean"],
  ["install", "pnpm i"],
  ["check", "pnpm run check"],
  ["test", "pnpm run test"],
  ["describe", "pnpm run describe"],
  ["bench", "pnpm run bench"],
  ["build", "pnpm run build"],
  ["build_dist", "pnpm run build:dist"],
] as const satisfies [name: string, stdio: string][]

const logCommand 
  : (cmd: ShellCommand) => ShellCommand
  = ([name, run]: ShellCommand) => [
    name,
    () => (
      void Print.task(`${Print.hush("Running")} ${Print.with.bold(name)}`), 
      void run()
    )
  ]

const timeCommand 
  : (cmd: ShellCommand) => ShellCommand
  = ([name, run]: ShellCommand) => [
    name,
    () => (
      void globalThis.console.time(Print.hush(name)),
      // void globalThis.console.timeLog(Print.hush(name)),
      void run(),
      void globalThis.console.timeLog(Print.hush(name)),
      void globalThis.console.timeEnd(Print.hush(name))
    )
  ]

const withLogging 
  : (cmds: ShellCommands) => ShellCommands
  = (cmds) => cmds.map(logCommand)

const withTiming
  : (cmds: ShellCommands) => ShellCommands
  = (cmds) => cmds.map(timeCommand)
  
const commands = inputs.map(
  ([name, stdio]) => [name, () => $(stdio)]
) satisfies ShellCommands

function main(commands: ShellCommands, logExecutionTime: boolean = true): void {
  return pipe(
    commands,
    withLogging,
    logExecutionTime ? withTiming : identity,
    (cmds) => cmds.forEach(([, run]) => run()),
  )
}

void main(commands)
