#!/usr/bin/env pnpm dlx tsx
import * as FS from "node:fs"
import * as Path from "node:path"

import * as fs from "./fs.js"
import { Print, Transform, tap } from "./util.js"
import { PACKAGES } from "./metadata.js"

const ABSOLUTE_PATH = {
  RepoMetadata: Path.join(Path.resolve(), "__generated__"),
  RepoPackages: Path.join(Path.resolve(), "__generated__", "package-list.ts"),
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

/**
 * TODO:
 * - for each workspace, cache the most recent version number
 * - short-circuit if the version number hasn't changed since the previous run
 */
function main(): void {
  void Print(Print.task(`Writing workspace metadata...`))
  void Print()
  void Print(Print.task(`[bin/bump.ts] Writing changelogs to '${ABSOLUTE_PATH.RepoPackages}'`))
  void Print()
  void fs.mkdir(ABSOLUTE_PATH.RepoMetadata)
  void FS.writeFileSync(ABSOLUTE_PATH.RepoPackages, serialize(PACKAGES)) 
  void PACKAGES.forEach((pkg) => Print(`[bin/bump.ts] Writing \`${pkg.split(`/`)[1]}′ workspace metadata to:\n\t\t📁 ${pkg}`))
  void PACKAGES
    .map((pkg): [string, string] => [`${pkg}/${RELATIVE_PATH.PackageJson}`, `${pkg}/${RELATIVE_PATH.PackageFile}`])
    .map(([s, t]): [string, string] => (Print(`[bin/bump.ts] Writing \`${s.split(`/`)[1]}′ workspace metadata to:\n\t\t📁 ${t}`), [s, t]))
    .map((xs) => Transform.toMetadata(xs))
}

void main()
