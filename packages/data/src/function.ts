import type { any, mut, some } from "any-ts"

import {
  UnusedParam,
  absorb,
  ana,
  apo,
  apply,
  applyN,
  call,
  cata,
  cataIx,
  chainFirst,
  dimap,
  distribute,
  distributes,
  exhaustive,
  flow,
  fn,
  free,
  hasOwn,
  hylo,
  identity,
  isUnusedParam,
  log,
  para,
  paraIx,
  pipe,
  softExhaustiveCheck,
  tap,
  tee,
  upcast,
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
  ana,
  apo,
  apply,
  applyN,
  assertExhaustive,
  call,
  cata,
  cataIx,
  chainFirst,
  constant,
  constrain,
  exhaustive,
  dimap,
  distribute,
  distributes,
  flow,
  free,
  isUnusedParam,
  hasOwn,
  hylo,
  identity,
  log,
  para,
  paraIx,
  pipe,
  softExhaustiveCheck,
  tap,
  tee,
  throw_ as throw,
  throwWithMessage,
  UnusedParam,
  upcast,
}

export { 
  loop,
  loopN,
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

