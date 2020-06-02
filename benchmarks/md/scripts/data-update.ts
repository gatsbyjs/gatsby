import faker from "faker"
import frontMatter from "front-matter"
import fs from "fs-extra"
import glob from "glob"
import fetch from "node-fetch"

interface IArticleAttributes {
  articleNumber: Number
  title: String
  image: String
}

;(async () => {
  // get the first article file
  const [articleFilePath] = glob.sync(`./src/articles/**/*.md`)
  const articleFileContents = await fs.readFile(articleFilePath, `utf8`)

  // parse the frontmatter
  const { attributes }: { attributes: IArticleAttributes } = frontMatter(
    articleFileContents
  )

  // generate a new title
  const title = faker.random.words(Math.floor(Math.random() * 5) + 3)

  // add the new title
  const updatedArticleFile = articleFileContents.replace(
    attributes.title,
    title
  )

  // write back to the article file
  await fs.writeFile(articleFilePath, updatedArticleFile, `utf8`)

  console.log(`updated ${articleFilePath} with a new title`)

  // call webhooks if they exist
  if (
    process.env.BENCHMARK_MD_UPDATE_WEBHOOKS &&
    typeof process.env.BENCHMARK_MD_UPDATE_WEBHOOKS === `string`
  ) {
    const webhooks = process.env.BENCHMARK_MD_UPDATE_WEBHOOKS.split(`,`)

    for (const webhook of webhooks) {
      await fetch(webhook, { method: `POST` })
      console.log(`Sent a post request to ${webhook}`)
    }
  }
})()
