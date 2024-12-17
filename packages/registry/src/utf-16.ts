import type { defined, Kind, newtype } from "./types.js"

declare namespace Template {
  //////////////
  /// templates
  type Entry<T = string> = [string, _?: T]
  type createProperty<T extends Template.Entry> = `〖${T[0]}〗`
  type createEmoji<$_$ extends string, namespace extends string, name extends string | void> =
    | never
    | `### ｛ {@link utf16.${namespace}.${name & string} \` ️${$_$}‍ \` } ｝`
  //////////////
  /// apply
  interface Identity extends Kind<Template.Entry, string> {
    ["~1"]: defined<this["~0"]>[0]
  }
  interface Property<_NS extends string = string> extends Kind<Template.Entry, string> {
    ["~1"]: createProperty<defined<this["~0"]>>
  }
  interface Emoji<NS extends string> extends Kind<Template.Entry, string> {
    ["~1"]: createEmoji<defined<this["~0"]>[0], NS, defined<this["~0"]>[1]>
  }
  // interface Letter extends Kind<Template.Entry, unknown>
  //   { ["~1"]: [upper: this["~0"][0], lower: this["~0"][1]]  }
  interface Letter<CS extends readonly [upper: string, lower: string]> extends newtype<CS> {}
}

export type JsDoc<F extends Kind<Template.Entry>, T extends { [x: string]: defined<F["~0"]>[1] }> =
  | never
  | { [K in keyof T]: Kind.apply<F, [T[K] & defined<F["~0"]>[0], K & defined<F["~0"]>[1]]> }

export type Charset<T extends { [x: string]: readonly [upper: string, lower: string] }> =
  | never
  | { [K in keyof T]: Letter<T[K][0], T[K][1]> }

export type Letter<A extends string, a extends string> = never | Template.Letter<[upper: A, lower: a]>

export type jsdoc = typeof jsdoc
export declare const jsdoc: emoji & gitmoji & greek & math

export type emoji = typeof emoji
export declare const emoji: JsDoc<
  Template.Emoji<"emoji">,
  {
    constructor: "🏗️"
    combining: "🪢"
    curried: "🍛"
    destructor: "⛓️‍💥️"
    empty: "🕳️"
    filtering: "⏳"
    folding: "🪭"
    guard: "🦺"
    mapping: "🌈"
    preserves_structure: "🌿"
    preserves_reference: "🧩"
    optimization: "🔥"
    roundtrip: "🪃"
  }
>

export type gitmoji = typeof gitmoji
export declare const gitmoji: JsDoc<
  Template.Emoji<"gitmoji">,
  {
    feat: "✨"
    fix: "🐛"
    docs: "📝"
    types: "️🏷️"
    perf: "⚡️"
    break: "💥"
    refactor: "♻️"
    infra: "🧱"
    add: "➕"
    rm: "➖"
    up: "⬆️"
    down: "⬇️"
  }
>

export type math = typeof math
export declare const math: JsDoc<
  Template.Identity,
  {
    integer: "ℤ"
    natural: "ℕ"
    real: "ℝ"
    nullary: "𝟘"
    unary: "𝟙"
    binary: "𝟚"
    ternary: "𝟛"
    union: "∪"
    intersection: "∩"
    join: "∨"
    meet: "∧"
    top: "⊤"
    bottom: "⊥"
    unit: "()"
    infinity: "∞"
  }
>

export type greek = typeof greek
export declare const greek: Charset<{
  /** stuff */
  alpha: ["A", "α"]
  beta: ["Β", "β"]
  gamma: ["Γ", "γ"]
  delta: ["Δ", "δ"]
  epsilon: ["Ε", "ε"]
  zeta: ["Ζ", "ζ"]
  eta: ["Η", "η"]
  theta: ["Θ", "θ"]
  iota: ["Ι", "ι"]
  kappa: ["Κ", "κ"]
  lambda: ["Λ", "λ"]
  mu: ["Μ", "μ"]
  nu: ["Ν", "ν"]
  xi: ["Ξ", "ξ"]
  omicron: ["Ο", "ο"]
  pi: ["Π", "π"]
  rho: ["Ρ", "ρ"]
  sigma: ["Σ", "σ"]
  tau: ["Τ", "τ"]
  upsilon: ["Υ", "υ"]
  phi: ["Φ", "φ"]
  chi: ["Χ", "χ"]
  psi: ["Ψ", "ψ"]
  omega: ["Ω", "ω"]
}>
