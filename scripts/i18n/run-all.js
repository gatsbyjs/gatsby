// Run the provided script on all valid repos
const fs = require(`fs`)
const shell = require(`shelljs`)

require(`dotenv`).config()

function runAll(script) {
  const langs = JSON.parse(fs.readFileSync(`../../www/i18n.json`))
  for (const { code } of langs) {
    shell.exec(`yarn ${script} ${code}`)
  }
}

const [script] = process.argv.slice(2)
runAll(script)
