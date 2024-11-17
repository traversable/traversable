export default {
  "name": "@traversable/openapi",
  "type": "module",
  "version": "0.0.0",
  "description": "Utilities for parsing and generating OpenAPI documents",
  "repository": {
    "type": "git",
    "url": "https://github.com/traversable/traversable",
    "directory": "packages/openapi"
  },
  "@traversable": {
    "generateExports": {
      "include": ["**/*.ts"]
    },
    "generateIndex": {
      "include": ["**/*.ts"]
    }
  },
  "publishConfig": {
    "directory": "dist"
  },
  "scripts": {
    "bench": "echo NOTHING TO BENCH",
    "build": "pnpm build:esm && pnpm build:cjs && pnpm build:annotate",
    "build:esm": "tsc -b tsconfig.build.json",
    "build:cjs": "babel build/esm --plugins @babel/transform-export-namespace-from --plugins @babel/transform-modules-commonjs --out-dir build/cjs --source-maps",
    "build:annotate": "babel build --plugins annotate-pure-calls --out-dir build --source-maps",
    "check": "tsc -b tsconfig.json",
    "clean": "pnpm run \"/^clean:.*/\"",
    "clean:build": "rm -rf .tsbuildinfo dist build",
    "clean:deps": "rm -rf node_modules",
    "test": "vitest"
  },
  "peerDependencies": {
    "@traversable/core": "workspace:^",
    "@traversable/data": "workspace:^",
    "any-ts": "0.48.0"
  },
  "peerDependenciesMeta": {
    "@traversable/data": { "optional": false },
    "@traversable/core": { "optional": false },
    "any-ts": { "optional": false }
  },
  "devDependencies": {
    "@traversable/bench": "workspace:^"
  }
} as const