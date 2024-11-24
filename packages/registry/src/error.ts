export const UnmatchedScalar =
  (functionName: string) =>
  (x: unknown): never => {
    throw globalThis.Error(
      `[\`${functionName}\`]: expected a scalar value, got: ` + JSON.stringify(x, null, 2),
    )
  }
