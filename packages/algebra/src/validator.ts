import { Traversable, core, tree } from "@traversable/core"
import { fn, map } from "@traversable/data"
import { openapi } from "@traversable/openapi"
import type { Functor, Part, Partial } from "@traversable/registry"

import * as Sort from "./sort.js"
import * as Type from "./type.js"

export { deriveValidator as derive }

export type Options = Partial<typeof defaults>
export type Config = Part<typeof defaults, "compare" | "document">
export type ContinuationContext = {
  path: (string | number)[]
  rawPath: (string | number)[]
  schemaPath: (string | number)[]
  depth: number 
  index: number
  isRequired: boolean
}

export interface Stream {
  GO(ctx: ContinuationContext): string
  index?: string | number
  keyCount?: number
  required?: (string | number)[]
}

export {
  ValidationType as Type
}
type ValidationType = typeof ValidationType[keyof typeof ValidationType]
const ValidationType = {
  typeguard: 'typeguard',
  failFast: 'failFast',
  failSlow: 'failSlow',
} as const satisfies Record<string, string>

export const defaults = {
  compare: Sort.derive.defaults.compare,
  /**
   * ### {@link defaults.document `validator.Options.document`}
   *
   * If any part of the schema you'd like to interpret contains a ref,
   * {@link derive `validator.derive`} will take care of resolving them
   * for you if you provide the document via this config option.
   */
  document: openapi.doc<openapi.doc>({
    openapi: '3.1.0',
    paths: {},
    components: { schemas: {} },
    info: { title: 'Untitled', version: '0.0.0' },
  }),
  /**
   * ### {@link defaults.functionName `validator.Options.functionName`}
   *
   * If not specified, {@link derive `validator.derive`} will generate a
   * function expression instead of a function declaration.
   */
  functionName: 'isValid',
  flags: { 
    /** 
     * #### {@link defaults.flags.treatArraysLikeObjects `Options.flags.treatArraysLikeObjects`} 
     * 
     * If `true`, record validations will perform an extra check that invalidates array 
     * candidates that would otherwise pass validation.
     * 
     * Since arrays are JavaScript objects, this flag is **opt-out** (defaults to `true`).
     */
    treatArraysLikeObjects: false,
    aheadOfTime: true as boolean,
  },
  validationType: ValidationType.typeguard as ValidationType,
}

/** @internal */
const Object_entries = globalThis.Object.entries
/** @internal */
const Object_keys = globalThis.Object.keys
/** @internal */
const ident = (depth: number, pathname?: string) => '$' + (depth + '') + '$' + (pathname ?? '')
/** @internal */
const inlineOptionalityCheck = ($: ContinuationContext) => $.isRequired ? '' : $.path.join('') + '!==undefined&&'
/** @internal */
const createIsObjectVarName = ($: ContinuationContext) => '$isObj' + $.depth + ($.path.at($.path.length - 1) ?? '')

const parseOptions  
  : (options: Options) => Config
  = ({
    compare,
    document,
    functionName = defaults.functionName,
    validationType = defaults.validationType,
    flags: {
      aheadOfTime = defaults.flags.aheadOfTime,
      treatArraysLikeObjects = defaults.flags.treatArraysLikeObjects,
    } = defaults.flags,
  }) => ({
    compare,
    document,
    functionName,
    validationType,
    flags: { aheadOfTime, treatArraysLikeObjects }
  })

