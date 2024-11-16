import * as fs from "node:fs"
import * as Glob from "glob"

import type { any } from "any-ts"
import { flow } from "effect"
import { Transform } from "./util.js"
import { EMOJI } from "bin/metadata.js"

export * from "node:fs"

export namespace is {
  export const dir = (path: string) => fs.statSync(path).isDirectory()
  export const file = (path: string) => fs.statSync(path).isFile()
  export const link = (path: string) => fs.statSync(path).isSymbolicLink()
}

export namespace config {
  export namespace rmdir {
    export interface options extends fs.RmOptions {}
    export const defaults = { recursive: true, force: true } satisfies config.rmdir.options
  }
  export namespace mkdir {
    export interface options extends fs.MakeDirectoryOptions { recursive: true }
    export const defaults = { recursive: true, mode: 0o777 } satisfies config.mkdir.options
  }
  export namespace glob {
    export interface options extends Glob.GlobOptions {}
    export const defaults = {} satisfies config.glob.options
  }
  export namespace copy {
    export interface options extends fs.CopyOptions {}
    export const defaults = { recursive: true } satisfies config.copy.options
  }
}

export function mkdir<T extends string>(dirpath: T, options?: config.mkdir.options): void
/// impl.
export function mkdir<T extends string>(
  dirpath: T, { 
    recursive = config.mkdir.defaults.recursive, 
    mode = config.mkdir.defaults.mode, 
    ...options 
  }: config.mkdir.options = config.mkdir.defaults
): void {
  if (fs.existsSync(dirpath)) 
    if (is.dir(dirpath)) return void 0;
    else throw globalThis.Error(
      `${EMOJI.FRIENDLY_ERROR_GUY} < Error!\nDid not attempt to create a directory: The item at path '${
        dirpath
      }' exists, and is not a directory. `
    )
  else return void fs.mkdirSync(
    dirpath, 
    { ...options, mode, recursive }
  )
}

export function writeString(pathspec: string): (contents: string) => void
export function writeString(pathspec: string) {
  return (contents: string) => 
    void fs.writeFileSync(
      pathspec,
      contents,
    )
}

export function writeJson(pathspec: string): (json: any.json) => void 
export function writeJson(pathspec: string) {
  return flow(
    globalThis.JSON.stringify,
    Transform.prettify,
    writeString(pathspec),
  )
}

export function glob(
  pattern: string | any.array<string>,
  options: config.glob.options = config.glob.defaults,
): string[] | Glob.Path[] {
  return Glob.globSync(
    typeof pattern === "string" ? pattern : [...pattern], 
    options,
  )
}

export function rmdir(
  pathspec: string,
  options: config.rmdir.options = config.rmdir.defaults,
) { return fs.rmSync(pathspec, options) }

export function rmAndMkdir(pathspec: string) {
  void rmdir(pathspec, config.rmdir.defaults)
  void mkdir(pathspec)
}

export function copy(
  source: string,
  target: string,
  { recursive = config.copy.defaults.recursive }
    : config.copy.options 
    = config.copy.defaults
): void { 
  return void fs.cpSync(source, target, { recursive }) 
}

export function rmAndCopy(
  source: string,
  target: string,
): void {
  return void (
    rmdir(target, config.rmdir.defaults),
    copy(source, target)
  )
}
