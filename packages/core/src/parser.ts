import type { Char } from "@traversable/registry"

interface Predicate { (haystack: string): boolean }
interface Combinator<T> { (needle: T): Predicate }
interface CharCombinator<T extends Char<T>> extends Combinator<T> {}



const char = <T extends Char<T>>(char: T) => (haystack: string) => haystack[0] === char
