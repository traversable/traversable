import type { array_of } from "./_internal/_array.js"
import type { prop, props } from "./_internal/_prop.js"
import type { key, keys } from "./_internal/_key.js"

export declare namespace nonempty {
  export { 
    nonempty_string as string,
  }
}

export declare namespace nonempty {
  type nonempty_string<H extends string, T extends string = string> = `${H}${T}`
  type array<
    T = unknown, 
    U extends readonly unknown[] = readonly T[]
  > = readonly [head: T, ...tail: U]

  type arrayOf<
    Invariant,
    T extends Invariant = Invariant, 
    U extends readonly Invariant[] = readonly Invariant[]
  > = readonly [head: T, ...tail: U]

  type props<
    T extends prop.any = prop.any, 
    U extends props.any = array_of<T>
  > = readonly [head: T, ...tail: U]

  type propsLeft<
    T extends props.any = props.any,
    U extends prop.any = prop.any,
  > = readonly [...lead: T, last: U]

  type keysLeft<
    T extends keys.any = keys.any,
    U extends key.any = key.any,
  > = readonly [...lead: T, last: U]

  namespace mut {
    type props<
      T extends prop.any = prop.any, 
      U extends props.any = array_of<T>
    > = [head: T, ...tail: U]
    type propsLeft<
      T extends props.any = props.any,
      U extends prop.any = prop.any,
    > = [...lead: T, last: U]
  }
}
