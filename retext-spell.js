const fs = require(`fs`)

const words = fs.readFileSync(`./dictionary.txt`, `utf-8`).split(`\n`)
words.sort((a, b) => a.localeCompare(b))
// for (const word of words) {
//   console.log(word)
// }
fs.writeFileSync(`./dictionary.txt`, words.join(`\n`))
// const errors = fs.readFileSync(`./errors.txt`, `utf-8`)
// const matches = errors.matchAll(/`(.*)` is misspelt/g)

// const words = new Set()

// for (const match of matches) {
//   words.add(match[1])
// }

// const wordList = [...words]
// wordList.sort()

// for (const word of wordList) {
//   console.log(word)
// }
