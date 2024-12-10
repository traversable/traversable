import * as fs from "node:fs"
import * as path from "node:path"
import * as fc from "fast-check"
import * as tinybench from "tinybench"

type inline<T> = T

/**
 * ## {@link Pick `Pick`}
 *
 * "Eager" (as in evaluation) variant of {@link globalThis.Pick `globalThis.Pick`}.
 *
 * Like the built-in utility, this implementation is homomorphic (structure-preserving).
 */
type Pick<T, K extends keyof T> = never | { [P in K]: T[P] }
type OptionalKeys<T, K extends keyof T = keyof T> = K extends K
  ? {} extends globalThis.Pick<T, K>
    ? K
    : never
  : never
type OptionalPart<T, K extends OptionalKeys<T> = OptionalKeys<T>> = never | { [P in K]: T[P] }

export declare namespace bench {
  interface SharedOptions {
    name: string
    outdir: string
    benchmarks: readonly Benchmark[]
    footer?: readonly string[]
    generateHash?(): string
    reporter?(results: readonly bench.Result[]): string
    stringify?(json: unknown): string
    timestamp?(): string
  }

  interface Options extends SharedOptions, globalThis.Omit<tinybench.Options, "name"> {}

  interface Config extends globalThis.Required<SharedOptions>, globalThis.Omit<tinybench.Options, "name"> {}

  type Result = readonly (Record<string, string | number> | null)[]
  type Benchmark = readonly [name: string, impl: () => unknown]

  interface RootReporterDeps
    extends globalThis.Omit<bench.Config, "timestamp">,
      inline<{ timestamp: string }> {}
}

export namespace bench {
  export const defaultStringify = ((s) =>
    globalThis.JSON.stringify(s, null, 2)) satisfies bench.Config["stringify"]
  export const defaultTimestamp = (() =>
    new globalThis.Date().toISOString().substring(0, 19)) satisfies bench.Config["timestamp"]
  export const defaultGenerateHash = (() =>
    fc.sample(fc.uuid(), 1)[0].substring(0, 8)) satisfies bench.Config["generateHash"]
  export const defaultReporter = defaultStringify satisfies bench.Config["reporter"]
  export const defaultFooter = [] satisfies bench.Config["footer"]
  export const defaults = {
    footer: defaultFooter,
    generateHash: defaultGenerateHash,
    reporter: defaultReporter,
    stringify: defaultStringify,
    timestamp: defaultTimestamp,
  } satisfies OptionalPart<bench.SharedOptions>
  export function configFromOptions<T>({ outdir, benchmarks, ...opt }: bench.Options): Config {
    const def = bench.defaults
    return {
      name: "anonymous-benchmark",
      outdir,
      benchmarks,
      footer: opt.footer ?? def.footer,
      generateHash: opt.generateHash ?? def.generateHash,
      reporter: opt.reporter ?? def.reporter,
      stringify: opt.stringify ?? def.stringify,
      timestamp: opt.timestamp ?? def.timestamp,
    } satisfies bench.Config
  }
  export const rootReporter: (deps: bench.RootReporterDeps) => (report: string) => string =
    ({ timestamp, ...deps }) =>
    (report) => {
      const header = `/// Test run: ${timestamp} ///`
      const separator = "/".repeat(header.length)
      return [separator, header, separator, void 0, report, deps.footer.join("\n")].join("\n")
    }
  export function run(options: bench.Options): void
  export function run(_: bench.Options) {
    const deps = bench.configFromOptions(_)
    const Bench = new tinybench.Bench()
    const timestamp = deps.timestamp()
    const rootReporter = bench.rootReporter({ ...deps, timestamp })
    const hash = deps.generateHash()
    const filename = `${_.name}-${timestamp}-${hash}.txt`
    const effects = () => {
      const stat = fs.statSync(deps.outdir, { throwIfNoEntry: false })
      if (!stat) void fs.mkdirSync(deps.outdir, { recursive: true })
      void deps.benchmarks.forEach(([name, impl]) =>
        Bench.add(name, () => {
          impl()
        }),
      )
      void Bench.run().then(() => {
        const results = Bench.table()
        const contents = rootReporter(deps.stringify(results))
        void fs.writeFileSync(path.join(deps.outdir, filename), contents)
      })
    }
    void effects()
  }
}
