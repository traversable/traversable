import type { 
  finite,
  nonfinite,
} from "./_internal/_boolean.js"
import { 
  and,
  nand,
  nor,
  not,
  of,
  or,
  xor,
} from "./_internal/_boolean.js"

export declare namespace boolean {
  /// types
  export {
    finite,
    nonfinite,
  }
  /// terms
  export {
    and,
    of,
    nand,
    nor,
    not,
    or,
    xor,
  }
}

export namespace boolean {
  void (boolean.and = and);
  void (boolean.of = of);
  void (boolean.nand = nand);
  void (boolean.nor = nor);
  void (boolean.not = not);
  void (boolean.or = or);
  void (boolean.xor = xor);
}
