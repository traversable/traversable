export const PACKAGES = [
	"packages/bench",
	"packages/core",
	"packages/data",
	"packages/http",
	"packages/interpret",
	"packages/openapi",
	"packages/registry"
] as const
export type PACKAGES = typeof PACKAGES