/** 
 * @example
 * 
 * function validate10(
 *   data, {
 *     instancePath="", 
 *     parentData, 
 *     parentDataProperty, 
 *     rootData=data
 *   } = {}
 * ){
 *   let vErrors = null;
 *   let errors = 0;
 *   if(errors === 0) {
 *     if(data && typeof data == "object" && !Array.isArray(data)){
 *       let missing0;
 *       if((((data.a === undefined) && (missing0 = "a")) || ((data.b === undefined) && (missing0 = "b"))) || ((data.c === undefined) && (missing0 = "c"))) {
 *         validate10.errors =[{ 
 *           instancePath, 
 *           schemaPath:"#/required", 
 *           keyword:"required", 
 *           params: { missingProperty: missing0 },
 *           message:"must have required property '"+missing0+"'"
 *         }];
 *         return false;
 *       } else {
 *         if(data.a !== undefined){
 *           let data0 = data.a;
 *           const _errs1 = errors;
 *           if(errors === _errs1){
 *             if(Array.isArray(data0)){
 *               if(data0.length > 3){
 *                 validate10.errors = [{ 
 *                   instancePath:instancePath+"/a",
 *                   schemaPath:"#/properties/a/maxItems",
 *                   keyword:"maxItems",
 *                   params:{ limit: 3 },
 *                   message:"must NOT have more than 3 items"
 *                 }];
 *                 return false;
 *               } else {
 *                 if(data0.length < 3){
 *                   validate10.errors = [{ 
 *                     instancePath:instancePath+"/a", 
 *                     schemaPath:"#/properties/a/minItems",
 *                     keyword:"minItems",
 *                     params:{limit: 3},
 *                     message:"must NOT have fewer than 3 items"
 *                   }];
 *                   return false;
 *                 } else {
 *                   const len0 = data0.length;
 *                   if(len0 > 0){
 *                     let data1 = data0[0];
 *                     const _errs3 = errors;
 *                     if(!((typeof data1 == "number") && (isFinite(data1)))){
 *                       validate10.errors = [{
 *                         instancePath:instancePath+"/a/0",
 *                         schemaPath:"#/properties/a/items/0/type",
 *                         keyword:"type",params:{type: "number"},
 *                         message:"must be number"
 *                       }];
 *                       return false;
 *                     } 
 *                     var valid1 = _errs3 === errors;
 *                   } 
 *                   if(valid1){
 *                     if(len0 > 1){
 *                       const _errs5 = errors;
 *                       if(10 !== data0[1]){
 *                         validate10.errors = [{
 *                           instancePath:instancePath+"/a/1",
 *                           schemaPath:"#/properties/a/items/1/const",
 *                           keyword:"const",
 *                           params:{allowedValue: 10}, 
 *                           message:"must be equal to constant" 
 *                         }];
 *                         return false;
 *                       }
 *                       var valid1 = _errs5 === errors;
 *                     }
 *                     if(valid1){
 *                       if(len0 > 2){
 *                         const _errs6 = errors;
 *                         const vSchema0 = schema11.properties.a.items[2].enum;
 *                         if(!(func0(data0[2], vSchema0[0]))){
 *                           validate10.errors = [{ 
 *                             instancePath:instancePath+"/a/2", 
 *                             schemaPath:"#/properties/a/items/2/enum",
 *                             keyword:"enum", 
 *                             params:{ 
 *                               allowedValues: schema11.properties.a.items[2].enum
 *                             },
 *                             message:"must be equal to one of the allowed values"
 *                           }];
 *                           return false;
 *                         }
 *                         var valid1 = _errs6 === errors;
 *                       }
 *                     }
 *                   }
 *                 }
 *               }
 *             } else {
 *               validate10.errors =[{
 *                 instancePath:instancePath+"/a", 
 *                 schemaPath:"#/properties/a/type", 
 *                 keyword:"type",
 *                 params:{type: "array"},
 *                 message:"must be array"
 *               }];
 *               return false;
 *             }
 *           }
 *           var valid0 = _errs1 === errors;
 *         } else {
 *           var valid0 = true;
 *         } if(valid0){ if(data.b !== undefined) {
 *           let data4 = data.b;
 *           const _errs7 = errors;
 *           if(errors === _errs7) {
 *             if(Array.isArray(data4)) { 
 *               var valid2 = true;
 *               const len1 = data4.length;
 *               for(let i0=0; i0<len1; i0++){
 *                 const _errs9 = errors;
 *                 if(typeof data4[i0] !== "string"){
 *                   validate10.errors = [{
 *                     instancePath:instancePath+"/b/" + i0,
 *                     schemaPath:"#/properties/b/items/type",
 *                     keyword:"type",
 *                     params:{
 *                       type: "string"
 *                     },
 *                     message:"must be string"
 *                   }];
 *                   return false;
 *                 } 
 *                 var valid2 = _errs9 === errors;
 *                 if(!valid2){ break; }
 *               }
 *             } else {
 *               validate10.errors = [{
 *                 instancePath:instancePath+"/b", 
 *                 schemaPath:"#/properties/b/type", 
 *                 keyword:"type", 
 *                 params:{type: "array"}, 
 *                 message:"must be array"
 *               }];
 *               return false;
 *             }
 *           }
 *           var valid0 = _errs7 === errors;
 *         } else {
 *           var valid0 = true;
 *         } if(valid0){ if(data.c !== undefined){ 
 *           let data6 = data.c;
 *           const _errs11 = errors;
 *           if(errors === _errs11){
 *             if(data6 && typeof data6 == "object" && !Array.isArray(data6)){
 *               for(const key0 in data6){
 *                 let data7 = data6[key0];
 *                 const _errs14 = errors;
 *                 if(!((typeof data7 == "number") && (isFinite(data7)))){
 *                   validate10.errors = [{
 *                     instancePath:instancePath+"/c/" + key0.replace(/~/g, "~0").replace(/\//g,"~1"),
 *                     schemaPath:"#/properties/c/additionalProperties/type",
 *                     keyword:"type",
 *                     params:{type: "number"},
 *                     message:"must be number"
 *                   }];
 *                   return false;
 *                 }
 *                 var valid3 = _errs14 === errors;
 *                 if(!valid3){break;}
 *               }
 *             } else {
 *               validate10.errors = [{ 
 *                 instancePath:instancePath+"/c", 
 *                 schemaPath:"#/properties/c/type", 
 *                 keyword:"type", 
 *                 params:{type: "object"}, 
 *                 message:"must be object"
 *               }];
 *               return false;
 *             }
 *           }
 *           var valid0 = _errs11 === errors;
 *         } else { 
 *           var valid0 = true;
 *         }
 *                     }
 *                     }
 *       }
 *     } else {
 *       validate10.errors = [{ 
 *         instancePath, 
 *         schemaPath:"#/type", 
 *         keyword:"type", 
 *         params: {type: "object"}, 
 *         message:"must be object"
 *       }]; 
 *       return false;
 *     }
 *   }
 *   validate10.errors = vErrors;
 *   return errors === 0;
 *   }
 */

