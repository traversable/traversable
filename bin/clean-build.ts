#!/usr/bin/env pnpm dlx tsx
import { Print, rimraf } from "./util.js"
import { BUILD_ARTIFACTS, EMOJI, GRAPH } from "./metadata.js"

Print(Print.task(`Cleaning build artifacts... ${EMOJI.WELL}`))

GRAPH.forEach(
  node => BUILD_ARTIFACTS
    .map(path => `${node}/${path}`)
    .forEach(rimraf),
)
