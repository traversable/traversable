import * as process from "node:child_process"
import * as path from "node:path"
import type { any, inline } from "any-ts"
import { flow, pipe } from "effect"

import * as fs from "bin/fs.js"
import { default as tsconfigBase } from "../tsconfig.base.json"
import { default as tsconfigBuild } from "../tsconfig.build.json"
import { default as tsconfigRoot } from "../tsconfig.json"
import { template } from "./assets/index.js"
import { Print, Transform } from "./util.js"

const $ = (command: string) => process.execSync(command, { stdio: "inherit" })

interface Paths { [x: string]: string[] }
interface HasPaths extends inline<{ paths: Paths }> { [x: string]: unknown }
interface HasCompilerOptions extends inline<{ compilerOptions: HasPaths }> { [x: string]: unknown }
interface HasPath extends inline<{ path: string }> { [x: string]: unknown }
interface HasReferences extends inline<{ references: HasPath[] }> { [x:string]: unknown }

type WorkspaceEnv = typeof WorkspaceEnv[keyof typeof WorkspaceEnv]
const WorkspaceEnv = {
  React: "react",
  Node: "node",
} as const

type Config = Required<Options>
type CleanupConfig = Required<CleanupOptions>

export interface CleanupOptions extends globalThis.Pick<Options, "pkgName" | "force"> {}
export interface Options { 
  pkgName: string, 
  description?: string,
  localDeps?: any.array<string>, 
  env?: WorkspaceEnv,
  force?: boolean
  debug?: boolean
  private?: boolean
}

export namespace Config {
  export const defaults
    : globalThis.Omit<Config, "pkgName"> 
    = { 
      env: WorkspaceEnv.Node, 
      localDeps: [],
      description: "",
      force: false, 
      debug: false,
      private: true,
    }

  const isNonEmptyString = <T extends string>(string: T): string is globalThis.Exclude<T, ""> => string.length > 0

  export const fromOptions 
    : (userProvided: Options) => Config
    = (userProvided) => ({
      ...defaults,
      ...userProvided,
      localDeps: 
      userProvided.localDeps === undefined ? [] 
      : userProvided.localDeps.filter(isNonEmptyString),
    })
}

const PATH = {
  packages: path.join(path.resolve(), "packages"),
  vitestSharedConfig: path.join(path.resolve(), "vitest.shared.ts"),
  workspace: (...segments: string[]) => 
    (_: CleanupConfig) => 
      path.join(PATH.packages, _.pkgName, ...segments),
  root: (...segments: string[]) => 
    (_: CleanupConfig) => 
      path.join(PATH.packages, _.pkgName, ...segments),
} as const

namespace tsconfig {
  export const root = tsconfigRoot
  export const base = tsconfigBase
  export const build = tsconfigBuild
}

namespace vitest {
  export const sharedConfig = fs.readFileSync(PATH.vitestSharedConfig).toString("utf8")
  export const nodeConfig = ([
    `import { defineConfig, mergeConfig } from "vitest/config"`,
    `import sharedConfig from "../../vitest.shared.js"`,
    ``,
    `const localConfig = defineConfig({})`,
    ``,
    `export default mergeConfig(sharedConfig, localConfig)`,
  ]).join("\n")
  export const reactConfig = ([
    `import react from "@vitejs/plugin-react"`,
    `import { defineConfig, mergeConfig } from "vitest/config"`,
    `import sharedConfig from "../../vitest.shared.js"`,
    ``,
    `export default mergeConfig(`,
    `  sharedConfig,`,
    `  defineConfig({`,
    `    plugins: [react()],`,
    `    test: {`,
    // `      environment: "jsdom",`,
    `      globals: false,`,
    `    },`,
    `  }),`,
    `)`,
  ]).join("\n")
  export const configMap = {
    react: vitest.reactConfig,
    node: vitest.nodeConfig,
  } as const
}

namespace sort {
  export const byPath = (
    { path: left }: HasPath, 
    { path: right }: HasPath
  ) => left > right ? 1 
    : right > left ? -1 
    : 0

  export const byKey = (
    [left]: [string, ...any], 
    [right]: [string, ...any]
  ) => left > right ? 1 
    : right > left ? -1 
    : 0
}

export const force
  : (_: CleanupConfig) => void
  = (_) => (_).force 
    ? fs.rmSync(path.join(PATH.packages, _.pkgName), { force: true, recursive: true }) 
    : void 0

