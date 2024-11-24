export const PATTERN = {
  between: /(?<=\{).+?(?=\})/g,
  doubleQuoted: /(?<=^").+?(?="$)/,
  singleQuoted: /(?<=^').+?(?='$)/,
  graveQuoted: /(?<=^`).+?(?=`$)/,
  /**
   * [source](https://util.unicode.org/UnicodeJsps/list-unicodeset.jsp?a=%5Cp%7BID_Start%7D)
   */
  identifier: /^[$_\p{ID_Start}][$\u200c\u200d\p{ID_Continue}]*$/u,
  // identifier: /^[a-z$_][a-z$_0-9]*$/i,
}
