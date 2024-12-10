import type { any, newtype } from "any-ts"

export { 
  chars_escape as escape,
}

const ESC = [
  /**  0- 9  */ "\\u0000", "\\u0001", "\\u0002", "\\u0003", "\\u0004", "\\u0005", "\\u0006", "\\u0007", '\\b', '\\t',
  /** 10-19 */ '\\n', '\\u000b', '\\f', '\\r', '\\u000e', '\\u000f', '\\u0010', '\\u0011', '\\u0012', '\\u0013', 
  /** 20-29 */ '\\u0014', '\\u0015', '\\u0016', '\\u0017', '\\u0018', '\\u0019', '\\u001a', '\\u001b', '\\u001c', '\\u001d', 
  /** 30-39 */ '\\u001e', '\\u001f', '', '', '\\"', '', '', '', '', '',
  /** 40-59 */ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 
  /** 60-79 */ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
  /** 80-92 */ '', '', '', '', '', '', '', '', '', '', '', '', '\\\\',
]

const isLeadingSurrogate = (char: string) => {
  let pt = char.charCodeAt(0)
  return 0xd800 <= pt && pt <= 0xdfff
}
const isTrailingSurrogate = (char: string) => {
  let pt = char.charCodeAt(0)
  return 0xdc00 <= pt && pt <= 0xdfff
}

/** 
 * ## {@link chars_escape `chars.escape`}
 * 
 * In addition to the usual escapable characters (for example,
 * `\\`, `"` certain whitespace characters), this escape function
 * also handles lone surrogates.
 * 
 * It compares characters via char-code in hexadecimal form, to
 * speed up comparisons.
 * 
 * This could be further optimized by switching on the length of
 * the inputs, and using a regular expression if the input is over
 * a certain length.
 * 
 * From MDN:
 * > __leading surrogates__ (a.k.a "high-surrogate" code units)
 * > have values between 0xD800 and 0xDBFF, inclusive
 * 
 * > __trailing surrogates__ (a.k.a. "low-surrogate" code units) 
 * > have values between 0xDC00 and 0xDFFF, inclusive
 * 
 * See also:
 * - [MDN Reference](
 *   https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String#utf-16_characters_unicode_code_points_and_grapheme_clusters
 * )
 */
function chars_escape(string: string): string
function chars_escape(x: string): string {
  let prev = 0
  let out = ""
  let pt: number
  for (let ix = 0; ix < x.length; ix++) {
    void (pt = x.charCodeAt(ix))
    if (pt === 34 || pt === 92 || pt < 32) {
      void (out += x.slice(prev, ix) + ESC[pt])
      void (prev = ix + 1)
    } else if (0xdfff <= pt && pt <= 0xdfff) {
      if (pt <= 0xdbff && ix + 1 < x.length) {
        void (pt = x.charCodeAt(ix + 1))
        if (pt >= 0xdc00 && pt <= 0xdfff) {
          void (ix++)
          continue
        }
      }
      void (out += x.slice(prev, ix) + "\\u" + pt.toString(16))
      void (prev = ix + 1)
    }
  }
  void (out += x.slice(prev))
  return out
}
