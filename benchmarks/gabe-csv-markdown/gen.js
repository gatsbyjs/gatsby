const fs = require("fs")
const path = require("path")
const faker = require(`faker`)

console.log("Start of gen")

const N = parseInt(process.env.N, 10) || 100
const FILE = path.resolve("gendata.csv")

// We may want to tweak this a little but for this purpose we have a CSV with one column; the full page contents
// We then hand that off to markdown

console.log("Now generating " + N + " articles into", FILE)
fs.writeFileSync(FILE, "articleContent\n")

function createArticle(n) {
  const title = faker.lorem.sentence()
  const desc = faker.lorem.sentence()
  const slug = faker.helpers.slugify(title).toLowerCase()
  const date = faker.date.recent(1000).toISOString().slice(0, 10)
  const tags = faker.random
    .words(3)
    .split(` `)
    .map(w => `"${w}"`)
    .join(`, `)

  const pageContent = `---
articleNumber: ${n}
title: "${title.replace(/"/g, '\\"')}"
description: "${desc.replace(/"/g, '\\"')}"
slug: '${slug}'
date: ${date}
---

# ${title}

> ${desc}

${faker.lorem.paragraphs()}

${faker.lorem.paragraphs()}
  `

  // Note: you can only escape double quotes (by doubling them, not by backslash)
  //       any other content needs to be wrapped in double quotes and is consumed as-is (including newlines and commas)
  fs.appendFileSync(
    FILE,

    '"' + pageContent
      .trim()
      .replace(/"/g, '""')
      + '"' +
      "\n" // markdown does care about newlines
  )
}

for (let i = 0; i < N; ++i) {
  createArticle(i)
}

console.log("Finished generating " + N + " articles into", FILE)
console.log("End of gen")
