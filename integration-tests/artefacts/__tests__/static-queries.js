const fs = require(`fs-extra`)
const { spawn } = require(`child_process`)
const path = require(`path`)
const { murmurhash } = require(`babel-plugin-remove-graphql-queries`)
const { getFilePath } = require(`gatsby/dist/utils/page-data`)
const { stripIgnoredCharacters } = require(`gatsby/graphql`)

jest.setTimeout(100000)

const gatsbyBin = path.join(`node_modules`, `.bin`, `gatsby`)

const titleQuery = `
  {
    site {
      siteMetadata {
        title
      }
    }
  }
`

const authorQuery = `
  {
    site {
      siteMetadata {
        author
      }
    }
  }
`

async function readPageData(pagePath) {
  const pathToFile = getFilePath(
    { publicDir: path.join(process.cwd(), `public`) },
    pagePath
  )
  return fs.readJSON(pathToFile)
}

function hashQuery(query) {
  const text = stripIgnoredCharacters(query)
  const hash = murmurhash(text, `abc`)
  return String(hash)
}

describe(`Static Queries`, () => {
  beforeAll(async done => {
    const gatsbyProcess = spawn(gatsbyBin, [`build`], {
      stdio: [`inherit`, `inherit`, `inherit`, `inherit`],
      env: {
        ...process.env,
        NODE_ENV: `production`,
      },
    })

    gatsbyProcess.on(`exit`, exitCode => {
      done()
    })
  })

  test(`are written correctly when inline`, async () => {
    const queries = [titleQuery]
    const pagePath = `/inline/`

    const { staticQueryHashes } = await readPageData(pagePath)

    expect(staticQueryHashes).toBe(queries.map(hashQuery))
  })

  test(`are written correctly when imported`, async () => {
    const queries = [titleQuery]
    const pagePath = `/imported/`

    const { staticQueryHashes } = await readPageData(pagePath)

    expect(staticQueryHashes).toEqual(queries.map(hashQuery))
  })
})
