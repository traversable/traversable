import type { t } from "@traversable/core";
import type { Recursive } from "@traversable/registry";

const fromDisjoint
  // : <T extends t.any>(tree: T) => () => void
  = <T extends t.AST.F<unknown>>(tree: T) => {
    switch (true) {
      case tree._tag === "anyOf": 
    }
  }
