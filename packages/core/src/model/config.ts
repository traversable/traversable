import type { Extension } from "./extension.js"

export interface Config<F> {
  handlers: 
    & Partial<Extension.BuiltIns<F>> 
    & Partial<Extension.UserDefinitions<F>>
}

export interface ConfigWithMeta<F, Meta> {
  rootMeta: Meta
  handlers: 
    & Partial<Extension.BuiltIns<F>> 
    & Partial<Extension.UserDefinitionsWithMeta<F, Meta>>
}

export interface ConfigWithContext<F, Ix = any, Meta = {}> {
  handlers: 
    & Partial<Extension.BuiltInsWithContext<F, Ix>> 
    & Partial<Extension.UserDefinitionsWithContext<F, Ix, Meta>>
}
