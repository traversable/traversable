import type { Json } from "@traversable/core/json"

interface Config {
  indentationUnit: string
  maxWidth: number
}

interface State {
  depth: number
  width: number
  isRoot: boolean
}

interface Derived {
  leftMargin: string
  leftPadding: string
}

interface LinesConfig extends Config {
  separator?: string
}

function intercalate(separator: string): (...lines: string[]) => string[]
function intercalate(separator: string): (...lines: string[]) => string[] {
  return (...lines) => lines.length === 0 ? [] : [
    lines.shift()!,
    ...lines.map((line) => `${separator}${line}`)
  ]
}

function lines(state: State, config: LinesConfig): (...lines: string[]) => string[]
function lines($: State, _: LinesConfig): (...lines: string[]) => string[] {
  return (...lines) => {
    const
  }
}
