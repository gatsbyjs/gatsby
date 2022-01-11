// Must run `gatsby-dev --packages gatsby to get latest gatsby changes before running the tests
jest.setTimeout(100000)
const DEFAULT_MAX_DAYS_OLD = 30

const { spawnGatsbyProcess } = require(`../utils/get-gatsby-process`)
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

let gatsbyProcess

beforeAll(async () => {
  await cleanNodeManifests()

  gatsbyProcess = spawnGatsbyProcess(gatsbyCommandName)

  if (gatsbyCommandName === `develop`) {
    // wait for localhost
    await urling(`http://localhost:8000`)
  } else if (gatsbyCommandName === `build`) {
    // for gatsby build wait for the process to exit
    await new Promise(resolve => gatsbyProcess.on(`exit`, resolve))
    gatsbyProcess.kill()
  }
})

afterAll(() => gatsbyProcess.kill())

// see gatsby-node.js for where createNodeManifest was called
// and for the corresponding pages that were created with createPage
describe(`Node Manifest API in "gatsby ${gatsbyCommandName}"`, () => {
  it(`Creates an accurate node manifest when using the ownerNodeId argument in createPage`, async () => {
    const manifestFileContents = await getManifestContents(1)

    expect(manifestFileContents.node.id).toBe(`1`)
    expect(manifestFileContents.page.path).toBe(`/one`)
    expect(manifestFileContents.foundPageBy).toBe(`ownerNodeId`)
  })

  it(`Creates an accurate node manifest when ownerNodeId isn't present but there's a matching "id" in pageContext`, async () => {
    const manifestFileContents = await getManifestContents(2)

    expect(manifestFileContents.node.id).toBe(`2`)
    expect(manifestFileContents.page.path).toBe(`/two`)
    expect(manifestFileContents.foundPageBy).toBe(`context.id`)
  })

  if (gatsbyCommandName === `build`) {
    // this doesn't work in gatsby develop since query tracking
    // only runs when visiting a page in browser.
    it(`Creates a node manifest from the first tracked page it finds in query tracking`, async () => {
      const manifestFileContents = await getManifestContents(3)

      expect(manifestFileContents.node.id).toBe(`3`)
      expect(
        [`/three`, `/three-alternative`].includes(
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
})