namespace make {
  void (workspaceDir.cleanup = (_: CleanupConfig) => pipe(PATH.workspace()(_), fs.rmdirSync))
  export function workspaceDir(_: Config): void {
    return pipe(
      PATH.workspace()(_),
      fs.mkdir,
    )
  }

  void (workspaceSrcDir.cleanup = flow(PATH.workspace("src"), fs.rmdirSync))
  export function workspaceSrcDir(_: Config): void {
    return pipe(
      PATH.workspace("src")(_),
      fs.mkdir
    )
  }

  void (workspaceTestDir.cleanup = flow(PATH.workspace("test"), fs.rmdirSync))
  export function workspaceTestDir(_: Config): void {
    return pipe(
      PATH.workspace("test")(_),
      fs.mkdir,
    )
  }

  void (workspaceGeneratedDir.cleanup = flow(PATH.workspace("src", "__generated__"), fs.rmdirSync))
  export function workspaceGeneratedDir(_: Config): void {
    return pipe(
      PATH.workspace("src", "__generated__")(_),
      fs.mkdir,
    )
  }

  void (workspaceGeneratedManifest.cleanup = flow(PATH.workspace("src", "__generated__", "__manifest__.ts"), fs.rmSync))
  export function workspaceGeneratedManifest(_: Config): void { 
    return fs.writeFileSync(PATH.workspace("src", "__generated__", "__manifest__.ts")(_), "")
  }

  const filterReference = (tsconfig: HasReferences) => 
    (_: CleanupConfig) => tsconfig
      .references
      .filter((reference) => reference.path !== _.pkgName)

  void (
    rootReferences.invert = (tsconfig: HasReferences) => (_: CleanupConfig): HasReferences & any.json => ({
      ...tsconfig,
      references: filterReference(tsconfig)(_).sort(sort.byPath),
    }) as HasReferences & any.json
  )
  export function rootReferences(tsconfig: HasReferences): (_: CleanupConfig) => HasReferences & any.json
  export function rootReferences(tsconfig: HasReferences) {
    return (_: CleanupConfig) => ({ 
      ...tsconfig,
      references: filterReference(tsconfig)(_)
        .concat({ path: `packages/${_.pkgName}` })
        .sort(sort.byPath),
    })
  }

  const filterBasePath = (_: CleanupConfig) => (paths: Paths) => 
    globalThis.Object
      .entries(paths)
      .filter(([k]) => k !== _.pkgName)

  void (
    rootBasePaths.invert = (tsconfig: HasCompilerOptions) => (_: CleanupConfig) => ({
      ...tsconfig,
      compilerOptions: {
        ...tsconfig.compilerOptions,
        paths: pipe(
          tsconfig.compilerOptions.paths,
          filterBasePath(_),
          (xs) => xs.sort(sort.byKey),
          globalThis.Object.fromEntries,
        )
      }
    })
  )
  export function rootBasePaths(tsconfig: HasCompilerOptions) {
    return (_: CleanupConfig) => ({ 
      ...tsconfig,
      compilerOptions: {
        ...tsconfig.compilerOptions,
        paths: pipe(
          tsconfig.compilerOptions.paths,
          filterBasePath(_),
          (xs) => [...xs, [`@traversable/${_.pkgName}`, [`packages/${_.pkgName}/src/index.js`]] as [string, string[]]],
          (xs) => [...xs, [`@traversable/${_.pkgName}/*`, [`packages/${_.pkgName}/src/*.js`]] as [string, string[]]],
          (xs) => xs.sort(sort.byKey),
          globalThis.Object.fromEntries
        )
      }
    })
  }

  export const rootVitestConfig = (_: string) => vitest.sharedConfig
  // export const rootRefs = make.rootReferences(tsconfig.root)
  // export const rootBuildRefs = make.rootReferences(tsconfig.build)

  /////////////////
  /// WORKSPACE
  export const tsConfigRef = (dep: string) => ({ path: `../${dep}` } as const)
  export const localDep = (dep: string) => ([`@traversable/${dep}`, "workspace:^" ] as const)
  export const workspaceReadme = (pkgName: string) => `# @traversable/${pkgName}`

