import faker from "faker"
import frontMatter from "front-matter"
import fs from "fs-extra"
import glob from "glob"
;(async () => {
  // get the first article file
  const [articleFilePath] = glob.sync(`./src/articles/**/*.mdx`)
  const articleFileContents = await fs.readFile(articleFilePath, `utf8`)

  // parse the frontmatter
  const { attributes }: any = frontMatter(articleFileContents)

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
})()