namespace RAlgebra {
  export function validator(options?: Options): Functor.RAlgebra<Traversable.lambda, Stream> 
  export function validator(options: Options = defaults): Functor.RAlgebra<Traversable.lambda, Stream> {
    const cfg = parseOptions(options)

    /**
     * - [ ] TODO:
     * Possible optimization: use # of required keys to
     * short-circuit if target doesn't have at least that many keys
     */
    return (n) => {
      switch (true) {
        default: return fn.exhaustive(n)
        case Traversable.is.$ref(n): return { GO: () => '' }
        case Traversable.is.any(n): return { GO: () => '' }
        case Traversable.is.enum(n): return { GO: () => '' }
        case Traversable.is.const(n): return { GO: () => '' }
        case Traversable.is.null(n): return { 
          GO($) {
            const varName = $.path.join('')
            const schemaPath = $.schemaPath.join('/') + '/'
            const path = $.rawPath.join('.')
            if (cfg.validationType === ValidationType.failFast || cfg.validationType === ValidationType.failSlow) {
              return ''
                + 'if('
                + `${$.isRequired ? '' : varName + '!==undefined && '}`
                + varName
                + '!==null){'
                + ( cfg.validationType === ValidationType.failFast 
                    ? (cfg.functionName + '.errors=[{' ) 
                    : ('errNo++;' + cfg.functionName + '.errors.push({' ) 
                  )
                + `path:"${path}",`
                + `schemaPath:"${schemaPath}",`
                + 'keyword:"type",'
                + `message:"must be null (was "+typeof ${varName}+")"`
                + ( cfg.validationType === ValidationType.failFast ? '}];return false;' : '});' )
                + '}'
            } else {
              return `if(${varName}!==null){return false;}`
            }
          }
        } 
        case Traversable.is.boolean(n): return { 
          GO($) {
            const varName = $.path.join('')
            const schemaPath = $.schemaPath.join('/') + '/'
            const path = $.rawPath.join('.')
            if (cfg.validationType === ValidationType.failFast || cfg.validationType === ValidationType.failSlow) {
              return ''
                + 'if('
                + `${$.isRequired ? '' : varName + '!==undefined && '}`
                + `typeof ${varName} !== "boolean"){`
                + ( cfg.validationType === ValidationType.failFast 
                    ? (cfg.functionName + '.errors=[{' ) 
                    : ('errNo++;' + cfg.functionName + '.errors.push({' ) 
                  )
                + `path:"${path}",`
                + `schemaPath:"${schemaPath}",`
                + 'keyword:"type",'
                + `message:"must be a boolean (was "+typeof ${varName}+")"`
                + ( cfg.validationType === ValidationType.failFast ? '}];return false;' : '});' )
                + '}'
            } else {
              return ''
                + 'if('
                + inlineOptionalityCheck($)
                + 'typeof '
                + $.path.join('')
                + '!=="boolean"'
                + ')return false;'
            }
          }
        } 
        case Traversable.is.integer(n): return { 
          GO($) {
            const varName = $.path.join('')
            const schemaPath = $.schemaPath.join('/') + '/'
            const path = $.rawPath.join('.')
            if (cfg.validationType === ValidationType.failFast || cfg.validationType === ValidationType.failSlow) {
              return ''
                + 'if('
                + `${$.isRequired ? '' : varName + '!==undefined && '}`
                + `!globalThis.Number.isInteger(${varName})){`
                + ( cfg.validationType === ValidationType.failFast 
                    ? (cfg.functionName + '.errors=[{' ) 
                    : ('errNo++;' + cfg.functionName + '.errors.push({' ) 
                  )
                + `path:"${path}",`
                + `schemaPath:"${schemaPath}",`
                + 'keyword:"type",'
                + `message:"must be an integer (was "+typeof ${varName}+")"`
                + ( cfg.validationType === ValidationType.failFast ? '}];return false;' : '});' )
                + '}'
            } else {
              return ''
                + 'if('
                + inlineOptionalityCheck($)
                + '!Number.isInteger('
                + $.path.join('')
                + '))return false;'
            }
          }
        } 

        case Traversable.is.number(n): return { 
          GO($) {
            const varName = $.path.join('')
            const schemaPath = $.schemaPath.join('/') + '/'
            const path = $.rawPath.join('.')
            if (cfg.validationType === ValidationType.failFast || cfg.validationType === ValidationType.failSlow) {
              return ''
                + 'if('
                + `${$.isRequired ? '' : varName + '!==undefined && '}`
                + `typeof ${varName} !== "number"){`
                + ( cfg.validationType === ValidationType.failFast 
                    ? (cfg.functionName + '.errors=[{' ) 
                    : ('errNo++;' + cfg.functionName + '.errors.push({' ) 
                  )
                + `path:"${path}",`
                + `schemaPath:"${schemaPath}",`
                + 'keyword:"type",'
                + `message:"must be a number (was "+typeof ${varName}+")"`
                + ( cfg.validationType === ValidationType.failFast ? '}];return false;' : '});' )
                + '}'
            } else {
              return ''
                + 'if('
                + inlineOptionalityCheck($)
                + `typeof ${$.path.join('')}!=="number")return false;`
            }
          }
        } 

        case Traversable.is.string(n): return { 
          GO($) {
            const varName = $.path.join('')
            const schemaPath = $.schemaPath.join('/') + '/'
            const path = $.rawPath.join('.')
            if (cfg.validationType === ValidationType.failFast || cfg.validationType === ValidationType.failSlow) {
              return ''
                + 'if('
                + `${$.isRequired ? '' : varName + '!==undefined && '}`
                + `typeof ${varName} !== "string"){`
                + ( cfg.validationType === ValidationType.failFast 
                    ? (cfg.functionName + '.errors=[{' ) 
                    : ('errNo++;' + cfg.functionName + '.errors.push({' ) 
                  )
                + `path:"${path}",`
                + `schemaPath:"${schemaPath}",`
                + 'keyword:"type",'
                + `message:"must be a string (was "+typeof ${varName}+")"`
                + ( cfg.validationType === ValidationType.failFast ? '}];return false;' : '});' )
                + '}'
            } else {
              return ''
                + 'if('
                + inlineOptionalityCheck($)
                + `typeof ${$.path.join('')}!=="string")return false;`
            }
          }
        } 

        case Traversable.is.allOf(n): return { 
          GO($) {
            if (
              cfg.validationType === ValidationType.failFast || 
              cfg.validationType === ValidationType.failSlow
            ) return ''
            else {
              const path = [ident($.depth), ...$.path.slice(1)]
              const $valid = `v${path.join('')}`
              return 'let ' + $valid + '=' + '[' 
                + n.allOf.map(([, xf], ix) => {
                  const schemaPath = [ix, 'allOf', ...$.schemaPath]
                  const { depth, rawPath } = $
                  const CHILD = xf.GO({ depth, index: ix, isRequired: true, path, rawPath, schemaPath })
                  return '(() => {' + CHILD + 'return true;})()'
                })
                .join(',')
                + '].every((_) => _ === true);' 
                + 'if(' + $valid + '!==true)return false;'
            }
          }
        }

        case Traversable.is.anyOf(n): return { 
          GO($) { 
            if (cfg.validationType === ValidationType.failFast || cfg.validationType === ValidationType.failSlow) {
              return ''
            } else {
              const path = [ident($.depth), ...$.path.slice(1)]
              const $valid = `v${path.join('')}`
              return 'let ' + $valid + '=' + '[' 
                + n.anyOf.map(([, xf], ix) => {
                  const schemaPath = [ix, 'anyOf', ...$.schemaPath]
                  const { depth, rawPath } = $
                  const CHILD = xf.GO({ depth, index: ix, isRequired: true, path, rawPath, schemaPath })
                  return '(() => {' + CHILD + 'return true;})()'
                })
                .join(',')
                + '].some((_) => _ === true);' 
                + 'if(' + $valid + '!==true)return false;'
            }
          }
        }

        case Traversable.is.oneOf(n): return {
          GO($) { 
            if (cfg.validationType === ValidationType.failFast || cfg.validationType === ValidationType.failSlow) {
              return ''
            } else {
              const path = [ident($.depth), ...$.path.slice(1)]
              const $valid = `v${path.join('')}`
              return 'let ' + $valid + '=['
                + n.oneOf.map(([, xf], ix) => {
                  const schemaPath = [ix, 'oneOf', ...$.schemaPath]
                  const { depth, rawPath } = $
                  const CHILD = xf.GO({ depth, index: ix, isRequired: true, path, rawPath, schemaPath })
                  return '(() => {' + CHILD + 'return true;})()'
                })
                .join(',')
                + '].filter((_) => _ === true);' 
                + 'if(' + $valid + '.length !==1)return false;'
            }
          }
        }

        case Traversable.is.tuple(n): return {
          GO($) {
            if (cfg.validationType === ValidationType.failFast || cfg.validationType === ValidationType.failSlow) {
              return ''
            }
            else {
              const $$_path = [ident($.depth), ...$.path.slice(1)]
              const $$_varname = $$_path.join('')
              const $reqOpen = $.isRequired ? '' : 'if(' + $$_varname + '!==undefined){'
              const $reqClose = $.isRequired ? '' : '}'
              const $check = `if(!Array.isArray(${$$_varname}))return false;`
              return '' 
                + $reqOpen 
                + $check 
                + n.items
                  .map(([x, ctx], ix) => {
                    const ix_ = tree.has('meta', 'originalIndex', core.is.number)(x) ? x.meta.originalIndex : ix
                    const path = [...$$_path, ix_]
                    const varname_ = path.join('')
                    const var_ = `let ${varname_}=${$$_varname}[${ix_}];`
                    return var_ + ctx.GO({ ...$, depth: $.depth, isRequired: true, path })
                  }).join('') 
                + $reqClose
            }
          },
        }

        case Traversable.is.array(n): {
          return {
            GO($) {
              if (cfg.validationType === ValidationType.failFast || cfg.validationType === ValidationType.failSlow) {
                return ''
              } else {
                const $prev = [ident($.depth), ...$.path.slice(1)].join('')
                const $reqOpen = $.isRequired ? '' : 'if(' + $.path.join('') + '!==undefined){'
                const $reqClose = $.isRequired ? '' : '}'
                const $check = `if(!globalThis.Array.isArray(${$prev}))return false;`
                const $loop = [`for(let i=0;i<${$prev}.length;i++){`, '}']
                const path = $.path.length === 0 ? [ident($.depth + 1)] : [ident($.depth + 1), ...$.path.slice(1)]
                const $var = path.join('')
                const $binding = `let ${$var}=${$prev}[i];`
                return ''
                  + $reqOpen
                  + $check
                  + $loop[0]
                  + $binding
                  + [n.items].map(([, ctx]) => ctx.GO({ ...$, depth: $.depth + 1, isRequired: true, path }))[0]
                  + $loop[1]
                  + $reqClose
              }
            },
          }
        }

        case Traversable.is.record(n): {
          return {
            GO($) {
              if (cfg.validationType === ValidationType.failFast || cfg.validationType === ValidationType.failSlow) {
                return ''
              } else {
                const $prev = [ident($.depth), ...$.path.slice(1)].join('')
                const arrayCheck = cfg.flags.treatArraysLikeObjects ? '' : `||globalThis.Array.isArray(${$prev})`
                const $reqOpen = $.isRequired ? '' : 'if(' + $.path.join('') + '!==undefined){'
                const $reqClose = $.isRequired ? '' : '}'
                const $check =
                  '' + `if(!${$prev}||typeof ${$prev}!=="object"` + arrayCheck + ')return false;'
                const $keys = `let $k${$.depth}=globalThis.Object.keys(${$prev});`
                const $inner = ident($.depth + 1, $.path.slice(1).join(''))
                const $binding = `let ${$inner}=${$prev}[$k${$.depth}[i]];`
                const $loop = [`for(let i=0;i<$k${$.depth}.length;i++){`, '}']
                const path = $.path.length === 0 ? [ident($.depth + 1)] : [ident($.depth + 1), ...$.path.slice(1)]
                return ''
                  + $reqOpen
                  + $check
                  + $keys
                  + $loop[0]
                  + $binding
                  + [n.additionalProperties].map(([, ctx]) => ctx.GO({ ...$, path, depth: $.depth + 1, isRequired: true }))[0]
                  + $loop[1]
                  + $reqClose
              }
            }
          }
        }

        case Traversable.is.object(n): return { GO: deriveObjectNode(cfg)(n) }
      }
    }
  }
}

