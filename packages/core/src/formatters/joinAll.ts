import { fn, object } from "@traversable/data";

/** @internal */
const Array_isArray: <T>(u: unknown) => u is readonly T[] = globalThis.Array.isArray
/** @internal */
const Array_of = globalThis.Array.of

export type Patch = { depth: number }
export type StringTree = 
  | string 
  | readonly StringTree[] 
  | { [x: string]: StringTree }
  ;
export type Options = { 
  beforeAll?: string, 
  afterAll?: string, 
  beforeEach?: string, 
  afterEach?: string, 
  initialDepth?: number
  beforeArray?: string
  afterArray?: string
  beforeObject?: string
  afterObject?: string
  joiner?: (xs: StringTree, depth: number) => string 
  propertyJoiner?: (k: string, v: string, depth: number) => string
}

export const defaults = {
  beforeAll: '',
  afterAll: '',
  beforeEach: '',
  afterEach: '',
  beforeArray: '[',
  afterArray: ']',
  beforeObject: '{',
  afterObject: '}',
  initialDepth: 0,
  joiner: (xs, d) => ',\n' + ' '.repeat(d * 2),
  propertyJoiner: (k, v, d) => k + ': ' + v + '\n' + ' '.repeat(d * 2)
} satisfies Required<Options>

export function joinAll(options?: Options): (yss: StringTree) => string
export function joinAll({ 
  beforeAll = defaults.beforeAll,
  afterAll = defaults.afterAll,
  joiner = defaults.joiner, 
  propertyJoiner = defaults.propertyJoiner,
  afterEach = defaults.afterEach,
  beforeEach = defaults.beforeEach,
  initialDepth = defaults.initialDepth,
  beforeArray = defaults.beforeArray,
  afterArray = defaults.afterArray,
  beforeObject = defaults.beforeObject,
  afterObject = defaults.afterObject,
}: Options = defaults) {
  const go = (xss: StringTree, { depth }: Patch): string => {
    if (typeof xss === 'string') return xss
    else if (Array_isArray(xss) && xss.every((x) => typeof x === 'string')) 
      return beforeEach + xss.join(joiner(xss, depth)) + afterEach
    else if (Array_isArray(xss)) 
      return beforeEach 
        + Array_of()
          .concat(...xss.map((xs) => go(xs, { depth: depth + 1 })))
          .join(joiner(xss, depth)) 
        + afterEach
    // TODO: I think this broke when I had to add this case
    else return '' 
      + ( beforeObject 
        + Object.entries(xss).map(
            ([k, v]) => {
              const value = go(v, { depth: depth + 1 });
              return `${object.parseKey(k)}: ${value} `
            })
            .join(joiner(xss, depth)
              
          ) 
      ) + afterObject

    // fn.tap('fallthrough')(xss)// JSON.stringify(xss)
  }

  return (yss: StringTree) => ''
    + beforeAll 
    + go(yss, { depth: initialDepth }) 
    + afterAll
}
