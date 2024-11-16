import * as process from "node:child_process"
import * as Path from "node:path"
import type { any } from "any-ts"
import { flow, pipe } from "effect"

import * as fs from "bin/fs.js"
import { default as tsconfigBase } from "../tsconfig.base.json"
import { default as tsconfigBuild } from "../tsconfig.build.json"
import { default as tsconfigRoot } from "../tsconfig.json"
import { template } from "./assets/index.js"
import { Print, Transform } from "./util.js"

const $ = (command: string) => process.execSync(command, { stdio: "inherit" })

interface HasPath { path: string }
type HasReferences = { 
  references: any.array<{ path: string }> 
}

type WorkspaceEnv = typeof WorkspaceEnv[keyof typeof WorkspaceEnv]
const WorkspaceEnv = {
  React: "react",
  Node: "node",
} as const

type Config = { [K in keyof Options]-?: Exclude<Options[K], undefined> }

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
  packages: Path.join(Path.resolve(), "packages"),
  vitestSharedConfig: Path.join(Path.resolve(), "vitest.shared.ts"),
  workspace: (...segments: any.array<string>) => 
    (_: Config) => 
      Path.join(PATH.packages, _.pkgName, ...segments),
  root: (...segments: any.array<string>) => 
    (_: Config) => 
      Path.join(PATH.packages, _.pkgName, ...segments),
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
    `      environment: "jsdom",`,
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
    [left]: [string, string[]], 
    [right]: [string, string[]]
  ) => left > right ? 1 
    : right > left ? -1 
    : 0
}

export const force
  : (_: Config) => void
  = (_) => (_).force 
    ? fs.rmSync(Path.join(PATH.packages, _.pkgName), { force: true, recursive: true }) 
    : void 0

namespace make {
  export const workspaceDir
    : (_: Config) => void
    = flow(
      PATH.workspace(),
      fs.mkdir,
    )

  export const workspaceSrcDir 
    : (_: Config) => void
    = flow(
      PATH.workspace("src"),
      fs.mkdir,
    )

  export const workspaceTestDir
    : (_: Config) => void
    = flow(
      PATH.workspace("test"),
      fs.mkdir
    )

  export const workspaceGeneratedDir
    : (_: Config) => void
    = flow(
      PATH.workspace("src", "__generated__"),
      fs.mkdir,
    )

  export const workspaceGeneratedManifest
    : (_: Config) => void
    = (_) => fs.writeFileSync(PATH.workspace("src", "__generated__", "__manifest__.ts")(_), "")

  const alreadyHasReference
    : (refs: HasReferences["references"], next: string) => boolean 
    = (refs, next) => refs.some(({ path: prev }) => prev === `packages/${next}` )

  export const rootReferences 
    : (tsconfig: HasReferences) => (_: Config) => HasReferences
    = (tsconfig) => (_) => ({ 
      ...tsconfig,
      references: alreadyHasReference(tsconfig.references, _.pkgName) 
        ? tsconfig.references 
        : ([
          ...tsconfig.references, 
          { path: `packages/${_.pkgName}` },
        ])
        .sort(sort.byPath)
    })

  export const rootBasePaths = (_: Config) => ({
    ...tsconfig.base,
    compilerOptions: {
      ...tsconfig.base.compilerOptions,
      paths: globalThis.Object.fromEntries(
        globalThis.Object.entries({
          ...tsconfig.base.compilerOptions.paths,
          [`@traversable/${_.pkgName}`]: [`packages/${_.pkgName}/src/index.js`],
          [`@traversable/${_.pkgName}/*`]: [`packages/${_.pkgName}/src/*.js`]
        })
        .sort(sort.byKey)
      )
    }
  })

  export const rootVitestConfig = (_: string) => vitest.sharedConfig
  export const rootRefs = make.rootReferences(tsconfig.root)
  export const rootBuildRefs = make.rootReferences(tsconfig.build)

  /////////////////
  /// WORKSPACE
  export const tsConfigRef = (dep: string) => ({ path: `../${dep}` } as const)
  export const localDep = (dep: string) => ([`@traversable/${dep}`, "workspace:^" ] as const)
  export const workspaceReadme = (pkgName: string) => `# @traversable/${pkgName}`

