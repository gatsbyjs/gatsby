import fs from "fs-extra"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const absPath = path.join(__dirname, "..", `./dist/internal.d.ts`)

if (!fs.existsSync(absPath)) {
  console.error(`Expected "internal.d.ts" file doesn't exist at "${absPath}`)
  process.exit(1)
}
