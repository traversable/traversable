export namespace URI {
  export const Some = "@traversable/data/Option.Some" as const
  export type Some = typeof URI.Some
  export const None = "@traversable/data/Option.None" as const
  export type None = typeof URI.None
  export const Ok = "@traversable/data/Result.Ok" as const
  export type Ok = typeof URI.Ok
  export const Err = "@traversable/data/Result.Err" as const
  export type Err = typeof URI.Err
}
