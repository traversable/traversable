import type { inline } from "@traversable/registry";

type Target<T> = T extends () => infer S ? S extends globalThis.Promise<infer R> ? R : S : T

export namespace vendor {
  export type zod = inline<Target<typeof zod>>
  export function zod(): globalThis.Promise<{ [K in keyof typeof import("zod")]: typeof import("zod")[K] }>
  export function zod(vendorPath = "zod") { return import(vendorPath) }

  export type fc = inline<Target<typeof fc>>
  export function fc(): globalThis.Promise<{ [K in keyof typeof import("fast-check")]: typeof import("fast-check")[K] }>
  export function fc(vendorPath = "fast-check") { return import(vendorPath) }

  export type faker = inline<Target<typeof faker>>
  export function faker(): globalThis.Promise<{ [K in keyof typeof import("@faker-js/faker")]: typeof import("@faker-js/faker")[K] }>
  export function faker(vendorPath = "@faker-js/faker") { return import(vendorPath) }
}
