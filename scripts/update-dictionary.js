/**
 * Updates `dictionary.txt` with new words that appear in the docs text.
 * These new words can be checked for misspellings using the Git diffs.
 */
const { execSync } = require(`child_process`)
const fs = require(`fs`)

// Get our current list of words
const words = new Set(fs.readFileSync(`./dictionary.txt`, `utf-8`).split(`\n`))

// Run remark and track all "spelling errors"
let matches = []
try {
  execSync(`yarn lint:docs`, { encoding: `utf-8` })
} catch (e) {
  matches = (e.stderr || ``).matchAll(/`(.*)` is misspelt/g)
}

// Add all unknown words to our list of words
for (const match of matches) {
  words.add(match[1])
}

const wordList = [...words]
// Sort in alphabetical order for convenience
wordList.sort((a, b) => a.localeCompare(b))

// Write back to the dictionary file
fs.writeFileSync(`./dictionary.txt`, wordList.join(`\n`))
