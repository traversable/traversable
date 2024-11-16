#!/usr/bin/env pnpm dlx tsx
import * as FS from "node:fs"
import * as Path from "node:path"
import { Array as array, flow, pipe } from "effect"

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

const logWriteTask = (target: string) =>
  Print(`[bin/bump.ts] Writing \`${target.split(`/`)[1]}\` workspace metadata to:\n\t\t📁 ${target}`)

const logWritePackagesTask = () =>
  Print(Print.task(`[bin/bump.ts] Writing changelogs to '${ABSOLUTE_PATH.RepoPackages}'`))

/**
 * TODO:
 * - for each workspace, cache the most recent version number
 * - short-circuit if the version number hasn't changed since the previous run
 */
function main(): void {
  return void pipe(
    PACKAGES,
    tap(() => Print(Print.task(`Writing workspace metadata...`))),
    tap(() => Print()),
    tap(() => logWritePackagesTask()),
    tap(() => Print()),
    tap(() => fs.mkdir(ABSOLUTE_PATH.RepoMetadata)),
    tap((pkgs) => FS.writeFileSync(
      ABSOLUTE_PATH.RepoPackages, 
      `export const PACKAGES = `
      .concat(globalThis.JSON.stringify([...pkgs].sort(), null, 2)
      .concat(` as const; \nexport type PACKAGES = typeof PACKAGES;`)) 
    )),
    array.map(
      flow(
        pkg => [
          `${pkg}/${RELATIVE_PATH.PackageJson}`,
          `${pkg}/${RELATIVE_PATH.PackageFile}`,
        ] as const,
        tap(([, target]) => logWriteTask(target)),
        tap(Transform.toMetadata),
      ),
    ),
    tap(() => Print()),
  )
}

main()
