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

/** @internal */
const { create, defineProperty, getOwnPropertySymbols, keys } = globalThis.Object
/** @internal */
const { group, groupEnd, trace } = globalThis.console

type Parse<T> = T extends `${infer N extends number}` ? N : T
/** @internal */
function invert<const T extends { [x: number]: keyof any }>(
  object: T,
): { -readonly [K in Extract<keyof T, `${number}`> as T[K]]: Parse<K> }
function invert<const T extends { [x: string | symbol]: keyof any }>(
  object: T,
): { -readonly [K in keyof T as T[K]]: K }
function invert<const T extends Record<string | symbol, string | symbol>>(object: T) {
  let out: { [x: string | symbol]: string | symbol } = create(null)
  let ks = keys(object)
  let ky = getOwnPropertySymbols(object)
  let k: string | symbol | undefined
  while ((k = ks.pop()) !== undefined)
    defineProperty(out, object[k], { value: k, enumerable: true, writable: true, configurable: false })
  while ((k = ky.pop()) !== undefined)
    defineProperty(out, object[k], { value: k, enumerable: true, writable: true, configurable: false })
  return out
}

/** @internal */
function index<const T extends { [x: number]: unknown; length: number }>(
  object: T,
): { -readonly [K in Extract<keyof T, `${number}`>]: T[K] }
function index<const T extends { [x: number]: unknown; length: number }>(xs: T) {
  let out: Record<number, unknown> = Object.create(null)
  for (let ix = 0, len = xs.length; ix < len; ix++)
    defineProperty(out, ix, { value: xs[ix], enumerable: true, writable: true, configurable: false })
  return out
}

/** @internal */
function throw_<T>(v: T): never {
  throw v
}
/** @internal */
function show(header: string): <T>(...v: T[]) => string {
  return (...v) => (v.length === 0 ? "" : v.map((_) => globalThis.JSON.stringify(_, null, 2)).join("\n\t"))
}

export { Error as UntaggedError }
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

type withTrace<T> = [log: () => void, msg: string]
function withTrace<ID extends string, const T extends readonly unknown[]>(
  identifier: ID,
  values: T,
): (msg: string) => withTrace<T> {
  const header = '["' + identifier + '"]: '
  const log = (): void => (void group(header), void values.forEach(trace), void groupEnd())
  return (msg: string) => [log, header + msg + "\n" + show(", got: ")(...values)] satisfies [any, any]
}

Error.withTrace = <
  <Msg extends string>(msg: Msg) => <ID extends string, T>(identifier: ID, ...values: T[]) => never
>((msg_) =>
  (id, ...v) => {
    const [log, msg] = withTrace(id, v)(msg_)
    const error = globalThis.Error(msg)
    return void log(), throw_(error)
  })

export interface TaggedError<Tag> extends globalThis.Error {
  [symbol.tag]: Tag
}
export function TaggedError<const Tag, Msg extends string>(
  tag: Tag,
  msg: Msg,
): (
  filepath?: string,
) => <ID extends string, const T extends readonly unknown[]>(identifier: ID, ...values: T) => never {
  return (filepath) =>
    (identifier, ...v) => {
      const error = <TaggedError<Tag>>Error(msg, filepath)(identifier, ...v)
      return void (error[symbol.tag] = tag), throw_(error)
    }
}

TaggedError.withTrace = <
  <const Tag, Msg extends string>(
    tag: Tag,
    msg: Msg,
  ) => <ID extends string, T>(identifier: ID, ...values: T[]) => never
>((tag, msg_) =>
  (id, ...v) => {
    const [log, msg] = withTrace(id, v)(msg_)
    const error = <TaggedError<unknown>>globalThis.Error(msg)
    return void (error[symbol.tag] = tag), void log(), throw_(error)
  })

/////////////////////////////
///    general purpose    ///
const ILLEGAL_STATE = "IllegalState" as const
const UNEXPECTED_ERROR = "UnexpectedError" as const
const UNEXPECTED_PREDICATE_FAILURE = "UnexpectedPredicateFailure" as const
const UNEXPECTED_CIRCULAR_REFERENCE = "UnexpectedCircularReference" as const
const EXHAUSTIVE_MATCH_FAILURE = "ExhastiveMatchFailure" as const
///
const ILLEGAL_STATE_MSG = "Illegal state: this code path should not be possible to execute"
const UNEXPECTED_ERROR_MSG = "An unexpected error occurred" as const
const UNEXPECTED_CIRCULAR_REFERENCE_MSG = "Unexpected circular reference" as const
const EXHAUSTIVE_MATCH_FAILURE_MSG = "Failed to exhaustively handle all code paths" as const
// TODO: interpolate predicate name, otherwise this error message is useless
const UNEXPECTED_PREDICATE_FAILURE_MSG = "Received an input that failed to satisfy predicate" as const

