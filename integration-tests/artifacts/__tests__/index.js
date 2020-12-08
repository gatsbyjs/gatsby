const { spawn } = require(`child_process`)
const path = require(`path`)
const { murmurhash } = require(`babel-plugin-remove-graphql-queries`)
const { readPageData } = require(`gatsby/dist/utils/page-data`)
const { stripIgnoredCharacters } = require(`gatsby/graphql`)
const fs = require(`fs`)

jest.setTimeout(100000)

const publicDir = path.join(process.cwd(), `public`)

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

const githubQuery = `
  {
    site {
      siteMetadata {
        github
      }
    }
  }
`

const moreInfoQuery = `
  {
    site {
      siteMetadata {
        moreInfo
      }
    }
  }
`

function hashQuery(query) {
  const text = stripIgnoredCharacters(query)
  const hash = murmurhash(text, `abc`)
  return String(hash)
}

const globalQueries = [githubQuery, moreInfoQuery]

const pagePathToFilePath = {
  html: pagePath => path.join(`public`, pagePath, `index.html`),
  "page-data": pagePath =>
    path.join(
      `public`,
      `page-data`,
      pagePath === `/` ? `index` : pagePath,
      `page-data.json`
    ),
}

function assertFileExistenceForPagePaths({ pagePaths, type, shouldExist }) {
  if (![`html`, `page-data`].includes(type)) {
    throw new Error(`Unexpected type`)
  }

  test.each(pagePaths)(
    `${type} file for "%s" ${shouldExist ? `exists` : `DOESN'T exist`}`,
    async pagePath => {
      const filePath = pagePathToFilePath[type](pagePath)
      const exists = await new Promise(resolve => {
        fs.stat(filePath, err => {
          resolve(err === null)
        })
      })

      expect(exists).toBe(shouldExist)
    }
  )
}

beforeAll(async done => {
  const gatsbyCleanProcess = spawn(gatsbyBin, [`clean`], {
    stdio: [`inherit`, `inherit`, `inherit`, `inherit`],
    env: {
      ...process.env,
      NODE_ENV: `production`,
    },
  })

  gatsbyCleanProcess.on(`exit`, exitCode => {
    done()
  })
})

