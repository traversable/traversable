export default {
  "name": "@traversable/http",
  "type": "module",
  "version": "0.0.0",
  "private": true,
  "description": "",
  "repository": {
    "type": "git",
    "url": "https://github.com/traversable/traversable.git",
    "directory": "packages/http"
  },
  "@traversable": {
    "generateExports": { "include": ["**/*.ts"] },
    "generateIndex": { "include": ["**/*.ts"] }
  },
  "publishConfig": { "directory": "dist" },
  "scripts": {
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
  "peerDependencies": { "@traversable/core": "workspace:^", "@traversable/data": "workspace:^" },
  "devDependencies": { "@traversable/core": "workspace:^", "@traversable/data": "workspace:^" }
} as const