const fs = require("fs-extra")
const faker = require(`faker`)

const N = parseInt(process.env.N, 10) || 100

function createArticle(n, sentence, slug) {
  const desc = faker.lorem.sentence()

  return {
    articleNumber: String(n),
    title: sentence,
    description: desc,
    slug,
    date: faker.date.recent(1000).toISOString().slice(0, 10),
    html: [faker.lorem.paragraphs(), faker.lorem.paragraphs()],
  }
}

(async function() {
  console.log("Start of gen")

  console.log("Now generating " + N + " articles")
  let comma = '';
  await fs.writeFile("gendata.json", "[\n") // Replace contents, regardless
  for (let i = 0; i < N; ++i) {
    const sentence = faker.lorem.sentence()
    const slug = faker.helpers.slugify(sentence).toLowerCase()
    await fs.appendFile(
      "gendata.json",
      comma + JSON.stringify(createArticle(i, sentence, slug)) + "\n"
    )

    comma = ',' // No comma before the first entry, no comma after the last
  }
  await fs.appendFile("gendata.json", "]\n")
  console.log("Finished generating " + N + " articles")

  console.log("End of gen")
})();

