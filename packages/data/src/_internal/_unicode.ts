/** @internal */
export type emoji = typeof emoji
/** @internal */
export declare const emoji: {
  combining: `🪢`
  constructor: `🏗️`
  curried: `🍛`
  destructor: `⛓️‍💥️`
  empty: `🕳️`
  filtering: `⏳`
  folding: `🪭`
  guard: `🦺`
  mapping: `🌈`
  optimization: `🔥`
  preserves_reference: `🧩`
  preserves_structure: `🌿`
  roundtrip: `🌐`,
}

export type math = typeof math
export declare const math: {
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
}

export declare const property: {
  roundtrip: `〖${typeof emoji.roundtrip}〗`
}

export type jsdoc = typeof jsdoc
export declare const jsdoc: {
  /// emoji
  combining: `#### ｛ {@link jsdoc.combining \` ️${typeof emoji.combining}‍ \` } ｝`
  constructor: `#### ｛ {@link jsdoc.constructor \` ️${typeof emoji.constructor}‍ \` } ｝`
  curried: `#### ｛ {@link jsdoc.curried \` ️${typeof emoji.curried}‍ \` } ｝`
  destructor: `#### ｛ {@link jsdoc.destructor \` ️${typeof emoji.destructor}‍ \` } ｝`
  empty: `#### ｛ {@link jsdoc.empty \` ️${typeof emoji.empty}‍ \` } ｝`
  filtering: `#### ｛ {@link jsdoc.filtering \` ️${typeof emoji.filtering}‍ \` } ｝`
  folding: `#### ｛ {@link jsdoc.folding \` ️${typeof emoji.folding}‍ \` } ｝`
  guard: `#### ｛ {@link jsdoc.guard \` ️${typeof emoji.guard}‍ \` } ｝`
  mapping: `#### ｛ {@link jsdoc.mapping \` ️${typeof emoji.mapping}‍ \` } ｝`
  optimization: `#### ｛ {@link jsdoc.optimization \` ️${typeof emoji.optimization}‍ \` } ｝`
  preserves_reference: `#### ｛ {@link jsdoc.preserves_reference \` ️${typeof emoji.preserves_reference}‍ \` } ｝`
  preserves_structure: `#### ｛ {@link jsdoc.preserves_structure \` ️${typeof emoji.preserves_structure}‍ \` } ｝`
  /// math
  integer: `#### ｛ {@link jsdoc.integer \` ️${typeof math.integer}‍ \` } ｝`
  natural: `#### ｛ {@link jsdoc.natural \` ️${typeof math.natural}‍ \` } ｝`
  real: `#### ｛ {@link jsdoc.real \` ️${typeof math.real}‍ \` } ｝`
  nullary: `#### ｛ {@link jsdoc.nullary \` ️${typeof math.nullary}‍ \` } ｝`
  unary: `#### ｛ {@link jsdoc.unary \` ️${typeof math.unary}‍ \` } ｝`
  binary: `#### ｛ {@link jsdoc.binary \` ️${typeof math.binary}‍ \` } ｝`
  ternary: `#### ｛ {@link jsdoc.ternary \` ️${typeof math.ternary}‍ \` } ｝`
  union: `#### ｛ {@link jsdoc.union \` ️${typeof math.union}‍ \` } ｝`
  intersection: `#### ｛ {@link jsdoc.intersection \` ️${typeof math.intersection}‍ \` } ｝`
  join: `#### ｛ {@link jsdoc.join \` ️${typeof math.join}‍ \` } ｝`
  meet: `#### ｛ {@link jsdoc.meet \` ️${typeof math.meet}‍ \` } ｝`
  top: `#### ｛ {@link jsdoc.top \` ️${typeof math.top}‍ \` } ｝`
  bottom: `#### ｛ {@link jsdoc.bottom \` ️${typeof math.bottom}‍ \` } ｝`
}
