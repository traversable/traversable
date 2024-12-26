import { execSync as $ } from "node:child_process"
import * as fs from "node:fs"

interface Options {
  benchDir: string
  buildTable?(filepath: string): Table
  exclude?: string[]
}

interface Config extends globalThis.Required<Options> {}

interface Benchmark {
  filename: string
  path: string
}

interface Table {
  HEAD: string
  EXEC: string
  DONE: string
  SUMM: (duration: bigint) => string
  FOOT: string
}

const log = globalThis.console.info.bind(globalThis.console)
const inMs = (start: bigint, end: bigint) => (end - start) / 1_000_000n
const getSummaryPadding = (path: string) => (duration: bigint) =>
  `${duration} milliseconds ${" ".repeat(
    path.length - (duration.toString().length + " milliseconds ".length),
  )}`

export const buildTable = (path: string): Table => {
  const getSummary = getSummaryPadding(path)
  const pad = path.length
  return {
    HEAD: `┌────┬────────────────────┬─${"─".repeat(pad)}─┐`,
    EXEC: `│ ⏳ │ Running benchmark  │ ${path} │`,
    DONE: `│ 🧪 │ Benchmark complete │ ${path} │`,
    SUMM: (duration: bigint) => `│ ⌛️ │ Benchmark duration │ ${getSummary(duration)} │`,
    FOOT: `└────┴────────────────────┴─${"─".repeat(pad)}─┘`,
  } as const satisfies Table
}

const init: (table: Table) => void = (table) => {
  void log()
  void log(table.HEAD)
  void log(table.EXEC)
}

const cleanup: (table: Table, duration: readonly [start: bigint, end: bigint]) => void = (
  table,
  [start, end],
) => {
  void log(table.DONE)
  void log(table.SUMM(inMs(start, end)))
  void log(table.FOOT)
  void log()
}

const createSuite: (bs: readonly Benchmark[], buildTable: (filepath: string) => Table) => () => void =
  (bs) => () =>
    bs.forEach((b) => {
      const EXECUTE = () => void $(`pnpm dlx tsx ./bench/${b.filename}`)
      const path = `data/bench/${b.filename}`
      const Table = buildTable(path)

      void init(Table)
      const START = process.hrtime.bigint()
      void EXECUTE()
      const END = process.hrtime.bigint()
      void cleanup(Table, [START, END])
    })

export const run: (options: Options) => () => void = (options) => () => {
  const config = {
    benchDir: options.benchDir,
    buildTable: options.buildTable ?? buildTable,
    exclude: options.exclude ?? ["index.ts"],
  } satisfies Config
  const benchmarks = fs
    .readdirSync(config.benchDir, { withFileTypes: true })
    .filter((dirent) => dirent.isFile() && !config.exclude.includes(dirent.name))
    .map((dirent) => ({ filename: dirent.name, path: dirent.parentPath }))
  const suite = createSuite(benchmarks, config.buildTable)

  void suite()
}
