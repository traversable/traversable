import * as path from "node:path"
import { defineConfig } from "vitest/config"
import { PACKAGES } from "./__generated__/package-list"
import { default as REPO } from "./__generated__/repo.json"

function createAlias(pkgName: string) {
  return {
    [`${REPO.scope}/${pkgName}/test`]: path.join(__dirname, "packages", pkgName, "test"),
    [`${REPO.scope}/${pkgName}`]: path.join(__dirname, "packages", pkgName, "src"),
  }
}

export default defineConfig({
  esbuild: {
    target: "es2020",
  },
  test: {
    alias: PACKAGES
      .map(v => v.slice("packages/".length))
      .map(createAlias)
      .reduce((acc, cur) => ({ ...acc, ...cur }), {}),
    fakeTimers: { toFake: undefined },
    printConsoleTrace: true,
    sequence: { concurrent: true },
  },
})
