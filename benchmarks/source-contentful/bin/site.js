const fs = require(`fs`)
const path = require(`path`)
const contentful = require(`contentful-management`)
const chalk = require("chalk")
const yargs = require("yargs")

require("dotenv").config({
  path: `.env.${process.env.NODE_ENV}`,
})

const locale = `en-US`
const contentfulConfig = {
  spaceId: process.env.BENCHMARK_CONTENTFUL_SPACE_ID,
  managementToken: process.env.BENCHMARK_CONTENTFUL_MANAGEMENT_TOKEN,
}

const { spaceId, managementToken } = contentfulConfig

if (!spaceId || !managementToken) {
  console.error(`Contentful space id and management API token are required.`)
  process.exit(1)
}

yargs
  .scriptName("site")
  .usage("$0 <command> [arguments]")
  .command({
    command: `setup [--skip=number]`,
    desc: `Setup new Contentful Benchmark Site from the dataset`,
    builder: yargs =>
      yargs.option(`skip`, {
        type: `number`,
        default: 0,
        description: `Skip this number of entries`,
      }),
    handler: ({ skip = 0 }) => {
      runSetup({ skip }).catch(console.error)
    },
  })
  .command({
    command: "find-broken-images",
    desc: `Find broken images in current contentful site`,
    handler: () => {
      runFindBrokenImages().catch(console.error)
    },
  })
  .command({
    command: "fix-broken-images <ids...>",
    desc: `Fix images found by find-broken-images`,
    handler: ({ ids }) => {
      runFixBrokenImages(ids).catch(console.error)
    },
  })
  .command({
    command: "data-update",
    desc: `Update random article (to trigger Contentful webhook)`,
    handler: () => {
      runDataUpdate().catch(console.error)
    },
  })
  .demandCommand(1)
  .help().argv

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
async function* readSourceArticles() {
  if (!fs.promises.opendir) {
    console.error(`This command requires Node 12.12+`)
    process.exit(1)
  }
  const inputDir = path.normalize(
    `${process.env.BENCHMARK_DATASOURCE_LOCAL_PATH}/data/${process.env.BENCHMARK_SITE_ID}`
  )
  if (!fs.existsSync(inputDir)) {
    console.error(`Could not find datasource directory: ${inputDir}`)
    process.exit(1)
  }
  const dir = await fs.promises.opendir(inputDir)
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

async function createEntries({ env, skip = 0 }) {
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

  if (skip) {
    console.log(`Skipping first ${chalk.yellow(skip)} articles`)
  }

  let total = 0
  let pending = []
  for await (const sourceArticle of readSourceArticles()) {
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

async function updateAssets({ env, assetIds }) {
  for await (const sourceArticle of readSourceArticles()) {
    const { asset: assetData } = extractEntities(sourceArticle)
    if (assetIds.has(assetData.sys.id)) {
      try {
        let asset = await env.getAsset(assetData.sys.id)
        try {
          asset = await asset.unpublish()
        } catch (e) {}
        asset = await asset.delete()
        asset = await createAsset(env, assetData)
        console.log(`Updated asset ${chalk.yellow(assetData.sys.id)}`)
      } catch (e) {
        console.warn(`Could not update asset ${chalk.yellow(assetData.sys.id)}`)
        console.log(e)
      }
    }
  }
}

async function findBrokenImages(env) {
  let assets
  let skip = 0
  let ids = []

  do {
    assets = await env.getAssets({ skip })
    for (let asset of assets.items) {
      const details = asset.fields.file[`en-US`].details
      if (!details || !details.image || !details.image.width) {
        ids.push(asset.sys.id)
      }
    }
    skip = assets.skip + assets.limit
  } while (assets && assets.items.length > 0)
  return ids
}

async function createClient() {
  const client = contentful.createClient({
    accessToken: contentfulConfig.managementToken,
  })

  const space = await client.getSpace(contentfulConfig.spaceId)
  const env = await space.getEnvironment(`master`)

  return { client, space, env }
}

async function runSetup({ skip }) {
  const { env } = await createClient()

  await createContentModel(env)
  console.log(`Content model ${chalk.green(`created`)}`)
  await createEntries({ env, skip })

  console.log(
    `All set! You can now run ${chalk.yellow(
      "gatsby develop"
    )} to see the site in action.`
  )
}

async function runFindBrokenImages() {
  const { env } = await createClient()
  const ids = await findBrokenImages(env)
  if (ids.length) {
    console.log(chalk.yellow(`Broken images:`))
    console.log(ids.join(` `))
    console.log(``)
  } else {
    console.log(chalk.green(`No broken images!`))
  }
}

async function runFixBrokenImages(ids) {
  if (!ids.length) {
    console.log(`Nothing to do: no broken images!`)
    return
  }
  const { env } = await createClient()
  console.log(`Fixing ${chalk.yellow(ids.length)} broken images`)
  await updateAssets({ env, assetIds: new Set(ids) })
}

async function runDataUpdate() {
  const { env } = await createClient()

  const entries = await env.getEntries({
    content_type: 'article',
    limit: 1
  })

  let entry = entries.items[0]
  const title = entry.fields.title[locale]
  entry.fields.title[locale] = `${title.substring(0, title.lastIndexOf(` `))} ${Date.now()}`

  entry = await entry.update()
  await entry.publish()
  console.log(`Updated ${chalk.green(entry.sys.id)}`)
}
