import { defineConfig, mergeConfig } from "vitest/config"
import sharedConfig from "../../vitest.config.js"

const localConfig = defineConfig({
  test: {
    // reporters: ["hanging-process"]
    reporters: [["default", { summary: false }]],
  }
})

export default mergeConfig(sharedConfig, localConfig)
