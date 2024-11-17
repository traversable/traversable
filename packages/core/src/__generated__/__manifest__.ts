export default {
  "name": "@traversable/core",
  "type": "module",
  "version": "0.0.1",
  "description": "a small, focused set of libraries that solve a particular problem or have a specific use case",
  "repository": {
    "type": "git",
    "url": "https://github.com/traversable/traversable",
    "directory": "packages/core"
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
    "@traversable/data": "workspace:^",
    "any-ts": "0.48.0"
  },
  "peerDependenciesMeta": {
    "@traversable/data": {
      "optional": false
    },
    "any-ts": {
      "optional": false
    }
  },
  "devDependencies": {
    "@traversable/data": "workspace:^",
    "@traversable/bench": "workspace:^"
  }
} as const