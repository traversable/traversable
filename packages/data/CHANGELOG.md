# @traversable/data

## 0.0.2

### Patch Changes

- [#11](https://github.com/traversable/traversable/pull/11) [`6a7cdd1`](https://github.com/traversable/traversable/commit/6a7cdd1815eefdb47b6faf27cd27e7c060339d24) Thanks [@ahrjarrett](https://github.com/ahrjarrett)! - ### breaking changes

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

## 0.0.1

### Patch Changes

- [#1](https://github.com/traversable/traversable/pull/1) [`b2bcc9c`](https://github.com/traversable/traversable/commit/b2bcc9c676d775e4189c5c0fdd7e152e45d18bf8) Thanks [@ahrjarrett](https://github.com/ahrjarrett)! - ### new packages

  :tada: first release for the following packages:

  - bench
  - core
  - data
  - http 
  - openapi