  export function workspacePackageJson(_: Config): typeof template {
    const pkg = globalThis.structuredClone(template)
    const devDependencies = 
      _.localDeps.length === 0 
        ? pkg.devDependencies 
        : globalThis.Object.fromEntries(_.localDeps.map(make.localDep))
    const peerDependencies = devDependencies
    return {
      ...pkg,
      name: pkg.name.concat(_.pkgName),
      private: _.private,
      description: _.description,
      repository: {
        ...pkg.repository,
        directory: pkg.repository.directory.concat(_.pkgName),
      },
      devDependencies: pipe(
        pkg.devDependencies,
        globalThis.Object.entries,
        (xs) => [...xs, devDependencies] as [string, string][],
        (xs) => xs.sort(sort.byKey),
        globalThis.Object.fromEntries,
      ),
      peerDependencies: pipe(
        pkg.peerDependencies,
        globalThis.Object.entries,
        (xs) => [...xs, peerDependencies] as [string, string][],
        (xs) => xs.sort(sort.byKey),
        globalThis.Object.fromEntries,
      )
    }
  } 

  export const workspaceVitestConfig = (_: Config) => vitest.configMap[_.env]

  export const workspaceTSConfigBuild 
    = (_: Config) => ({
      extends: "./tsconfig.src.json",
      compilerOptions: {
        tsBuildInfoFile: ".tsbuildinfo/build.tsbuildinfo",
        types: ["node"],
        declarationDir: "build/dts",
        outDir: "build/esm",
        stripInternal: true,
      },
      references: _.localDeps.map(make.tsConfigRef),
    })

  export const workspaceTSConfig = () => `{
    "extends": "../../tsconfig.base.json",
    "references": [
      { "path": "tsconfig.src.json" }, 
      { "path": "tsconfig.test.json" }
    ],
    "include": []
  }` as const

  export const workspaceTSConfigSrc = (_: Config) => ({
    extends: "../../tsconfig.base.json",
    compilerOptions: {
      tsBuildInfoFile: ".tsbuildinfo/src.tsbuildinfo",
      rootDir: "src",
      types: ["node"],
      outDir: "build/src"
    },
    references: _.localDeps.map(make.tsConfigRef),
    include: ["src"]
  })

  export const workspaceTSConfigTest = (_: Config) => ({
    extends: "../../tsconfig.base.json",
    compilerOptions: {
      tsBuildInfoFile: ".tsbuildinfo/test.tsbuildinfo",
      rootDir: "test",
      types: ["node"],
      // types: ["node", "vitest/jsdom"],
      noEmit: true,
    },
    references: [
      { path: "tsconfig.src.json" }, 
      ..._.localDeps.map(make.tsConfigRef),
    ],
    include: ["test"],
  })

  export const workspaceIndex = ([
    'export * from "./version.js"',
  ]).join("\n")

  export const workspaceVersionSrc = ([
    'import Package from "./__generated__/__manifest__.js"',
    'export const VERSION = `${Package.name}@${Package.version}` as const',
    'export type VERSION = typeof VERSION',
  ]).join("\n")

  export const workspaceVersionTest = (_: Config) => ([
    `import * as ${Transform.toCamelCase(_.pkgName)} from "@traversable/${_.pkgName}"`,
    'import * as vi from "vitest"',
    'import Manifest from "../package.json"',
    '',
    `vi.describe("${_.pkgName}", () => {`,
    `  vi.it("${_.pkgName}.VERSION", () => {`,
    '    const expected = `${Manifest.name}@${Manifest.version}`',
    `    vi.assert.equal(${Transform.toCamelCase(_.pkgName)}.VERSION, expected)`,
    '  })',
    '})',
  ]).join("\n")
}

namespace write {
  const rootRefsPath = [path.resolve(), "tsconfig.json"] as const
  void (
    rootRefs.cleanup = flow(
      make.rootReferences.invert(tsconfig.root),
      fs.writeJson(path.join(...rootRefsPath)),
    )
  )
  export function rootRefs(_: CleanupConfig): void {
    return pipe(
      make.rootReferences(tsconfig.root)(_),
      fs.writeJson(path.join(...rootRefsPath)),
    )
  }

