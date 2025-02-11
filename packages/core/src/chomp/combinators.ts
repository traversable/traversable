import type { string } from "@traversable/data"
import type { CharOrNonFinite as Char } from "@traversable/registry"

export interface Combinator<S = string, T = string> { (src: S): ParseResult<T> }
export interface CombinatorWillNeverSucceed { (_: never): ParseFailure }
export interface CombinatorWillAlwaysSucceed { (_: any): ParseSuccess<''> }
type Any = 
  | Combinator 
  | CombinatorWillNeverSucceed
  | CombinatorWillAlwaysSucceed

type InferSource<T> = [T] extends [Combinator<infer S>] ? S : never
type InferTarget<S> = [S] extends [Combinator<any, infer T>] ? T : never

export type ParseResult<T> = ParseSuccess<T> | ParseFailure
export interface ParseFailure { tag: 'Chomp::ParseFailure' }
export interface CaptureGroups { [binding: string]: string }
export interface ParseSuccess<T = string> {
  tag: 'Chomp::ParseSuccess'
  value: T
  todo: string
  captures: CaptureGroups
}

export const isFailure = <T>(r: ParseResult<T>): r is ParseFailure => r.tag === 'Chomp::ParseFailure'
export const isSuccess = <T>(r: ParseResult<T>): r is ParseSuccess<T> => r.tag === 'Chomp::ParseSuccess'

export function fail(): ParseFailure { return { tag: 'Chomp::ParseFailure' } }
export function succeed<const T>(value: T, todo?: string, captures?: CaptureGroups): ParseSuccess<T> {
  return {
    tag: 'Chomp::ParseSuccess',
    value,
    todo: todo ?? '',
    captures: captures ?? {},
  }
}

export function char<const T extends Char<T>>(char: T): Combinator<T>
export function char(char: string): Combinator {
  return (s) => s[0] !== char 
    ? fail() 
    : succeed(char, s.substring(1))
}

export function either<S, T>(...ps: [Combinator<S>, ...Combinator<T>[]]): Combinator<string, S | T>
export function either(...ps: []): CombinatorWillNeverSucceed
export function either(...ps: Combinator[]): Combinator 
export function either(...ps: [] | Combinator[]): Any {
  return (s: string) => {
    for (let ix = 0, len = ps.length; ix < len; ix++) {
      const result = ps[ix](s)
      if (isSuccess(result)) return result
    }
    return fail()
  }
}

export function sequence
  <const T extends readonly [string, ...string[]]>
  (...ps: { [Ix in keyof T]: Combinator<T[Ix]> }): 
    Combinator<string, string.join<T, ''>>
export function sequence(...ps: []): CombinatorWillAlwaysSucceed
export function sequence(...ps: [] | Combinator[]): Combinator
export function sequence(...ps: Combinator[]): Any  {
  return (s: string) => {
    let todo = s, value = ''
    for (let ix = 0, len = ps.length; ix < len; ix++) {
      const result = ps[ix](todo)
      if (isSuccess(result)) {
        void (todo = result.todo)
        void (value += result.value)
      } else return fail()
    }

    return succeed(value, todo)
  }
}

export function capture<T extends string>(name: T): (p: Combinator) => Combinator {
  return (p) => (s) => {
    const result = p(s)
    if (isSuccess(result))
      return succeed(result.value, result.todo, { ...result.captures, [name]: result.value })
    else return result
  }
}
