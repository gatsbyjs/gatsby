// Run the provided script on all valid repos
const fs = require(`fs`)
const log4js = require(`log4js`)
const shell = require(`shelljs`)
const logger = log4js.getLogger(`run-all`)

require(`dotenv`).config()

function runAll(script) {
  if (!script) {
    logger.error(`Usage: yarn run-all <script-name>`)
    process.exit(1)
  }
  const langs = JSON.parse(fs.readFileSync(`../../www/i18n.json`))
  for (const { code } of langs) {
    shell.exec(`yarn ${script} ${code}`)
  }
}

const [script] = process.argv.slice(2)
runAll(script)
