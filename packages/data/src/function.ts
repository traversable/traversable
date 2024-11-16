import type { any, mut, some } from "any-ts"

import {
  UnusedParam,
  absorb,
  apply,
  call,
  exhaustive,
  fanout,
  fansout,
  flow,
  fn,
  free,
  hasOwn,
  identity,
  isUnusedParam,
  pipe,
  tee,
} from "./_internal/_function.js"

import params = fn.params
import thunk = fn.thunk
import effect = fn.effect
import param1 = fn.param1
import param2 = fn.param2
import parameter = fn.param

export const is = <I extends any.array<any>, O>(u: unknown): u is some.function<I, O> =>
  typeof u === "function"

type return_<T> = [T] extends [fn.some<any, infer O>] ? O : never

export type {
  thunk,
  thunk as lazy,
  effect,
  params,
  return_ as return,
  return_ as returnType,
  parameter,
  param1,
  param2,
}

export {
  absorb,
  apply,
  assertExhaustive,
  call,
  chainFirst,
  constant,
  constrain,
  exhaustive,
  fanout,
  fansout,
  flow,
  free,
  isUnusedParam,
  hasOwn,
  identity,
  log,
  pipe,
  tap,
  tee,
  throw_ as throw,
  throwWithMessage,
  UnusedParam,
}

export { 
  loop,
  tupled, 
  untupled,
} from "./_internal/_function.js"

const constrain
  : <T = never>() => (x: T) => never 
  = () => identity as never

const constant
  : <const T>(x: T) => () => T 
  = (x) => () => x

const throw_ = (...args: mut.array): never => {
  throw globalThis.Error(globalThis.JSON.stringify(args.length === 1 ? args[0] : args, null, 2))
}

const throwWithMessage =
  (msg: string) =>
  (...args: mut.array): never => {
    console.error(JSON.stringify(args.slice(1), null, 2))
    return throw_(msg, ...args)
  }

const assertExhaustive: <t extends any.array>(...impossible: t) => never = (...impossible) => {
  if (impossible) throw Error(`\`exhaustive\` was called, which should never happen`)
  else return void 0 as never
}

const chainFirst: <const type>(x: type) => (eff: (x: type) => void) => type 
  = (x) => (eff) => (void eff(x), x)

const log: (msg: string, logger?: (...args: unknown[]) => void) => (x: unknown) => void =
  (msg, logger = globalThis.console.log) =>
  (x) =>
    logger(msg, x)

const tap: (msg: string, logger?: (...args: unknown[]) => void) => <const type>(x: type) => type = (
  msg,
  logger = globalThis.console.log,
) => flow(chainFirst, apply(log(msg, logger)))
