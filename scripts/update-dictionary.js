/**
 * Updates `dictionary.txt` with new words that appear in the docs text.
 * These new words can be checked for misspellings using the Git diffs.
 */
const { execSync } = require(`child_process`)
const fs = require(`fs`)

// Strip the string
function trim(str) {
  // `*` is used to negate words, so negated words should be put with the original word
  // e.g. npm, *NPM
  return str.replace(/^\*/, ``)
}

function compareWords(a, b) {
  // The empty string should go at the end
  if (a === ``) return 1
  if (b === ``) return -1
  // Compare the two words
  return trim(a).localeCompare(trim(b))
}

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
wordList.sort(compareWords)

// Write back to the dictionary file
fs.writeFileSync(`./dictionary.txt`, wordList.join(`\n`))
console.log(`Updated \`dictionary.txt\`.`)
