const { execSync } = require(`child_process`)
const fs = require(`fs`)

const oldWords = fs.readFileSync(`./dictionary.txt`, `utf-8`).split(`\n`)

let errors
try {
  execSync(`yarn lint:docs`, { encoding: `utf-8` })
} catch (e) {
  errors = e.stderr
}
const matches = errors.matchAll(/`(.*)` is misspelt/g)

const newWords = new Set()
for (const match of matches) {
  newWords.add(match[1])
}

const words = [...oldWords, ...newWords]
words.sort((a, b) => a.localeCompare(b))

fs.writeFileSync(`./dictionary.txt`, words.join(`\n`))