  const rootBuildRefsPath = [path.resolve(), "tsconfig.build.json"] as const
  // TODO: vvv
  // void (
  //   rootBuildRefs.cleanup = (_: Config) => {
  //     // TODO: do I need to undo the logic below?
  //     make.rootReferences.invert(tsconfig.build)(_)
  //   }
  // )
  export function rootBuildRefs(_: CleanupConfig) {
    return pipe(
      // TODO: do I need to undo this logic? if so, what's the best way to do it?
      ({ ..._, pkgName: _.pkgName.concat("/tsconfig.build.json") }),
      make.rootReferences(tsconfig.build),
      fs.writeJson(path.join(...rootBuildRefsPath)),
    )
  }

  const rootBaseRefsPath = [path.resolve(), "tsconfig.base.json"] as const
  void (
    rootBaseRefs.cleanup = flow(
      make.rootBasePaths.invert(tsconfig.base),
      Transform.prettify,
      fs.writeString(path.join(...rootBaseRefsPath)),
    )
  )
  export function rootBaseRefs(_: CleanupConfig): void {
    return pipe(
      make.rootBasePaths(tsconfig.base)(_),
      Transform.prettify,
      fs.writeString(path.join(...rootBaseRefsPath)),
    )
  }

  const workspacePackageJsonPath = (_: CleanupConfig) => [PATH.packages, _.pkgName, "package.json"] as const
  void (workspacePackageJson.cleanup = (_: CleanupConfig) => fs.rmSync(path.join(...workspacePackageJsonPath(_))))
  export function workspacePackageJson(_: Config): void {
    return pipe(
      make.workspacePackageJson(_),
      fs.writeJson(path.join(...workspacePackageJsonPath(_))),
    )
  }
  
  const workspaceVitestConfigPath = (_: CleanupConfig) => [PATH.packages, _.pkgName, "package.json"] as const
  void (workspaceVitestConfig.cleanup = (_: CleanupConfig) => fs.rmSync(path.join(...workspaceVitestConfigPath(_))))
  export function workspaceVitestConfig(_: Config): void {
    return pipe(
      make.workspaceVitestConfig(_),
      fs.writeString(path.join(...workspaceVitestConfigPath(_))),
    )
  }

  const workspaceIndexPath = (_: CleanupConfig) => [PATH.packages, _.pkgName, "src", "index.ts"] as const
  void (workspaceIndex.cleanup = (_: CleanupConfig) => fs.rmSync(path.join(...workspaceIndexPath(_))))
  export function workspaceIndex(_: CleanupConfig): void {
    return fs.writeFileSync(
      path.join(...workspaceIndexPath(_)),
      make.workspaceIndex,
    )
  }

  const workspaceReadmePath = (_: CleanupConfig) => [PATH.packages, _.pkgName, "README.md"] as const
  void (workspaceReadme.cleanup = (_: CleanupConfig) => fs.rmSync(path.join(...workspaceReadmePath(_))))
  export function workspaceReadme(_: CleanupConfig): void {
    return pipe(
      make.workspaceReadme(_.pkgName),
      fs.writeString(path.join(...workspaceReadmePath(_)))
    )
  }

  const workspaceVersionsSrcPath = (_: CleanupConfig) => [PATH.packages, _.pkgName, "src", "version.ts"] as const
  void (workspaceVersionSrc.cleanup = (_: CleanupConfig) => fs.rmSync(path.join(...workspaceVersionsSrcPath(_))))
  export function workspaceVersionSrc(_: CleanupConfig): void {
    return pipe(
      make.workspaceVersionSrc,
      fs.writeString(path.join(...workspaceReadmePath(_)))
    )
  }

  const workspaceVersionTestPath = (_: CleanupConfig) => [PATH.packages, _.pkgName, "test", "version.test.ts"] as const
  void (workspaceVersionTest.cleanup = (_: CleanupConfig) => fs.rmSync(path.join(...workspaceVersionTestPath(_))))
  export function workspaceVersionTest(_: Config): void {
    return pipe(
      make.workspaceVersionTest(_),
      fs.writeString(path.join(...workspaceVersionTestPath(_))),
    )
  }

  const workspaceTSConfigPath = (_: CleanupConfig) => [PATH.packages, _.pkgName, "tsconfig.json"] as const
  void (workspaceTSConfig.cleanup = (_: CleanupConfig) => fs.rmSync(path.join(...workspaceTSConfigPath(_))))
  export function workspaceTSConfig(_: CleanupConfig): void {
    return pipe(
      make.workspaceTSConfig(),
      fs.writeString(path.join(...workspaceTSConfigPath(_)))
    )
  }

