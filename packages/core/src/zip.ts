export {
  zip_arrays as arrays,
  zip_keys as keys,
  zip_objects as objects,
  zip_records as records,
}

type zip_arrays<T extends readonly unknown[], U extends readonly unknown[] = T> = never | ([left: T[number], right: U[number]])[]
function zip_arrays<T extends readonly unknown[]>(xs: T, ys: T): zip_arrays<T>
function zip_arrays<T extends readonly unknown[], U extends readonly unknown[]>(xs: T, ys: U): zip_arrays<T, U>
function zip_arrays<T extends readonly unknown[]>(xs: T, ys: T): zip_arrays<T> {
  let out: zip_arrays<T> = []
  for(let ix = 0, len = globalThis.Math.max(xs.length, ys.length); ix < len; ix++) 
    out[ix] = [xs[ix], ys[ix]]
  return out
}
export type zip_keys<T> = (keyof T)[]
export function zip_keys<T extends { [x: string]: unknown }>(xs: T, ys: T): zip_keys<T> {
  const xsKeys = globalThis.Object.keys(xs)
  const ysKeys = globalThis.Object.keys(ys)
  let index = new globalThis.Set<keyof T>()
  for (let ix = 0, len = xsKeys.length; ix < len; ix++) index.add(xsKeys[ix])
  for (let ix = 0, len = ysKeys.length; ix < len; ix++) index.add(ysKeys[ix])
  return globalThis.Array.from(index)
}

type zip_objects<T> = (readonly [key: keyof T, value: readonly [T[keyof T], T[keyof T]]])[]
function zip_objects<T extends { [x: string]: unknown }>(xs: T, ys: T): zip_objects<T> {
  const allKeys = zip_keys(xs, ys)
  let out: zip_objects<T> = []
  for (let ix = 0, len = allKeys.length; ix < len; ix++) 
    out[ix] = [allKeys[ix], [xs[allKeys[ix]], ys[allKeys[ix]]]]
  return out
}

type zip_records<T> = (readonly [T[keyof T], T[keyof T]])[]
function zip_records<T extends { [x: string]: unknown }>(xs: T, ys: T): zip_records<T> {
  const allKeys = zip_keys(xs, ys)
  let out: zip_records<T> = []
  for (let ix = 0, len = allKeys.length; ix < len; ix++) 
    out[ix] = [xs[allKeys[ix]], ys[allKeys[ix]]]
  return out
}
