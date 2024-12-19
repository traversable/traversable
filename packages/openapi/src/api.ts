/** 
 * Implemement a single feature (TS types) from an OpenAPI document
 * 
 * 
 * - start with a query plan: given a document, what are we going to represent?
 * 
 * Unsolved problems:
 * - [ ] schema library?
 * - [ ] dependency graph?
 */

import { 
  core,
  is,
  tree,
} from "@traversable/core"
import { 
  Option, 
  array, 
  type entries,
  fn, 
  key,
  map, 
  object, 
  order, 
  pair, 
  string,
} from "@traversable/data"
import { http } from "@traversable/http"
// import { fs, path } from "@traversable/node"
import {  } from "@traversable/openapi"
import { Compare } from "@traversable/registry"


