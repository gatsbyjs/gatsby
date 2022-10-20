// Must run `gatsby-dev --packages gatsby to get latest gatsby changes before running the tests
jest.setTimeout(100000)
const DEFAULT_MAX_DAYS_OLD = 30

const {
  spawnGatsbyProcess,
  runGatsbyClean,
} = require(`../utils/get-gatsby-process`)
const urling = require(`urling`)
const rimraf = require(`rimraf`)
const path = require(`path`)
const fs = require(`fs-extra`)

const gatsbyCommandName = process.env.GATSBY_COMMAND_NAME || `develop`

const manifestDir = path.join(
  process.cwd(),
  `public`,
  `__node-manifests`,
  `default-site-plugin`
)

const pageDataDir = path.join(process.cwd(), `public`, `page-data`)

const createManifestId = nodeId => `${gatsbyCommandName}-${nodeId}`

const cleanNodeManifests = async () => {
  console.log(`removing any lingering node manifest files at ${manifestDir}`)
  return new Promise(resolve => rimraf(manifestDir, resolve))
}

const getManifestContents = async nodeId =>
  await fs.readJSON(path.join(manifestDir, `${createManifestId(nodeId)}.json`))

const pageDataContents = async pagePath =>
  await fs.readJSON(path.join(pageDataDir, pagePath, `page-data.json`))

const port = 8010

