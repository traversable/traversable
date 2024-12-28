import type { Extension } from "./extension.js"

export interface Config<F> {
  handlers: 
    & Partial<Extension.BuiltIns<F>> 
    & Partial<Extension.UserDefinitions<F>>
}
