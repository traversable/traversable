#!/usr/bin/env pnpm dlx tsx
import { Print, rimraf } from "./util.js"
import { BUILD_DEPS, EMOJI, GRAPH } from "./metadata.js"

Print(Print.task(`Cleaning project dependencies... ${EMOJI.WOW}`))

GRAPH.forEach(
  node => BUILD_DEPS
    .map(path => `${node}/${path}`)
    .forEach(rimraf),
)
