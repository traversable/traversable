#!/usr/bin/env pnpm dlx tsx
import * as FS from "node:fs"
import * as Path from "node:path"
import { flow } from "effect"
import { apply, pipe } from "effect/Function"
import { Draw, Print, tap, topological } from "./util.js"

interface SideEffect { (): void }
interface Matcher {
  needle: string | globalThis.RegExp
  replacement: string
}

const README = `README.md`

const PATH = {
  ApiPackageOptionsSource: Path.join(Path.resolve(), "packages", "api", "src", "options.ts"),
  ApiPackageOptionsTarget: Path.join(Path.resolve(), "packages", "api", "options.d.ts"),
  RootReadme: Path.resolve(README),
} as const

const MARKER = {
  Start: `\`\`\`mermaid`,
  End: `\`\`\``,
} as const

const PKG_LIST = {
  Start: `<\!-- codegen:start -->`,
  End: `<\!-- codegen:end -->`,
} as const

const PATTERN = {
  NonWhitespace: `\\w`,
  DependencyGraph: `${MARKER.Start}([^]*?)${MARKER.End}`,
  PackageList: `${PKG_LIST.Start}([^]*?)${PKG_LIST.End}`,
  ChartReplacement: (chart: string) => `${MARKER.Start}\n${chart}\n${MARKER.End}`,
  ListReplacement: (list: string) => `${PKG_LIST.Start}\n${list}\n${PKG_LIST.End}`,
} as const

const REG_EXP = {
  NonWhitespace: new globalThis.RegExp(PATTERN.NonWhitespace, "g"),
  DependencyGraph: new globalThis.RegExp(PATTERN.DependencyGraph, `g`),
  PackageList: new globalThis.RegExp(PATTERN.PackageList, `g`),
} as const

const createChartMatcher
  : (chart: string) => Matcher
  = (chart) => ({
    needle: REG_EXP.DependencyGraph,
    replacement: PATTERN.ChartReplacement(chart),
  })

const createChangelogsMatcher
  : (list: string) => Matcher
  = (list) => ({
    needle: REG_EXP.PackageList,
    replacement: PATTERN.ListReplacement(list),
  })

const mapFile
  : (fn: (file: string) => string) => (filepath: string) => SideEffect
  = (fn) => (filepath) => () => pipe(
    FS.readFileSync(filepath).toString("utf8"),
    fn,
    (content) => FS.writeFileSync(filepath, content),
  )

const write
  : (m: Matcher) => (filepath: string) => SideEffect
  = (m) =>
    mapFile(file => file.replace(m.needle, m.replacement))

const writeChart: (chart: string) => SideEffect = flow(
  createChartMatcher,
  write,
  apply(PATH.RootReadme),
)

const writeChangelogs: (list: string) => SideEffect = flow(
  createChangelogsMatcher,
  write,
  apply(PATH.RootReadme),
)

/**
 * {@link writeToReadme `writeToReadme`} creates a text-based diagram of the
 * project's dependency graph and writes it to the root `README.md` file.
 *
 * The dependency graph it consumes looks something like this:
 *
 * ```
 * [
 *   { name: '@traversable/data', dependencies: [], order: 0 },
 *   { name: '@traversable/core', dependencies: ['@traversable/data'], order: 1 },
 *   { name: '@traversable/node', dependencies: ['@traversable/core', '@traversable/data'], order: 2 }
 * ]
 * ```
 *
 * which produces this diagram:
 *
 * ```
 * flowchart TD
 *     core(@traversable/core) --> data(@traversable/data)
 *     node(@traversable/node) --> core(@traversable/core)
 *     node(@traversable/node) --> data(@traversable/data)
 * ```
 *
 * The `README.md` file contains a block that looks like this:
 *
 * ```
 * ```mermaid
 * ```
 * ```
 *
 * The contents of that block (if any) will be replaced with the diagram.
 */
const writeChartToReadme: SideEffect = flow(
  topological,
  Draw.relation,
  tap(Print(Print.task(`[bin/docs.ts] Writing dependency graph to '${README}'`))),
  writeChart,
  apply(void 0),
)

const writeChangelogsToRootReadme: SideEffect = flow(
  topological,
  Draw.changelogLink,
  writeChangelogs,
  apply(void 0),
)

// const writeApiPackageOptionsType
//   : () => string[]
//   = () => pipe(
//     FS.readFileSync(PATH.ApiPackageOptionsSource).toString("utf8"),
//     (content) => content.split(/\/\/ <!-- codegen:.+ -->/g),
//   )

const main: SideEffect = () => {
  void writeChartToReadme()
  void writeChangelogsToRootReadme()
  // void writeApiPackageOptionsType()
}

void main()
