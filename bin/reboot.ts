#!/usr/bin/env pnpm dlx tsx
import { $, shell } from "./process.js"

import { Print } from "./util.js"

export const CMD = {
  clean: `pnpm run clean`,
  install: `pnpm install`,
  check: `pnpm run check`,
  test: `pnpm run test`,
  describe: `pnpm run describe`,
  bench: `pnpm run bench`,
  build: `pnpm run build`,
  build_dist: `pnpm run build:dist`,
} as const

function timeScript(scriptName: keyof typeof CMD) {
  return (
    void globalThis.console.time(Print.hush(CMD[scriptName])),
    void globalThis.console.timeLog(Print.hush(CMD[scriptName])),
    void $(CMD[scriptName]),
    void globalThis.console.timeLog(Print.hush(CMD[scriptName])),
    void globalThis.console.timeEnd(Print.hush(CMD[scriptName]))
  )
}

function main(time?: boolean): void {
  if (time) return timeMain()
  else return (
    void $(CMD.clean),
    void $(CMD.install),
    void $(CMD.build),
    void $(CMD.check),
    void $(CMD.test),
    void $(CMD.describe),
    void $(CMD.build_dist),
    void $(CMD.bench)
  )
}

function timeMain(): void {
  return (
    void timeScript("clean"),
    void timeScript("install"),
    void timeScript("build"),
    void timeScript("check"),
    void timeScript("test"),
    void timeScript("describe"),
    void timeScript("build_dist"),
    void timeScript("bench")
  )
}

void timeMain()
