export declare namespace prop {
  export { prop_any as any }
  export type prop_any<T extends string | number = string | number> = T
  export type from<T> = globalThis.Extract<T, prop.any>
  export type and<T> = T & prop.any
}

export namespace prop {
  export const is = (u: unknown): u is prop.any => ["number", "string"].includes(typeof u)
}

export declare namespace props {
  export { props_any as any }
  export type props_any<T extends readonly prop.any[] = readonly prop.any[]> = T
  export type and<T> = T & props.any
  export type from<T extends readonly unknown[]> 
    = readonly [any, ...any[]] extends T 
    ? globalThis.Extract<readonly [prop.any, ...props.any], T> 
    : globalThis.Extract<T, props.any>
    ;
}

export namespace props {
  export const is = (u: unknown): u is props.any => globalThis.Array.isArray(u) && u.every(prop.is)
}
