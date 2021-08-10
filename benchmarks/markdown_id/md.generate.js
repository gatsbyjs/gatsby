const fs = require(`fs`)
const path = require(`path`)

const template = require(`./md.tpl.js`)

const root = `markdown-pages`

const MAX_NUM_ROWS = parseInt(process.env.MAX_NUM_ROWS || 25, 10)
if (
  typeof MAX_NUM_ROWS !== `number` ||
  !Number.isInteger(MAX_NUM_ROWS) ||
  MAX_NUM_ROWS <= 0
) {
  throw new Error(
    `Error: the value for MAX_NUM_ROWS is invalid: \`` +
      process.env.MAX_NUM_ROWS +
      `\``
  )
}
const NUM_PAGES = parseInt(process.env.NUM_PAGES || 1000)
if (
  typeof NUM_PAGES !== `number` ||
  !Number.isInteger(NUM_PAGES) ||
  NUM_PAGES <= 0
) {
  throw new Error(
    `Error: the value for MAX_NUM_ROWS is invalid: \`` +
      process.env.NUM_PAGES +
      `\``
  )
}

console.log(
  `Generating`,
  NUM_PAGES,
  `pseudo random md files in`,
  path.resolve(root)
)
if (!process.env.NUM_PAGES || process.env.NUM_PAGES === `2000`) {
  console.log(` Set \`NUM_PAGES=200\` to change the volume`)
}

if (!fs.existsSync(root)) {
  fs.mkdirSync(root, { recursive: true })
}

console.time(`Generated in`)
// Create markdown nodes
let p10 = Math.round(NUM_PAGES / 10)
for (let step = 0; step < NUM_PAGES; step++) {
  if (step > 0 && step % p10 === 0)
    console.log(`--> ` + (step / p10) * 10 + `%`)
  let page = template(step)
  let where = path.join(root, step + `.md`)
  fs.writeFileSync(where, page)
}
console.log(`--> 100%`)
console.timeEnd(`Generated in`)

console.log(`Should be written to`, path.resolve(root))
