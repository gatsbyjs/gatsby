const fs = require(`fs-extra`)
const path = require(`path`)

const absPath = path.join(__dirname, '..', `./dist/internal.d.ts`)

if (!fs.existsSync(absPath)) {
  console.error(`Expected "internal.d.ts" file doesn't exist at "${absPath}`)
  process.exit(1)
}