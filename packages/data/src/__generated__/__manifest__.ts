export default {
  "name": "@traversable/data",
  "type": "module",
  "version": "0.0.3",
  "private": false,
  "description": "a standard library, organized by data structure",
  "repository": {
    "type": "git",
    "url": "https://github.com/traversable/traversable.git",
    "directory": "packages/data"
  },
  "bugs": {
    "url": "https://github.com/traversable/traversable/issues",
    "email": "ahrjarrett@gmail.com"
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
    "build:annotate": "babel build --plugins annotate-pure-calls --out-dir build --source-maps",
    "build:esm": "tsc -b tsconfig.build.json",
    "build:cjs": "babel build/esm --plugins @babel/transform-export-namespace-from --plugins @babel/transform-modules-commonjs --out-dir build/cjs --source-maps",
    "check": "tsc -b tsconfig.json",
    "clean": "pnpm run \"/^clean:.*/\"",
    "clean:build": "rm -rf .tsbuildinfo dist build",
    "clean:deps": "rm -rf node_modules",
    "test": "vitest"
  },
  "dependencies": {},
  "peerDependencies": {
    "@traversable/registry": "workspace:^",
    "any-ts": "0.48.1"
  },
  "peerDependenciesMeta": {
    "@traversable/registry": {
      "optional": false
    },
    "any-ts": {
      "optional": false
    }
  },
  "devDependencies": {
    "@traversable/bench": "workspace:^",
    "@traversable/registry": "workspace:^",
    "lodash.isequal": "^4.5.0"
  }
} as const