---
"@traversable/data": patch
---

### breaking changes

- `data.object`: renames `object.isNonPrimitiveObject` to `object.isComposite`

- `data.string`: changes the RegExp used to determine whether a string is an identifier or not
  - this change was made to ensure that we're covering the [full spectrum](https://util.unicode.org/UnicodeJsps/list-unicodeset.jsp?a=%5Cp%7BID_Start%7D) of valid identifiers

  - we don't expect this change to break your code unless you depend on identifier names / properties that are uncommon

### new features

- `data.key.fromString`
- `data.key.fromNumber`
- `data.key.fromSymbol`
- `data.key.as`
- `data.key.asAccessor`
- `data.string.unescape`
- `data.prop.isPoisonable`: detects whether a property name is subject to prototype poisoning

### performance improvements

- `data.string`: makes `string.escape` faster by using charCodes


### testing 

Adds property tests for:

- `data.key.as`
- `data.string.escape`
- `data.string.unescape`
