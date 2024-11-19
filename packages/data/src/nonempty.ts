import { type prop, type props } from "./_internal/_prop.js"
import { array_of } from "./_internal/_array.js"

export declare namespace nonempty {
  export { 
    nonempty_string as string,
  }
}

export declare namespace nonempty {
  type nonempty_string<H extends string, T extends string = string> = `${H}${T}`
  type props<
    T extends prop.any = prop.any, 
    U extends props.any = array_of<T>
  > = readonly [head: T, ...tail: U]

  type propsLeft<
    T extends props.any = props.any,
    U extends prop.any = prop.any,
  > = readonly [...lead: T, last: U]
}