const deriveObjectNode 
  : (cfg: Config) => (n: core.Traversable.objectF<[source: core.Traversable.F<Stream, never>, target: Stream]>) => ($: ContinuationContext) => string
  = (cfg) => (n) => ($) => {
    if (cfg.validationType === ValidationType.failFast || cfg.validationType === ValidationType.failSlow) {
      const $$_path = [ident($.depth), ...$.path.slice(1)]
      const $$_varname = $$_path.join('')
      const index = Object_keys(n.properties).map((k, ix) => [k, ix] satisfies [any, any])
      const required = index.filter(([k]) => (n.required || []).includes(k))
      const isObjVar = createIsObjectVarName($)
      const $$_check
        = `let ${isObjVar}=!!${$$_varname} && typeof ${$$_varname}==="object";`
        + 'if(' 
        + `!${isObjVar}`
        + (cfg.flags?.treatArraysLikeObjects ? '' : '||globalThis.Array.isArray(' + $$_varname + ')')
        + '){'
        + cfg.functionName
        + ( cfg.validationType === ValidationType.failFast ? '.errors=[{' : '.errors.push({' )
        + ([
            `path:"${$.rawPath.join('.')}"`,
            `schemaPath:"${$.schemaPath.join('/')}/"`,
            'keyword:"type"',
            `message:"must be an object (was "+typeof ${$$_varname}+")"`,
          ]).join(',')
        + ( cfg.validationType === ValidationType.failFast ? '}];' : '});' )
        + ( cfg.validationType === ValidationType.failFast ? 'return false;' : 'errNo++;' )
        + '}'

      const $$_property_checks = required.length === 0 ? null 
        : '(' 
        + required.reduce(
          (acc, [k, kix]) => {
            const accessor = `${$$_path.join('')}["${k}"]`
            const schemaPath = [...$.schemaPath, 'required']
            const rawPath = [...$.rawPath, k]
            return acc + (acc.length === 0 ? '' : ' || ') + (
              cfg.validationType === ValidationType.failFast ? ''
              : `(${isObjVar} && ${accessor}===undefined && (errNo++,void ${cfg.functionName}.errors.push({${
                [
                  `path:"${rawPath.join('.')}"`,
                  `schemaPath:"${schemaPath.join('/')}/"`,
                  'keyword:"required"',
                  `message:"must have required property '${k}'"`,
                ].join(',')
              }})))`
            )
          },
          ''
        )
        + ')'

      const CHILDREN = index
        .map(([k, ix]) => [k, n.properties[k], ix] satisfies [any, any, any])
        .map(([k, [, xf], ix]) => {
          const isRequired = (n.required ?? []).includes(k)
          const depth = $.depth + 1
          const path = [ident(depth), k, ...$.path.slice(1)]
          const schemaPath = [...$.schemaPath, 'properties', k]
          const rawPath = [...$.rawPath, k]
          const $_varname = path.join('')
          const var_ = `let ${$_varname}=${$$_varname}["${k}"];`
          const CHILD = xf.GO({ depth, index: ix, isRequired, path, rawPath, schemaPath })
          return `if(${isObjVar}){${var_}${CHILD}}`
        })

      const $$_reqOpen  = $.isRequired ? ( '' ) : ( 'if(' + $.path.join('') + '!==undefined){' )
      const $$_reqClose = $.isRequired ? ( '' ) : ( '}' )

      return '' 
        + $$_reqOpen
        + $$_check
        + ($$_property_checks === null ? '' : ('if(' + $$_property_checks + '){};'))
        + CHILDREN.join('')
        + $$_reqClose

    } else {
      const $$_path = [ident($.depth), ...$.path.slice(1)]
      const $$_varname = $$_path.join('')
      const CHILDREN = Object_entries(n.properties)
        .map(([k, [, xf]]) => {
          const isRequired = (n.required ?? []).includes(k)
          const path = [...$$_path, k]
          const $_varname = path.join('')
          const var_ = `let ${$_varname}=${$$_varname}['${k}'];`
          const CHILD = xf.GO({ ...$, path, isRequired })
          return var_ + CHILD
        })

      const $$_check
        = 'if(' 
        + (! $.isRequired ? $$_varname + '===null' : '!' + $$_varname)
        + '||'
        + 'typeof ' + $$_varname + '!=="object"' 
        + (cfg.flags?.treatArraysLikeObjects ? '' : '||globalThis.Array.isArray(' + $$_varname + ')')
        + ')'
        + 'return false;'

      const $$_reqOpen  = $.isRequired ? ( '' ) : ( 'if(' + $.path.join('') + '!==undefined){' )
      const $$_reqClose = $.isRequired ? ( '' ) : ( '}' )

      return '' 
        + $$_reqOpen
        + $$_check
        + CHILDREN.join('')
        + $$_reqClose
    }
  }

