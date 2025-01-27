import { default as pkg } from "./__generated__/__manifest__.js"
import { symbol } from "./symbol.js"
import type { newtype } from "./types.js"
import { SCOPE } from "./version.js"

export interface TypeError<Msg extends string, Got> extends newtype<{ [symbol.TypeError]: Msg }> {
  Got: Got
}
export type NonFinite<T> = never | TypeError<"Unexpected non-finite type:", T>
export type NonFiniteIndex<T> = never | TypeError<"Unexpected non-finite index signature:", T>
export type NonFiniteBoolean = never | NonFinite<boolean>
export type NonFiniteNumber = never | NonFinite<number>
export type NonFiniteString = never | NonFinite<string>

function throw_<T>(v: T): never {
  throw v
}
function show(header: string): <T>(...v: T[]) => string {
  return (...v) => (v.length === 0 ? "" : v.map((_) => globalThis.JSON.stringify(_, null, 2)).join("\n\t"))
}

function Error<Msg extends string>(
  msg: Msg,
  filepath?: string,
): <ID extends string, T>(identifier: ID, ...values: T[]) => never {
  return (identifier, ...v) =>
    throw_(
      globalThis.Error(
        "\n\n[🚫 Source: " +
          SCOPE +
          "/" +
          identifier +
          "]" +
          (filepath !== undefined ? "\n at: " + filepath + "\n" : "") +
          msg +
          show(", got: ")(...v),
      ),
    )
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
  Error(`'${SCOPE}/registry' was unable to locate symbol 'Symbol(${symbol.toString()})`)

export const URINotFound = (uri: string) => Error(`'${SCOPE}/registry' was unable to locate uri '${uri}'`)

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
  Error(
    ":\n\n'" +
      featureName +
      "' is not currently supported by '" +
      functionName +
      "'. " +
      "\n\nIf you'd like us to add support for that, consider filing an issue:\n\n" +
      " › " +
      pkg.bugs.url +
      "\n",
  )

export const FailedToRegisterSymbol = (uri: string) =>
  Error(
    `Attempt to set uri ${uri} failed. Make sure the registry is bound to the global object ` +
      `by running 'console.log((globalThis as any)[symbol.REGISTRY]))'`,
  )

export const ParseError = (input: string) =>
  Error("Received an input that it was unable to parse, got: " + input)

export const PrettyPrintError = (input: string, filepath?: string) =>
  Error(
    [
      filepath === undefined ? null : "\n\n[📂 in: " + filepath + "]",
      "\nEncountered an unexpected error while attempting to pretty print input: " + "\n\n" + input,
    ]
      .filter((x) => x !== null)
      .join("\n"),
  )

export const CircularReferenceError = () => Error("\nUnexpected circular reference:\n")

export const NonSerializableInput = Error("Expected input to be valid JSON, got :")
