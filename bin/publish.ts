import { execSync as $ } from "node:child_process"
import { Print } from "./util.js"

Print(Print.task(`Publishing project...`))
$(`pnpm changeset publish`)
