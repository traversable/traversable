#!/usr/bin/env pnpm dlx tsx
import * as path from "node:path"
import * as fs from "./fs.js"
import { Print, Transform } from "./util.js"
import { PACKAGES } from "./metadata.js"
import { pipe } from "effect"

const ABSOLUTE_PATH = {
  RepoMetadata: path.join(path.resolve(), "__generated__"),
  RepoPackages: path.join(path.resolve(), "__generated__", "package-list.ts"),
}

const RELATIVE_PATH = {
  PackageFile: "src/__generated__/__manifest__.ts",
  PackageJson: "package.json",
} as const

const serialize = (packages: readonly string[]) => {
  return [
    `export const PACKAGES = [`,
    [...packages].map((pkg) => `\t"${pkg}"`).sort().join(",\n"),
    `] as const`,
    `export type PACKAGES = typeof PACKAGES`
  ].join("\n")
}

const writingMetadataLog = (s: string, t: string) => Print(
  `[bin/bump.ts] ${
    Print.strong(s.split(`/`)[1])
  } writing metadata to:\n\t\t📁 ${
    Print.with.underline(Print.hush(t))
  }`
)

/**
 * TODO:
 * - for each workspace, cache the most recent version number
 * - short-circuit if the version number hasn't changed since the previous run
 */
function main(): void {
  void Print.task(`[bin/bump.ts] Writing workspace metadata...`)
  void Print.task(`[bin/bump.ts] Writing changelogs to '${ABSOLUTE_PATH.RepoPackages}'`)
  void fs.mkdir(ABSOLUTE_PATH.RepoMetadata)
  void fs.writeFileSync(ABSOLUTE_PATH.RepoPackages, serialize(PACKAGES))
  void PACKAGES
    .sort()
    .map((pkg): [string, string] => [`${pkg}/${RELATIVE_PATH.PackageJson}`, `${pkg}/${RELATIVE_PATH.PackageFile}`])
    .map(([s, t]): [string, string] => (writingMetadataLog(s, t), [s, t]))
    .map((xs) => Transform.toMetadata(xs))
}

void main()