// see gatsby-node.js for where createNodeManifest was called
// and for the corresponding pages that were created with createPage
describe(`Node Manifest API in "gatsby ${gatsbyCommandName}"`, () => {
  let gatsbyProcess

  beforeAll(async () => {
    await cleanNodeManifests()

    gatsbyProcess = spawnGatsbyProcess(gatsbyCommandName, {
      PORT: port,
    })

    if (gatsbyCommandName === `develop`) {
      // wait for localhost
      return urling(`http://localhost:${port}`)
    } else if (gatsbyCommandName === `build`) {
      // for gatsby build wait for the process to exit
      return gatsbyProcess
    }
  })

  afterAll(() => {
    return new Promise(resolve => {
      if (
        !gatsbyProcess ||
        gatsbyProcess.killed ||
        gatsbyProcess.exitCode !== null
      ) {
        return resolve()
      }

      gatsbyProcess.on(`exit`, () => {
        setImmediate(() => {
          resolve()
        })
      })

      gatsbyProcess.kill()
    })
  })

  it(`Creates an accurate node manifest when using the ownerNodeId argument in createPage`, async () => {
    const manifestFileContents = await getManifestContents(1)

    expect(manifestFileContents.node.id).toBe(`1`)
    expect(manifestFileContents.page.path).toBe(`/one/`)
    expect(manifestFileContents.foundPageBy).toBe(`ownerNodeId`)
  })

  it(`Creates an accurate node manifest when ownerNodeId isn't present but there's a matching "id" in pageContext`, async () => {
    const manifestFileContents = await getManifestContents(2)

    expect(manifestFileContents.node.id).toBe(`2`)
    expect(manifestFileContents.page.path).toBe(`/two/`)
    expect(manifestFileContents.foundPageBy).toBe(`context.id`)
  })

  it(`Creates an accurate node manifest when ownerNodeId isn't present but there's a matching "slug" in pageContext`, async () => {
    const manifestFileContents = await getManifestContents(5)

    expect(manifestFileContents.node.id).toBe(`5`)
    expect(manifestFileContents.page.path).toBe(`/slug-test-path/`)
    expect(manifestFileContents.foundPageBy).toBe(`context.slug`)
  })

  if (gatsbyCommandName === `build`) {
    // this doesn't work in gatsby develop since query tracking
    // only runs when visiting a page in browser.
    it(`Creates a node manifest from the first tracked page it finds in query tracking`, async () => {
      const manifestFileContents = await getManifestContents(3)

      expect(manifestFileContents.node.id).toBe(`3`)
      expect(
        [`/three/`, `/three-alternative/`].includes(
          manifestFileContents.page.path
        )
      ).toBe(true)
      expect(manifestFileContents.foundPageBy).toBe(`queryTracking`)
    })

    // this doesn't work in gatsby develop since page-data.json files aren't written out
    it(`Adds the correct manifestId to the pageData.json digest`, async () => {
      const nodeId = `1`
      const path = `one`
      const pageData = await pageDataContents(path)

      expect(pageData.manifestId).toEqual(createManifestId(nodeId))
    })
  }

  it(`Creates a node manifest with a null page path when createNodeManifest is called but a page is not created for the provided node in the Gatsby site`, async () => {
    const manifestFileContents = await getManifestContents(4)

    expect(manifestFileContents.node.id).toBe(`4`)
    expect(manifestFileContents.page.path).toBe(null)
    expect(manifestFileContents.foundPageBy).toBe(`none`)
  })

  it(`Creates a Node manifest for filesystem routes`, async () => {
    const manifestFileContents = await getManifestContents(`filesystem-1`)

    expect(manifestFileContents.node.id).toBe(`filesystem-1`)
    expect(manifestFileContents.page.path).toBe(`/filesystem-1/`)
    expect(manifestFileContents.foundPageBy).toBe(`filesystem-route-api`)
  })

  it(`Creates a manifest for the node when updatedAt is included and is within ${DEFAULT_MAX_DAYS_OLD} days`, async () => {
    const recentlyUpdatedNodeId = `updatedAt-1`
    const staleNodeId = `updatedAt-2`
    const recentlyUpdatedNodeManifest = await getManifestContents(
      recentlyUpdatedNodeId
    )

    try {
      await getManifestContents(staleNodeId)
      throw new Error()
    } catch (e) {
      expect(e.message).toContain(`no such file or directory`)
      expect(e.message).toContain(createManifestId(staleNodeId))
    }

    expect(recentlyUpdatedNodeManifest.node.id).toBe(recentlyUpdatedNodeId)
  })

  it(`Creates a correct node manifest for nodes in connection list queries`, async () => {
    const manifestFileContents1 = await getManifestContents(
      `connection-list-query-node`
    )

    expect(manifestFileContents1.node.id).toBe(`connection-list-query-node`)
    expect(manifestFileContents1.page.path).toBe(`/connection-list-query-page/`)

    const manifestFileContents2 = await getManifestContents(
      `connection-list-query-node-2`
    )

    expect(manifestFileContents2.node.id).toBe(`connection-list-query-node-2`)
    expect(manifestFileContents2.page.path).toBe(`/connection-list-query-page/`)
  })

  it(`Creates a correct node manifest for nodes in connection list queries using staticQuery()`, async () => {
    const manifestFileContents1 = await getManifestContents(
      `static-query-list-query-node`
    )

    expect(manifestFileContents1.node.id).toBe(`static-query-list-query-node`)
    expect(manifestFileContents1.page.path).toBe(`/static-query-list-query/`)

    const manifestFileContents2 = await getManifestContents(
      `static-query-list-query-node-2`
    )

    expect(manifestFileContents2.node.id).toBe(`static-query-list-query-node-2`)
    expect(manifestFileContents2.page.path).toBe(`/static-query-list-query/`)
  })
})

describe(`Node Manifest API in "gatsby ${gatsbyCommandName}"`, () => {
  let gatsbyProcess

  beforeEach(async () => {
    await runGatsbyClean()

    gatsbyProcess = spawnGatsbyProcess(gatsbyCommandName, {
      DUMMY_NODE_MANIFEST_COUNT: 700,
      NODE_MANIFEST_FILE_LIMIT: 500,
      PORT: port,
    })

    if (gatsbyCommandName === `develop`) {
      // wait for localhost
      await urling(`http://localhost:${port}`)
    } else if (gatsbyCommandName === `build`) {
      // for gatsby build wait for the process to exit
      return gatsbyProcess
    }
  })

  afterAll(() => {
    return new Promise(resolve => {
      if (
        !gatsbyProcess ||
        gatsbyProcess.killed ||
        gatsbyProcess.exitCode !== null
      ) {
        return resolve()
      }

      gatsbyProcess.on(`exit`, () => {
        setImmediate(() => {
          resolve()
        })
      })

      gatsbyProcess.kill()
    })
  })

  it(`Limits the number of node manifest files written to disk to 500`, async () => {
    const nodeManifestFiles = fs.readdirSync(manifestDir)
    expect(nodeManifestFiles).toHaveLength(500)
  })
})
