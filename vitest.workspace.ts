import { defineWorkspace } from "vitest/config"

export default defineWorkspace([
  "packages/*",
  "app/*",
  "bin",
])
