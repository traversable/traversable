import { fn } from '@traversable/data'
import { object } from '@traversable/data'
import type { Functor } from '@traversable/registry'
import { Json } from '../json.js'
import * as t from './ast.js'
import { is } from './predicates.js'

/** @internal */
const { stringify } = globalThis.JSON
/** @internal */
const Object_entries = globalThis.Object.entries
/** @internal */
const JSON_stringify = globalThis.JSON.stringify
/** @internal */
const Array_isArray 
  : <T>(u: unknown) => u is readonly T[]
  = globalThis.Array.isArray

export namespace Recursive {
  export const toTypeString: Functor.Algebra<t.AST.lambda, string> = (n) => {
    switch (true) {
      default: return fn.softExhaustiveCheck(n)
      case n._tag === 'null': return 'null'
      case n._tag === 'boolean': return 'boolean'
      case n._tag === 'symbol': return 'symbol'
      case n._tag === 'integer': return 'integer'
      case n._tag === 'number': return 'number'
      case n._tag === 'string': return 'string'
      case n._tag === 'any': return 'unknown'
      case n._tag === 'enum': return n.def.join(' | ')
      case n._tag === 'const': return stringify(n.def)
      case n._tag === 'optional': return n.def + ' | undefined'
      case n._tag === 'array': return 'Array<' + n.def + '>'
      case n._tag === 'record': return 'Record<string, ' + n.def + '>'
      case n._tag === 'allOf': return n.def.join(' & ')
      case n._tag === 'anyOf': return n.def.join(' | ')
      case n._tag === 'oneOf': return n.def.join(' | ')
      case n._tag === 'tuple': return '[' + n.def.join(', ') + ']'
      case n._tag === 'object': {
        const xs = Object_entries(n.def).map(([k, v]) => [object.parseKey(k), v])
        return xs.length === 0 ? '{}' : '{ ' + xs.join(', ') + ' }'
      }
    }
  }

  const serializeAlgebra: Functor.Algebra<Json.lambda, string> = (x) => {
    switch (true) {
      default: return fn.exhaustive(x)
      case is.primitive(x): return JSON_stringify(x)
      case Array_isArray(x): return `[${x.join(', ')}]`
      case !!x && typeof x === 'object': 
        return '{ ' + Object_entries(x).map(([k, v]) => `${object.parseKey(k)}: ${v}`).join(', ') + ' }'
    }
  }

  const serialize = fn.cata(Json.Functor)(serializeAlgebra)

  export const toString: Functor.Algebra<t.AST.lambda, string> = (n) => {
    switch (true) {
      default: return fn.softExhaustiveCheck(n)
      case n._tag === 'null': return 't.null()'
      case n._tag === 'boolean': return 't.boolean()'
      case n._tag === 'symbol': return 't.symbol()'
      case n._tag === 'integer': return 't.integer()'
      case n._tag === 'number': return 't.number()'
      case n._tag === 'string': return 't.string()'
      case n._tag === 'any': return 't.any()'
      case n._tag === 'array': return `t.array(${n.def})`
      case n._tag === 'record': return `t.record(${n.def})`
      case n._tag === 'optional': return `t.optional(${n.def})`
      case n._tag === 'allOf': return `t.allOf(${n.def.join(', ')})`
      case n._tag === 'anyOf': return `t.anyOf(${n.def.join(', ')})`
      case n._tag === 'oneOf': return `t.oneOf(${n.def.join(', ')})`
      case n._tag === 'tuple': return `t.tuple(${n.def.join(', ')})`
      case n._tag === 'const': return `t.const(${serialize(n.def)})`
      case n._tag === 'enum': return `t.enum(${n.def.map(serialize).join(', ')})`
      case n._tag === 'object': {
        const xs = Object_entries(n.def)
        return xs.length === 0 
          ? 't.object({})' 
          : `t.object({ ${xs.map(([k, v]) => `${object.parseKey(k)}: ${v}`).join(', ')} })`
      }
    }
  }
}

export const toTypeString = t.AST.fold(Recursive.toTypeString)
export const toString = t.AST.fold(Recursive.toString)
  