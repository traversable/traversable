import pkg from "./__generated__/__manifest__.js"
export const VERSION = `${pkg.name}@${pkg.version}` as const
export type VERSION = typeof VERSION
export type PKG_NAME = typeof PKG_NAME
export const PKG_NAME = pkg.name
export type SCOPE = typeof SCOPE
export const SCOPE: "@traversable" = pkg.name.split("/")[0] as "@traversable"