  const workspaceTSConfigBuildPath = (_: CleanupConfig) => [PATH.packages, _.pkgName, "tsconfig.build.json"] as const
  void (workspaceTSConfigBuild.cleanup = (_: CleanupConfig) => fs.rmSync(path.join(...workspaceTSConfigBuildPath(_))))
  export function workspaceTSConfigBuild(_: Config): void {
    return pipe(
      make.workspaceTSConfigBuild(_),
      fs.writeJson(path.join(...workspaceTSConfigBuildPath(_))),
    )
  }

  const workspaceTSConfigSrcPath = (_: CleanupConfig) => [PATH.packages, _.pkgName, "tsconfig.src.json"] as const
  void (workspaceTSConfigSrc.cleanup = (_: CleanupConfig) => fs.rmSync(path.join(...workspaceTSConfigSrcPath(_))))
  export function workspaceTSConfigSrc(_: Config): void {
    return pipe(
      make.workspaceTSConfigSrc(_),
      fs.writeJson(path.join(...workspaceTSConfigSrcPath(_))),
    )
  }

  const workspaceTSConfigTestPath = (_: CleanupConfig) => [PATH.packages, _.pkgName, "tsconfig.test.json"] as const
  void (workspaceTSConfigTest.cleanup = (_: CleanupConfig) => fs.rmSync(path.join(...workspaceTSConfigTestPath(_))))
  export function workspaceTSConfigTest(_: Config): void {
    return pipe(
      make.workspaceTSConfigTest(_),
      fs.writeJson(path.join(...workspaceTSConfigTestPath(_))),
    )
  }
}

export function main(opts: Options) {
  const _ = Config.fromOptions(opts)
  const rootTasks = () => [
    write.rootRefs(_),
    write.rootBaseRefs(_),
    write.rootBuildRefs(_),
  ]

  const workspaceTasks = () => [
    force(_),
    make.workspaceDir(_),
    make.workspaceSrcDir(_),
    make.workspaceTestDir(_),
    make.workspaceGeneratedDir(_),
    make.workspaceGeneratedManifest(_),
    write.workspacePackageJson(_),
    write.workspaceIndex(_),
    write.workspaceVitestConfig(_),
    write.workspaceReadme(_),
    write.workspaceVersionSrc(_),
    write.workspaceVersionTest(_),
    write.workspaceTSConfig(_),
    write.workspaceTSConfigBuild(_),
    write.workspaceTSConfigSrc(_),
    write.workspaceTSConfigTest(_),
  ]

  void rootTasks()
  void workspaceTasks()
  void $(`pnpm dlx tsx ./bin/bump.ts`)
  void $(`pnpm reboot`)
  void Print(Print.task(`Workspace '${
    _.pkgName
  }' created at 'packages/${
    _.pkgName
  }'`))
}

main.cleanup = (opts: Options) => {
  const _ = Config.fromOptions(opts)
  const rootCleanup = () => [
    write.rootRefs.cleanup(_),
    write.rootBaseRefs.cleanup(_),
    // TODO: turn this on when other TODO above is resolved
    // write.rootBuildRefs.cleanup(_),
  ]

  // const workspaceCleanup = force(_)
  const workspaceCleanup = () => [
    make.workspaceDir.cleanup(_),
    make.workspaceSrcDir.cleanup(_),
    make.workspaceTestDir.cleanup(_),
    make.workspaceGeneratedDir.cleanup(_),
    make.workspaceGeneratedManifest.cleanup(_),
    write.workspacePackageJson.cleanup(_),
    write.workspaceIndex.cleanup(_),
    write.workspaceVitestConfig.cleanup(_),
    write.workspaceReadme.cleanup(_),
    write.workspaceVersionSrc.cleanup(_),
    write.workspaceVersionTest.cleanup(_),
    write.workspaceTSConfig.cleanup(_),
    write.workspaceTSConfigBuild.cleanup(_),
    write.workspaceTSConfigSrc.cleanup(_),
    write.workspaceTSConfigTest.cleanup(_),
  ]

  void rootCleanup()
  void workspaceCleanup()

  void Print(Print.task(`Workspace '${
    _.pkgName
  }' cleaned up from 'packages/${
    _.pkgName
  }'`))

  void $(`pnpm reboot`)
}

