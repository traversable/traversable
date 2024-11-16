#!/usr/bin/env pnpm dlx tsx
import { Print, rimraf } from "./util.js"
import { BUILD_ARTIFACTS, BUILD_DEPS, GRAPH } from "./metadata.js"

Print(Print.task(`Cleaning build artifacts and project dependencies...`))

GRAPH.forEach(
  node => [...BUILD_ARTIFACTS, ...BUILD_DEPS]
    .map(path => `${node}/${path}`)
    .forEach(rimraf),
)
