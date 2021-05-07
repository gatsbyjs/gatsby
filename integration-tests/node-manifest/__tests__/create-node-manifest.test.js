jest.setTimeout(100000)

const { spawnGatsbyProcess } = require(`../utils/get-gatsby-process`)
const urling = require(`urling`)
const rimraf = require(`rimraf`)
const path = require(`path`)
const fs = require(`fs-extra`)

const manifestDir = path.join(
  process.cwd(),
  `.cache`,
  `node-manifests`,
  `default-site-plugin`
)

const cleanNodeManifests = async () => {
  console.log(`removing any lingering node manifest files at ${manifestDir}`)
  return new Promise(resolve => rimraf(manifestDir, resolve))
}

const gatsbyCommandName = process.env.GATSBY_COMMAND_NAME || `develop`

const getManifestContents = async id =>
  await fs.readJSON(path.join(manifestDir, `${gatsbyCommandName}-${id}.json`))

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
  })

  it(`Creates an accurate node manifest when ownerNodeId isn't present but there's a matching "id" in pageContext`, async () => {
    const manifestFileContents = await getManifestContents(2)

    expect(manifestFileContents.node.id).toBe(`2`)
    expect(manifestFileContents.page.path).toBe(`/two`)
  })

  it(`Creates a node manifest from the first tracked page it finds in query tracking`, async () => {
    const manifestFileContents = await getManifestContents(3)

    expect(manifestFileContents.node.id).toBe(`3`)
    expect(
      [`/three`, `/three-alternative`].includes(manifestFileContents.page.path)
    ).toBe(true)
  })

  it(`Creates a node manifest with a null page path when createNodeManifest is called but a page is not created for the provided node in the Gatsby site`, async () => {
    const manifestFileContents = await getManifestContents(4)

    expect(manifestFileContents.node.id).toBe(`4`)
    expect(manifestFileContents.page.path).toBe(null)
  })
})
