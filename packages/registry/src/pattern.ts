export const PATTERN = {
  between: /(?<=\{).+?(?=\})/g,
  doubleQuoted: /(?<=^").+?(?="$)/,
  singleQuoted: /(?<=^').+?(?='$)/,
  graveQuoted: /(?<=^`).+?(?=`$)/,
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
}

// BearerCaseInsensitive: /^[Bb][Ee][Aa][Rr][Ee][Rr]$/,
// NonemptyAlphaNumericWithDelimiters: /^[a-zA-Z0-9\.\-_]+$/,
// Identifier: /^[$_a-zA-Z][$_a-zA-Z0-9]*$/,
// PrefixedByForwardSlash: /^\/[a-zA-Z0-9_\$]+$/g,
// StatusCode: /^[1-5][0-9][0-9]$/,
// StatusCodeNonInfo: /^[2-5][0-9][0-9]$/,
