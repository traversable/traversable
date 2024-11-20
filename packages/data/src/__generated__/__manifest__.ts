export default {
  "name": "@traversable/data",
  "type": "module",
  "version": "0.0.2",
  "description": "A standard library, organized by data structure",
  "repository": {
    "type": "git",
    "url": "https://github.com/traversable/traversable",
    "directory": "packages/data"
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
    "directory": "dist",
    "registry": "https://npm.pkg.github.com"
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
    "any-ts": "0.48.1"
  },
  "peerDependenciesMeta": {
    "any-ts": {
      "optional": false
    }
  },
  "devDependencies": {
    "@traversable/bench": "workspace:^"
  }
} as const