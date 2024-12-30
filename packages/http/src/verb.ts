import { t } from "@traversable/core"
import { array, object } from "@traversable/data"

export { type AnyVerb as any, Verbs as all, Verb as enum, isAnyVerb as isAny, isSpecificVerb as is }

const Verbs = array.of("delete", "get", "patch", "post", "put")
//    ^?

const isAnyVerb = array.includes(Verbs)
const isSpecificVerb: <Verb extends AnyVerb>(verb: Verb) => (u: unknown) => u is Verb = t.is.literally

// export type HttpMethod = (typeof HttpMethod)[keyof typeof HttpMethod]
type Verb = typeof Verb
const Verb = object.fromKeys(Verbs)
//    ^?

type AnyVerb = (typeof Verbs)[number]
