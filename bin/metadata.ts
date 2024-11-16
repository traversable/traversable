import * as fs from "node:fs"
import * as path from "node:path"
import * as glob from "glob"

export interface Workspace {
  name: string
  dependencies: string[]
  version: string
}

export interface Repo {
  name: string
  scope: `@${string}`
  url: string
}

export type Graph = readonly Node[]

export interface Node {
  name: string
  order: number
  dependencies: readonly string[]
  version: string
}

export const defaults = {
  config: {
    generateExports: {
      include: [`*.ts`],
      exclude: [],
    },
    generateIndex: {
      include: [`*.ts`],
      exclude: [],
    },
  },
  concurrency: {
    concurrency: `inherit`,
    discard: true,
  },
} as const

export const GLOB = {
  AllPackages: `packages/*/`,
} as const

export const PATH = {
  RepoMetadata: path.join(path.resolve(), "__generated__", "repo.json"),
} as const

export const PACKAGES: string[] = glob.sync(GLOB.AllPackages)
export const GRAPH = [`.`, ...PACKAGES] as const

export const REPO 
  : Repo
  = globalThis.JSON.parse(fs.readFileSync(PATH.RepoMetadata).toString("utf8"))

export const SCOPE: `@traversable` = REPO.scope as never

export const BUILD_ARTIFACTS = [
  `.tsbuildinfo`,
  `dist`,
  `build`,
] as const

export const BUILD_DEPS = [
  `node_modules`,
] as const

export const EMOJI = {
  ERR: `٩◔̯◔۶`,
  HEY: `ʕ•̫͡•ʔ`,
  OOO: `°ﺑ°`,
  GUY: `٩(-̮̮̃-̃)۶`,
  FACTS: `٩(•̮̮̃•̃)۶`,
  WINK: `٩(-̮̮̃•̃)۶`,
  WHAT: `٩(●̮̮̃•̃)۶`,
  WAT: `٩(●̮̮̃●̃)۶`,
  WOW: `٩(ಥ_ಥ)۶`,
  WELL: `ಥ﹏ಥ`,
  YAY: `ლ(´ڡ\`ლ)`,
  FAK: `╯‵Д′)╯彡┻━┻`,
  HUH: `Σ(ﾟДﾟ )`,
  WHYY: `щ（ﾟДﾟщ）`,
  HUHH: `Σ (ﾟДﾟ;）`,
  WHYYY: `Σ(||ﾟДﾟ) `,
  O: `१|˚–˚|५`,
} as const

