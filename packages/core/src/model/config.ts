// import type { Extension } from "./extension.js"
import type { Extension } from "./ext.js"

export interface Config<S, Ix> {
  handlers: 
    & Partial<Extension.BuiltIns<S, Ix>> 
    & Partial<Extension.UserDefs<S, Ix>>
}

// export interface ConfigWithMeta<F, Meta> {
//   rootMeta: Meta
//   handlers: 
//     & Partial<Extension.BuiltIns<F>> 
//     & Partial<Extension.UserDefinitionsWithMeta<F, Meta>>
// }

// export interface ConfigWithContext<F, Ix = any, Meta = {}> {
//   handlers: 
//     & Partial<Extension.BuiltInsWithContext<F, Ix>> 
//     & Partial<Extension.UserDefinitionsWithContext<F, Ix, Meta>>
// }
