#!/usr/bin/env pnpm dlx tsx
import { flow, identity, pipe } from "effect"
import { $ } from "./process.js"
import type { ShellCommand, ShellCommands } from "./types.js"
import { Print } from "./util.js"

export const stdins = [
  ["clean", "pnpm run clean"],
  ["install", "pnpm i"],
  ["check", "pnpm run check"],
  ["test", "pnpm run test"],
  ["describe", "pnpm run describe"],
  ["bench", "pnpm run bench"],
  ["build", "pnpm run build"],
  ["build_dist", "pnpm run build:dist"],
] as const satisfies [name: string, stdio: string][]

const logExec 
  : (cmd: ShellCommand) => ShellCommand
  = ([name, run]: ShellCommand) => [
    name,
    () => (
      void Print.task(`${Print.hush("Running")} ${Print.with.bold(name)}`), 
      void run()
    )
  ]

const time
  : (logName: string, run: () => void) => () => void
  = (logName: string, run) => 
    () => (
      void globalThis.console.time(Print.hush(logName)),
      void run(),
      void globalThis.console.timeLog(Print.hush(logName)),
      void globalThis.console.timeEnd(Print.hush(logName))
    )

const timeCmd 
  : (cmd: ShellCommand) => ShellCommand
  = ([name, run]) => [name, time(name, run)]

const withLog
  : (cmds: ShellCommands) => ShellCommands
  = (cmds) => cmds.map(logExec)

const withTime
  : (cmds: ShellCommands) => ShellCommands
  = (cmds) => cmds.map(timeCmd)
  
const commands = stdins.map(
  ([name, stdin]) => [name, () => $(stdin)]
) satisfies ShellCommands

function reboot(commands: ShellCommands): void {
  return void pipe(
    commands,
    withLog,
    withTime,
    (cmds) => cmds.map(
      flow(
        ([, run]) => run,
        (run) => run()
      )
    ),
  )
}

const main = reboot

void main(commands)
