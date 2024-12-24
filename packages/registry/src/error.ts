import { default as pkg } from "./__generated__/__manifest__.js"

function throw_<T>(v: T): never {
  throw v
}
function show(header: string): <T>(...v: T[]) => string {
  return (...v) => (v.length === 0 ? "" : v.map((_) => globalThis.JSON.stringify(_, null, 2)).join("\n\t"))
}

function Error<Msg extends string>(
  msg: Msg,
): <ID extends string, T>(identifier: ID, ...values: T[]) => never {
  return (id, ...v) => throw_(globalThis.Error("['" + id + "']: " + msg + show(", got: ")(...v)))
}

Error.withTrace = <
  <Msg extends string>(msg: Msg) => <ID extends string, T>(identifier: ID, ...values: T[]) => never
>((msg) =>
  (id, ...v) => {
    const header = '["' + id + '"]: '
    void globalThis.console.group(header)
    void v.forEach(globalThis.console.trace)
    void globalThis.console.groupEnd()
    return throw_(globalThis.Error(header + msg + "\n" + show(", got: ")(...v)))
  })

export const SymbolNotFound = (symbol: symbol) =>
  Error(`'@traversable/registry' was unable to locate symbol 'Symbol(${symbol.toString()})`)

export const URINotFound = (uri: string) => Error(`'@traversable/registry' was unable to locate uri '${uri}'`)

export const FileNotFound = (filename: string) => Error("FileNotFound")("'" + filename + "'")

export const UnmatchedScalar = Error("Expected a scalar value")

export const UnexpectedRequiredElement = Error("Required elements cannot follow optional elements")

export const FailedToExhaustivelyMatch = Error.withTrace("Failed to exhaustively handle all code paths")

export const PredicateFailed = Error("Unexpected predicate failure")

export const IllegalState = Error.withTrace(
  "Illegal state: this code path should not be possible to execute. " +
    "Please consider creating an issue at " +
    pkg.bugs.url,
)

export const NotYetSupported = (featureName: string, functionName: string) =>
  Error("NotYetSupported")(
    "'" +
      featureName +
      "' is not currently supported by '" +
      functionName +
      "'." +
      "If you'd like us to add that support, let us know at: " +
      pkg.bugs.url,
  )

export const FailedToRegisterSymbol = (uri: string) =>
  Error(
    `Attempt to set uri ${uri} failed. Make sure the registry is bound to the global object ` +
      `by running 'console.log((globalThis as any)[symbol.REGISTRY]))'`,
  )