  export const workspacePackageJson 
    : (_: Config) => typeof template
    = (_) => {
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
        devDependencies: {
          ...pkg.devDependencies,
          ...devDependencies,
        },
        peerDependencies: {
          ...pkg.peerDependencies,
          ...peerDependencies,
        }
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
      types: ["node", "vitest/jsdom"],
      noEmit: true,
    },
    references: [
      { path: "tsconfig.src.json" }, 
      ..._.localDeps.map(make.tsConfigRef),
    ],
    include: ["test"],
  })

  export const workspaceIndex = ([
    'export {',
    '  VERSION,',
    '} from "./version.js"',
  ]).join("\n")

  export const workspaceVersionSrc = ([
    'import Package from "./__generated__/__manifest__.js"',
    'export const VERSION = `${Package.name}@${Package.version}` as const',
    '//           ^?',
    'export type VERSION = typeof VERSION',
    '//           ^?',
  ]).join("\n")

  export const workspaceVersionTest = (_: Config) => ([
    `import * as ${Transform.toCamelCase(_.pkgName)} from "@traversable/${_.pkgName}"`,
    'import { assert, describe, it } from "vitest"',
    'import Manifest from "../package.json"',
    '',
    `describe("${_.pkgName}", () => {`,
    `  it("${_.pkgName}.VERSION", () => {`,
    '    const expected = `${Manifest.name}@${Manifest.version}`',
    `    assert.equal(${Transform.toCamelCase(_.pkgName)}.VERSION, expected)`,
    '  })',
    '})',
  ]).join("\n")
}

namespace write {
  export const rootRefs
    : (_: Config) => void
    = (_) => pipe(
      make.rootRefs(_),
      fs.writeJson(Path.join(Path.resolve(), "tsconfig.json")),
    )

  export const rootBuildRefs
    : (_: Config) => void
    = (_) => pipe(
      ({ ..._, pkgName: _.pkgName.concat("/tsconfig.build.json") }),
      make.rootBuildRefs,
      fs.writeJson(Path.join(Path.resolve(), "tsconfig.build.json")),
    )

  export const rootBaseRefs
    : (_: Config) => void
    = flow(
      make.rootBasePaths,
      Transform.prettify,
      fs.writeString(Path.join(Path.resolve(), "tsconfig.base.json")),
    )

  export const workspacePackageJson
    : (_: Config) => void
    = (_) => pipe(
      make.workspacePackageJson(_),
      fs.writeJson(Path.join(PATH.packages, _.pkgName, "package.json")),
    )
  
  export const workspaceVitestConfig 
    : (_: Config) => void
    = (_) => pipe(
      make.workspaceVitestConfig(_),
      fs.writeString(Path.join(PATH.packages, _.pkgName, "vitest.config.ts")),
    )

  export const workspaceIndex
    : (_: Config) => void
    = (_) => fs.writeFileSync(
      Path.join(PATH.packages, _.pkgName, "src", "index.ts"),
      make.workspaceIndex,
    )

  export const workspaceReadme 
    : (_: Config) => void
    = (_) => pipe(
      make.workspaceReadme(_.pkgName),
      fs.writeString(Path.join(PATH.packages, _.pkgName, "README.md"))
    )

  export const workspaceVersionSrc
    : (_: Config) => void
    = (_) => pipe(
      make.workspaceVersionSrc,
      fs.writeString(Path.join(PATH.packages, _.pkgName, "src", "version.ts"))
    )

  export const workspaceVersionTest 
    : (_: Config) => void
    = (_) => pipe(
      make.workspaceVersionTest(_),
      fs.writeString(Path.join(PATH.packages, _.pkgName, "test", "version.test.ts")),
    )

  export const workspaceTSConfig 
    : (_: Config) => void
    = (_) => pipe(
      make.workspaceTSConfig(),
      fs.writeString(Path.join(PATH.packages, _.pkgName, "tsconfig.json"))
    )

  export const workspaceTSConfigBuild
    : (_: Config) => void
    = (_) => pipe(
      make.workspaceTSConfigBuild(_),
      fs.writeJson(Path.join(PATH.packages, _.pkgName, "tsconfig.build.json")),
    )

  export const workspaceTSConfigSrc
    : (_: Config) => void
    = (_) => pipe(
      make.workspaceTSConfigSrc(_),
      fs.writeJson(Path.join(PATH.packages, _.pkgName, "tsconfig.src.json")),
    )

  export const workspaceTSConfigTest
    : (_: Config) => void
    = (_) => pipe(
      make.workspaceTSConfigTest(_),
      fs.writeJson(Path.join(PATH.packages, _.pkgName, "tsconfig.test.json")),
    )
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
