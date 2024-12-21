import { defineConfig, mergeConfig } from "vitest/config"
import sharedConfig from "../../vitest.shared.js"

const localConfig = defineConfig({})

export default mergeConfig(sharedConfig, localConfig)