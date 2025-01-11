export default {
  "name": "@traversable/algebra",
  "type": "module",
  "version": "0.0.0",
  "private": false,
  "description": "",
  "repository": {
    "type": "git",
    "url": "https://github.com/traversable/traversable.git",
    "directory": "packages/algebra"
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
  "dependencies": {
    "@traversable/registry": "workspace:^"
  },
  "peerDependencies": {
    "@traversable/bench": "workspace:^",
    "@traversable/core": "workspace:^",
    "@traversable/data": "workspace:^",
    "@traversable/http": "workspace:^",
    "@traversable/openapi": "workspace:^",
    "@traversable/registry": "workspace:^"
  },
  "devDependencies": {
    "@traversable/bench": "workspace:^",
    "@traversable/core": "workspace:^",
    "@traversable/data": "workspace:^",
    "@traversable/http": "workspace:^",
    "@traversable/openapi": "workspace:^",
    "@traversable/registry": "workspace:^",
    "arktype": "2.0.0-rc.30",
    "chokidar": "^4.0.3",
    "zod": "^3.24.1"
  }
} as const