export default {
  "name": "@traversable/core",
  "type": "module",
  "version": "0.0.3",
  "private": false,
  "description": "a small, focused set of libraries that solve for a particular problem or use case",
  "repository": {
    "type": "git",
    "url": "https://github.com/traversable/traversable.git",
    "directory": "packages/core"
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
    "@traversable/data": "workspace:^",
    "@traversable/registry": "workspace:^",
    "any-ts": "0.48.1"
  },
  "peerDependenciesMeta": {
    "@traversable/data": {
      "optional": false
    },
    "@traversable/registry": {
      "optional": false
    },
    "any-ts": {
      "optional": false
    }
  },
  "devDependencies": {
    "@standard-schema/spec": "1.0.0-rc.0",
    "@traversable/bench": "workspace:^",
    "@traversable/data": "workspace:^"
  }
} as const