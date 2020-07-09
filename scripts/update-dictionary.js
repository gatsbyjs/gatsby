/**
 * Updates `dictionary.txt` with new words that appear in the docs text.
 * These new words can be checked for misspellings using the Git diffs.
 */
const { execSync } = require(`child_process`)
const fs = require(`fs`)

// Get our current list of words
const words = new Set(fs.readFileSync(`./dictionary.txt`, `utf-8`).split(`\n`))

// Run remark and track all "spelling errors"
console.log(`Running \`yarn lint:docs\`...`)
const matches = new Set()
try {
  execSync(`yarn lint:docs`, { encoding: `utf-8`, stdio: `pipe` })
} catch (e) {
  for (const match of (e.stderr || ``).matchAll(/`(.*)` is misspelt/g)) {
    matches.add(match[1])
  }
}

if (matches.size === 0) {
  console.log(`No new words/misspellings found. Exiting...`)
  process.exit(0)
}

console.log(`Found ${matches.size} new words:`)

// Add all unknown words to our list of words
for (const match of matches) {
  console.log(match)
  words.add(match)
}

const wordList = [...words]
// Sort in alphabetical order for convenience
wordList.sort((a, b) => a.localeCompare(b))

// Write back to the dictionary file
fs.writeFileSync(`./dictionary.txt`, wordList.join(`\n`))
console.log(`Updated \`dictionary.txt\`.`)