deriveValidator.defaults = defaults
deriveValidator.fold = ({ 
  compare = deriveValidator.defaults.compare,
  flags: { 
    treatArraysLikeObjects = defaults.flags.treatArraysLikeObjects,
    aheadOfTime = defaults.flags.aheadOfTime,
  } = defaults.flags,
  validationType = defaults.validationType,
}: Pick<Options, 'compare' | 'flags' | 'validationType'> = deriveValidator.defaults,
) =>
  fn.flow(
    Sort.derive({ compare }), 
    Traversable.fromJsonSchema,
    fn.para(Traversable.Functor)(RAlgebra.validator({ flags: { treatArraysLikeObjects, aheadOfTime }, validationType })), 
    (xf) => xf.GO({ depth: 0, index: 0, isRequired: true, path: [], rawPath: [], schemaPath: ['#'] }),
  );

/**
 * ## {@link derive `validator.derive`}
 *
 * Given a JSON Schema object, compiles a super fast validation function.
 *
 * All this function does is return true/false depending on whether the input
 * object satisfies the spec.
 */
function deriveValidator(schema: Traversable.orJsonSchema, options?: Options): string
function deriveValidator(
  schema: Traversable.orJsonSchema,
  {
    functionName = defaults.functionName,
    compare = defaults.compare,
    flags = defaults.flags,
    validationType = defaults.validationType,
  }: Options = deriveValidator.defaults,
) {
  const $_ = flags.aheadOfTime ? '' : ' '
  const $ReturnType = flags.aheadOfTime ? '' : ':' + $_ + '$0$ is ' + Type.derive.fold({ minify: flags.aheadOfTime })(schema)
  if (validationType === ValidationType.failSlow) {
    return fn.pipe(
      schema,
      deriveValidator.fold({ compare, flags, validationType }),
      (body) => '' 
        + `function${functionName && functionName.length > 0 ? (' ' + functionName) : ''}($0$${
          flags.aheadOfTime ? '' : ':any'
        })${$ReturnType}{` 
        + 'let errors=[];' + functionName + '.errors=errors;let errNo=0;if(errNo===0){'
        + body 
        + '}errNo===0&&(delete ' + functionName + '.errors);return errNo===0;}'
    )
  }
  else if (validationType === ValidationType.failFast) {
    return fn.pipe(
      schema,
      deriveValidator.fold({ compare, flags, validationType }),
      (body) => '' 
        + `function${functionName && functionName.length > 0 ? (' ' + functionName) : ''}($0$${
          flags.aheadOfTime ? '' : ':any'
        })${$ReturnType}{` 
        + 'let errors=null;let errNo=0;if(errNo===0){'
        + body 
        + '}errNo===0&&(delete ' + functionName + '.errors);return errNo===0;}'
    )
  }
  else {
    return fn.pipe(
      schema,
      deriveValidator.fold({ compare, flags, validationType }),
      (body) => 
        '' +
        (flags.aheadOfTime ? '(' : '') +
        `function${functionName && functionName.length > 0 ? ' ' + functionName : ''}($0$${
          flags.aheadOfTime ? '' : ':any'
        })${$ReturnType}{` +
        body +
        'return true;}' +
        (flags.aheadOfTime ? ')' : ''),
    )
  }
}
