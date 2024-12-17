export const PATTERN = {
  bearer: /^[Bb][Ee][Aa][Rr][Ee][Rr]$/,
  between: /(?<=\{).+?(?=\})/g,
  commentTerminator: /(\*\/)/g,
  doubleQuoted: /(?<=^").+?(?="$)/,
  forwardSlashPrefixed: /^\/[a-zA-Z0-9_\$]+$/g,
  graveQuoted: /(?<=^`).+?(?=`$)/,
  /**
   * [source](https://util.unicode.org/UnicodeJsps/list-unicodeset.jsp?a=%5Cp%7BID_Start%7D)
   */
  identifier: /^[$_\p{ID_Start}][$\u200c\u200d\p{ID_Continue}]*$/u,
  nonemptyDelimitedAlphanumeric: /^[a-zA-Z0-9\.\-_]+$/,
  pathParameter: /\{(.+?)\}\/?/g,
  pathParameterCapture: /(.+?){(.+?)\}(.+?)/g,
  pathParameterCaptureEnd: /(.+?){(.+?)\}/g,
  pathParameterCaptureStart: /{(.+?)\}(.+?)/g,
  pathParameterLocal: /\{(.+?)\}\/?/,
  quoteCharacter: /['"`]/g,
  singleQuoted: /(?<=^').+?(?='$)/,
  startsWithDigit: /^\d.+/,
  statusCode: /^[1-5][0-9][0-9]$/,
  statusCodeNonInfo: /^[2-5][0-9][0-9]$/,
  // identifier: /^[a-z$_][a-z$_0-9]*$/i,
  // identifier: /^[$_a-zA-Z][$_a-zA-Z0-9]*$/,
}
