import { execSync as $ } from "node:child_process"
import { Print } from "./util.js"

Print(Print.task(`Versioning packages...`))
$(`pnpm changeset version`)
$(`pnpm install --lockfile-only`)
$(`pnpm run build:pre`)
