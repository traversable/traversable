#!/usr/bin/env pnpm dlx tsx
import { Print, deriveShortView, topological } from "bin/util.js"

function main(effect: (description: string) => void): void {
  const indent = `   `
  const ordered = topological()
  const shortTree = [
    Print.greenText(`++++++`),
    ``,
    `📈 `.concat(Print.greenText(Print.strong(`Dependency Graph`))),
    ``,
    `${indent}${Print.with.underline(`Short view`)}:` as const,
    Print.hush(`${indent}[topological order]`),
    deriveShortView(ordered),
    ``,
    ``,
  ]

  const expandedTree = [
    Print.greenText(`++++++`),
    ``,
    `📈 `.concat(Print.greenText(Print.strong(`Dependency Graph`))),
    ``,
    `${indent}${Print.with.underline(`Expanded view`)}:` as const,
    Print.hush(`${indent}[topological order]`),
    ``,
    Print.toString(ordered),
  ]

  const description = [
    Print.task(`Describing project...`),
    ...shortTree,
    ...expandedTree,
    ``,
  ].join("\n")

  return void effect(description)
}

main(globalThis.console.log)
