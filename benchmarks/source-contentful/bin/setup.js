const fs = require(`fs`)
const path = require(`path`)
const contentful = require(`contentful-management`)
const chalk = require("chalk")

require("dotenv").config({
  path: `.env.${process.env.NODE_ENV}`,
})

const siteId = process.env.BENCHMARK_SITE_ID
const inputDir = path.normalize(
  `${process.env.BENCHMARK_DATASOURCE_LOCAL_PATH}/data/${siteId}`
)
if (!fs.promises.opendir) {
  console.error(`This script requires Node 12.12+`)
  process.exit(1)
}
if (!fs.existsSync(inputDir)) {
  console.error(`Could not find datasource directory: ${inputDir}`)
  process.exit(1)
}

const locale = `en-US`
const contentfulConfig = {
  spaceId: process.env.BENCHMARK_CONTENTFUL_SPACE_ID,
  managementToken: process.env.BENCHMARK_CONTENTFUL_MANAGEMENT_TOKEN,
}

const { spaceId, managementToken } = contentfulConfig

if (!spaceId || !managementToken) {
  console.error(
    `Contentful space id and management API token are required.`
  )
  process.exit(1)
}

/**
 * Transforms an article from source dataset to contentful data model
 */
function extractEntities(sourceArticle) {
  // Each article image is supposed to be a unique asset
  const fileName = sourceArticle.image.url.match(/[^/]+$/)[0]
  const asset = {
    sys: { id: `image${sourceArticle.articleNumber}` },
    fields: {
      title: { [locale]: fileName },
      description: { [locale]: sourceArticle.title },
      file: {
        [locale]: {
          upload: sourceArticle.image.url,
          fileName,
          contentType: `image/jpeg`,
        },
      },
    },
  }

  const article = {
    sys: { id: `article${sourceArticle.articleNumber}` },
    fields: {
      title: { [locale]: sourceArticle.title },
      body: { [locale]: sourceArticle.content },
      slug: { [locale]: `article${sourceArticle.articleNumber}` },
      image: {
        [locale]: {
          sys: {
            type: `Link`,
            linkType: `Asset`,
            id: asset.sys.id,
          },
        },
      },
    },
  }

  return { article, asset }
}

// Node 12.12+
async function* readSourceArticles(directory) {
  const dir = await fs.promises.opendir(directory)
  for await (const dirent of dir) {
    if (dirent.isFile() && /\.json$/.test(dirent.name)) {
      const content = fs.readFileSync(path.join(inputDir, dirent.name))
      const articles = JSON.parse(content)
      for (const article of articles) {
        yield article
      }
    }
  }
}

async function createContentModel(env) {
  const articleType = {
    displayField: "title",
    name: "Article",
    description: "",
    fields: [
      {
        id: "title",
        name: "title",
        type: "Symbol",
        localized: false,
        required: false,
        validations: [],
        disabled: false,
        omitted: false,
      },
      {
        id: "body",
        name: "body",
        type: "Text",
        localized: false,
        required: false,
        validations: [],
        disabled: false,
        omitted: false,
      },
      {
        id: "image",
        name: "image",
        type: "Link",
        localized: false,
        required: false,
        validations: [
          {
            linkMimetypeGroup: ["image"],
          },
        ],
        disabled: false,
        omitted: false,
        linkType: "Asset",
      },
      {
        id: "slug",
        name: "slug",
        type: "Symbol",
        localized: false,
        required: false,
        validations: [],
        disabled: false,
        omitted: false,
      },
    ],
  }
  let contentType
  try {
    contentType = await env.createContentTypeWithId(`article`, articleType)
  } catch (e) {
    if (e.name === `VersionMismatch`) {
      // Type already exists
      contentType = await env.getContentType(`article`)
      const { sys, ...fields } = articleType
      Object.assign(contentType, fields)
      contentType = await contentType.update()
    } else {
      throw e
    }
  }
  return contentType.publish()
}

async function createAsset(env, assetData) {
  let asset
  try {
    asset = await env.createAssetWithId(assetData.sys.id, assetData)
  } catch (e) {
    if (e.name === `VersionMismatch`) {
      return false
    } else {
      throw e
    }
  }
  try {
    asset = await asset.processForAllLocales()
    await asset.publish()
  } catch (e) {
    console.warn(`Error processing ${chalk.yellow(assetData.sys.id)}`)
    console.log(e)
  }
  return true
}

async function createArticle(env, articleData) {
  let article
  try {
    article = await env.createEntryWithId(
      `article`,
      articleData.sys.id,
      articleData
    )
    await article.publish()
    return true
  } catch (e) {
    if (e.name === `VersionMismatch`) {
      return false
    } else {
      throw e
    }
  }
}

const resolveSkip = () => {
  const index = process.argv.findIndex(param => param === `--skip`)
  if (index >= 0) {
    const skipValue = process.argv[index + 1]
    return Number(skipValue) || 0
  }
  return 0
}

async function createEntries(env) {
  const processBatch = sourceArticles =>
    Promise.all(
      sourceArticles.map(async sourceArticle => {
        const { asset, article } = extractEntities(sourceArticle)
        const assetCreated = await createAsset(env, asset)
        const articleCreated = await createArticle(env, article)
        console.log(
          `Processed ${chalk.green(article.sys.id)} (` +
          `asset ${assetCreated ? `created` : chalk.yellow(`exists`)}, ` +
          `article ${articleCreated ? `created` : chalk.yellow(`exists`)})`
        )
      })
    )

  const skip = resolveSkip()

  if (skip) {
    console.log(`Skipping first ${chalk.yellow(skip)} articles`)
  }

  let total = 0
  let pending = []
  for await (const sourceArticle of readSourceArticles(inputDir)) {
    if (total++ < skip) {
      continue
    }
    pending.push(sourceArticle)
    if (pending.length > 5) {
      await processBatch(pending)
      pending = []
    }
  }
  if (pending.length > 0) {
    await processBatch(pending)
  }
}

async function run() {
  const client = contentful.createClient({
    accessToken: contentfulConfig.managementToken,
  })

  const space = await client.getSpace(contentfulConfig.spaceId)
  const env = await space.getEnvironment(`master`)

  // Create content model only:
  createContentModel(env)
    .then(() => {
      console.log(`Content model ${chalk.green(`created`)}`)
    })
    .then(() => createEntries(env))
    .then(() => {
      console.log(
        `All set! You can now run ${chalk.yellow(
          "gatsby develop"
        )} to see the site in action.`
      )
    })
    .catch(error => console.error(error))
}

run().catch(console.error)
