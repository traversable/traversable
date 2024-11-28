export const isPair
  : (u: unknown) => u is readonly [unknown, unknown]
  = (u): u is never => globalThis.Array.isArray(u) && u.length === 2
