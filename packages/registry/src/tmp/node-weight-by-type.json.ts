export type WeightByType = typeof WeightByType
export const WeightByType = {
  "unknown": -1,
  "null": 0,
  "boolean": 10,
  "integer": 20,
  "number": 30,
  "string": 40,
  "const": 50,
  "oneOf": 100,
  "anyOf": 200,
  "allOf": 300,
  "record": 1000,
  "object": 1100,
  "tuple": 1200,
  "array": 1400,
} as const