export const CatchAll = TaggedError(UNEXPECTED_ERROR, UNEXPECTED_ERROR_MSG)
export const PredicateFailed = TaggedError(UNEXPECTED_PREDICATE_FAILURE, UNEXPECTED_PREDICATE_FAILURE_MSG)
export const CircularReferenceError = TaggedError(
  UNEXPECTED_CIRCULAR_REFERENCE,
  UNEXPECTED_CIRCULAR_REFERENCE_MSG,
)
export const IllegalState = TaggedError.withTrace(
  ILLEGAL_STATE,
  `${ILLEGAL_STATE_MSG}. Please consider filing an issue at ${pkg.bugs.url}.`,
)
export const FailedToExhaustivelyMatch = TaggedError.withTrace(
  EXHAUSTIVE_MATCH_FAILURE,
  EXHAUSTIVE_MATCH_FAILURE_MSG,
)

export const ERROR_NAMES = [
  UNEXPECTED_ERROR,
  UNEXPECTED_PREDICATE_FAILURE,
  UNEXPECTED_CIRCULAR_REFERENCE,
  ILLEGAL_STATE,
  EXHAUSTIVE_MATCH_FAILURE,
] as const satisfies any[]

export const ERROR_NAME_BY_CODE = index(ERROR_NAMES)
export type ERROR_NAME_BY_CODE<Code extends keyof typeof ERROR_NAME_BY_CODE> =
  (typeof ERROR_NAME_BY_CODE)[Code]
export const ERROR_CODE_BY_NAME = invert(ERROR_NAMES)
export type ERROR_CODE_BY_NAME<Name extends keyof typeof ERROR_CODE_BY_NAME> =
  (typeof ERROR_CODE_BY_NAME)[Name]

///////////////////////////////
///     context-specifc     ///
export const FileNotFound = (filename: string) => Error("FileNotFound")("'" + filename + "'")
export const ParseError = (input: string) =>
  Error("Received an input that it was unable to parse, got: " + input)

export const InputIsNotSerializable = Error("Expected input to be valid JSON, got :")
export const UnexpectedEmptyString = Error("Expected input string to be non-empty")

////////////////////
///  task-specific
export const UnmatchedScalar = Error("Expected a scalar value")
export const PrettyPrintError = (input: string, filepath?: string) =>
  Error(
    [
      filepath === undefined ? null : "\n\n[📂 in: " + filepath + "]",
      "\nEncountered an unexpected error while attempting to pretty print input: " + "\n\n" + input,
    ]
      .filter((x) => x !== null)
      .join("\n"),
  )

/// project-specific
export const UnexpectedRequiredElement = Error("Required elements cannot follow optional elements")
export const FailedToResolveDocumentRef = Error("Failed to resolve document reference")
export const NotYetSupported = (featureName: string, functionName: string) =>
  Error(
    `:\n\n'` +
      featureName +
      `' is not currently supported by '` +
      functionName +
      `'. ` +
      `\n\nIf you'd like us to add support for that, consider filing an issue:\n\n` +
      " › " +
      pkg.bugs.url +
      "\n",
  )

/// registry
export const SymbolNotFound = (symbol: symbol) =>
  Error(`'${SCOPE}/registry' was unable to locate symbol 'Symbol(${symbol.toString()})`)
export const URINotFound = (uri: string) => Error(`'${SCOPE}/registry' was unable to locate uri '${uri}'`)
export const FailedToRegisterSymbol = (uri: string) =>
  Error(
    `Attempt to set uri ${uri} failed. Make sure the registry is bound to the global object ` +
      `by running 'console.log((globalThis as any)[symbol.REGISTRY]))'`,
  )

/// lib-specific
export const ZodUnionsRequireTwoOrMore = Error("'zod' requires unions to have at least 2 members")
export const UnexpectedIntersectionWithNonObject = Error(
  "The behavior and semantics of 'allOf' is undefined for non-objects",
)