describe(`First run`, () => {
  beforeAll(async done => {
    const gatsbyProcess = spawn(gatsbyBin, [`build`], {
      stdio: [`inherit`, `inherit`, `inherit`, `inherit`],
      env: {
        ...process.env,
        NODE_ENV: `production`,
        RUN_FOR_STALE_PAGE_ARTIFICATS: `1`,
      },
    })

    gatsbyProcess.on(`exit`, exitCode => {
      done()
    })
  })

  describe(`Static Queries`, () => {
    test(`are written correctly when inline`, async () => {
      const queries = [titleQuery, ...globalQueries]
      const pagePath = `/inline/`

      const { staticQueryHashes } = await readPageData(publicDir, pagePath)

      expect(staticQueryHashes.sort()).toEqual(queries.map(hashQuery).sort())
    })

    test(`are written correctly when imported`, async () => {
      const queries = [titleQuery, ...globalQueries]
      const pagePath = `/import/`

      const { staticQueryHashes } = await readPageData(publicDir, pagePath)

      expect(staticQueryHashes.sort()).toEqual(queries.map(hashQuery).sort())
    })

    test(`are written correctly when dynamically imported`, async () => {
      const queries = [titleQuery, ...globalQueries]
      const pagePath = `/dynamic/`

      const { staticQueryHashes } = await readPageData(publicDir, pagePath)

      expect(staticQueryHashes.sort()).toEqual(queries.map(hashQuery).sort())
    })

    test(`are written correctly in jsx`, async () => {
      const queries = [titleQuery, ...globalQueries]
      const pagePath = `/jsx/`

      const { staticQueryHashes } = await readPageData(publicDir, pagePath)

      expect(staticQueryHashes.sort()).toEqual(queries.map(hashQuery).sort())
    })

    test(`are written correctly in tsx`, async () => {
      const queries = [titleQuery, ...globalQueries]
      const pagePath = `/tsx/`

      const { staticQueryHashes } = await readPageData(publicDir, pagePath)

      expect(staticQueryHashes.sort()).toEqual(queries.map(hashQuery).sort())
    })

    test(`are written correctly in typescript`, async () => {
      const queries = [titleQuery, ...globalQueries]
      const pagePath = `/typescript/`

      const { staticQueryHashes } = await readPageData(publicDir, pagePath)

      expect(staticQueryHashes.sort()).toEqual(queries.map(hashQuery).sort())
    })

    test(`are written correctly when nesting imports`, async () => {
      const queries = [titleQuery, authorQuery, ...globalQueries]
      const pagePath = `/import-import/`

      const { staticQueryHashes } = await readPageData(publicDir, pagePath)

      expect(staticQueryHashes.sort()).toEqual(queries.map(hashQuery).sort())
    })

    test(`are written correctly when nesting dynamic imports`, async () => {
      const queries = [titleQuery, ...globalQueries]
      const pagePath = `/dynamic-dynamic/`

      const { staticQueryHashes } = await readPageData(publicDir, pagePath)

      expect(staticQueryHashes.sort()).toEqual(queries.map(hashQuery).sort())
    })

    test(`are written correctly when nesting a dynamic import in a regular import`, async () => {
      const queries = [titleQuery, authorQuery, ...globalQueries]
      const pagePath = `/import-dynamic/`

      const { staticQueryHashes } = await readPageData(publicDir, pagePath)

      expect(staticQueryHashes.sort()).toEqual(queries.map(hashQuery).sort())
    })

    test(`are written correctly when nesting a regular import in a dynamic import`, async () => {
      const queries = [titleQuery, ...globalQueries]
      const pagePath = `/dynamic-import/`

      const { staticQueryHashes } = await readPageData(publicDir, pagePath)

      expect(staticQueryHashes.sort()).toEqual(queries.map(hashQuery).sort())
    })

    test("are written correctly with circular dependency", async () => {
      const queries = [titleQuery, ...globalQueries]
      const pagePath = `/circular-dep/`

      const { staticQueryHashes } = await readPageData(publicDir, pagePath)

      expect(staticQueryHashes.sort()).toEqual(queries.map(hashQuery).sort())
    })

    test(`are written correctly when using gatsby-browser`, async () => {
      const queries = [...globalQueries]
      const pagePath = `/gatsby-browser/`

      const { staticQueryHashes } = await readPageData(publicDir, pagePath)

      expect(staticQueryHashes.sort()).toEqual(queries.map(hashQuery).sort())
    })
  })

  const expectedPages = [`stale-pages/stable`, `stale-pages/only-in-first`]
  const unexpectedPages = [`stale-pages/only-in-second`]

  describe(`html files`, () => {
    const type = `html`

    describe(`should have expected html files`, () => {
      assertFileExistenceForPagePaths({
        pagePaths: expectedPages,
        type,
        shouldExist: true,
      })
    })

    describe(`shouldn't have unexpected html files`, () => {
      assertFileExistenceForPagePaths({
        pagePaths: unexpectedPages,
        type,
        shouldExist: false,
      })
    })
  })

  describe(`page-data files`, () => {
    const type = `page-data`

    describe(`should have expected page-data files`, () => {
      assertFileExistenceForPagePaths({
        pagePaths: expectedPages,
        type,
        shouldExist: true,
      })
    })

    describe(`shouldn't have unexpected page-data files`, () => {
      assertFileExistenceForPagePaths({
        pagePaths: unexpectedPages,
        type,
        shouldExist: false,
      })
    })
  })
})

describe(`Second run`, () => {
  const expectedPages = [`stale-pages/stable`, `stale-pages/only-in-second`]
  const unexpectedPages = [`stale-pages/only-in-first`]

  beforeAll(async done => {
    const gatsbyProcess = spawn(gatsbyBin, [`build`], {
      stdio: [`inherit`, `inherit`, `inherit`, `inherit`],
      env: {
        ...process.env,
        NODE_ENV: `production`,
        RUN_FOR_STALE_PAGE_ARTIFICATS: `2`,
      },
    })

    gatsbyProcess.on(`exit`, exitCode => {
      done()
    })
  })

  describe(`html files`, () => {
    const type = `html`

    describe(`should have expected html files`, () => {
      assertFileExistenceForPagePaths({
        pagePaths: expectedPages,
        type,
        shouldExist: true,
      })
    })

    describe(`shouldn't have unexpected html files`, () => {
      assertFileExistenceForPagePaths({
        pagePaths: unexpectedPages,
        type,
        shouldExist: false,
      })
    })
  })

  describe(`page-data files`, () => {
    const type = `page-data`

    describe(`should have expected page-data files`, () => {
      assertFileExistenceForPagePaths({
        pagePaths: expectedPages,
        type,
        shouldExist: true,
      })
    })

    describe(`shouldn't have unexpected page-data files`, () => {
      assertFileExistenceForPagePaths({
        pagePaths: unexpectedPages,
        type,
        shouldExist: false,
      })
    })
  })
})
