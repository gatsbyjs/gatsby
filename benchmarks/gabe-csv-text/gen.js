const fs = require("fs")
const path = require("path")
const faker = require(`faker`)

console.log("Start of gen")

const N = parseInt(process.env.N, 10) || 100
const FILE = path.resolve("gendata.csv")

console.log("Now generating " + N + " articles into", FILE)
fs.writeFileSync(FILE, "articleNumber,title,description,slug,date,html\n")

function createArticle(n) {
  const title = faker.lorem.sentence()
  const slug = faker.helpers.slugify(title).toLowerCase()
  const desc = faker.lorem.sentence()
  const date = faker.date.recent(1000).toISOString().slice(0, 10)
  fs.appendFileSync(
    FILE,
    [
      String(n),
      title,
      desc,
      slug,
      date,
      `
<p>${faker.lorem.paragraphs(1)}</p>
<p>${faker.lorem.paragraphs(1)}</p>
      `,
    ]
      // Can only escape double quotes, by doubling them
      .map(s => s.trim().replace(/"/g, '""'))
      // Can only use commas and newlines in text by double-quote wrapping them. Or by removing them
      .map(s => `"${s}"`)
      .join(",") + "\n"
  )
}

for (let i = 0; i < N; ++i) {
  createArticle(i)
}

console.log("Finished generating " + N + " articles into", FILE)
console.log("End of gen")
