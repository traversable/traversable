export const PATTERN = {
  between: /(?<=\{).+?(?=\})/g,
  doubleQuoted: /(?<=^").+?(?="$)/,
  singleQuoted: /(?<=^').+?(?='$)/,
  graveQuoted: /(?<=^`).+?(?=`$)/,
  quoteCharacter: /['"`]/g,
  startsWithDigit: /^\d.+/,
  /**
   * [source](https://util.unicode.org/UnicodeJsps/list-unicodeset.jsp?a=%5Cp%7BID_Start%7D)
   */
  identifier: /^[$_\p{ID_Start}][$\u200c\u200d\p{ID_Continue}]*$/u,
  forwardSlashPrefixed: /^\/[a-zA-Z0-9_\$]+$/g,
  statusCode: /^[1-5][0-9][0-9]$/,
  statusCodeNonInfo: /^[2-5][0-9][0-9]$/,
  nonemptyDelimitedAlphanumeric: /^[a-zA-Z0-9\.\-_]+$/,
  bearer: /^[Bb][Ee][Aa][Rr][Ee][Rr]$/,
  // identifier: /^[a-z$_][a-z$_0-9]*$/i,
  // identifier: /^[$_a-zA-Z][$_a-zA-Z0-9]*$/,
  pathParameterLocal: /\{(.+?)\}\/?/,
  pathParameter: /\{(.+?)\}\/?/g,
  pathParameterCapture: /(.+?){(.+?)\}(.+?)/g,
  pathParameterCaptureEnd: /(.+?){(.+?)\}/g,
  pathParameterCaptureStart: /{(.+?)\}(.+?)/g,
}
