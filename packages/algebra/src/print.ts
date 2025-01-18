export const pad = ($: { indent: number }) => " ".repeat($.indent)
export const tab = ($: { indent: number }) => " ".repeat($.indent + 2)
export const newline = ($: { indent: number }, count = 0) => "\n" + " ".repeat($.indent + (2 * (count + 1)))
export function array($: { indent: number }): 
  <L extends string, const Body extends string[], R extends string>(left: L, ...body: [...Body, R]) 
    => `${L}${string}${R}`
export function array($: { indent: number }) {
  return (...args: [string, ...string[], string]) => {
    const [left, body, right] = [args[0], args.slice(1, -1), args[args.length - 1]]
    return ""
    + left.trim() 
    // + pad($) 
    + [pad($) + body.map((_) => newline($) + _.trim()).join(",")].join("," + newline($))
    + newline($, -1) 
    + right.trim()
  }
}
