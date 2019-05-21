jest.mock(`md5-file/promise`, () => {
  const path = jest.requireActual(`path`)
  return jest.fn(file => Promise.resolve(path.basename(file)))
})
const md5File = require(`md5-file/promise`)
const getPluginHash = require(`../plugin-hash`)

const getHash = ({
  directory = __dirname,
  plugins = [],
  existing = {},
  ...rest
} = {}) => getPluginHash({ directory, plugins, existing, ...rest })

beforeEach(() => {
  md5File.mockClear()
})

describe(`basic functionality`, () => {
  it(`invalidates gatsby-node.js if it has changed`, () => {
    const additional = [`gatsby-node.js`]
    const existing = {
      "gatsby-node.js": ``,
    }

    expect(getHash({ additional, existing })).resolves.toEqual(
      expect.objectContaining({
        changes: [`gatsby-node.js`],
      })
    )
  })
})

describe(`getting changed plugins`, () => {
  it(`returns single plugin, if single plugin changed`, () => {
    const plugins = [{ name: `gatsby-source-filesystem`, version: `2.0.0` }]
    const existing = { "gatsby-source-filesystem": `1.0.0` }

    expect(getHash({ plugins, existing })).resolves.toEqual(
      expect.objectContaining({
        changes: [`gatsby-source-filesystem`],
      })
    )
  })

  it(`returns multiple plugins, if multiple plugins changed`, () => {
    const plugins = [
      { name: `gatsby-source-filesystem`, version: `2.0.0` },
      { name: `gatsby-remark-prismjs`, version: `1.0.0` },
    ]
    const existing = {
      "gatsby-source-filesystem": `1.0.0`,
      "gatsby-remark-prismjs": `0.9.9`,
    }

    expect(getHash({ plugins, existing })).resolves.toEqual(
      expect.objectContaining({
        changes: [`gatsby-source-filesystem`, `gatsby-remark-prismjs`],
      })
    )
  })

  it(`does not include plugin as changed if fresh install of plugin`, () => {
    const plugins = [{ name: `gatsby-source-filesystem`, version: `1.0.0` }]
    const existing = {}

    expect(getHash({ plugins, existing })).resolves.toEqual(
      expect.objectContaining({
        changes: [],
      })
    )
  })

  it(`does not include plugin as changed if no changes in version`, () => {
    const plugins = [{ name: `gatsby-source-filesystem`, version: `1.0.0` }]
    const existing = { "gatsby-source-filesystem": plugins[0].version }

    expect(getHash({ plugins, existing })).resolves.toEqual(
      expect.objectContaining({
        changes: [],
      })
    )
  })

  it(`does not include changed plugins if fresh cache`, () => {
    const plugins = [
      { name: `gatsby-source-filesystem`, version: `1.0.0` },
      { name: `gatsby-remark-prismjs`, version: `1.0.0` },
    ]
    const existing = {}

    expect(getHash({ plugins, existing })).resolves.toEqual(
      expect.objectContaining({
        changes: [],
      })
    )
  })
})

describe(`getting hash`, () => {
  it(`creates hash based on plugin versions`, () => {
    const plugins = [
      { name: `gatsby-source-filesystem`, version: `1.0.0` },
      { name: `gatsby-remark-prismjs`, version: `1.0.0` },
    ]

    expect(getHash({ plugins })).resolves.toEqual(
      expect.objectContaining({
        hash: {
          "gatsby-source-filesystem": `1.0.0`,
          "gatsby-remark-prismjs": `1.0.0`,
        },
      })
    )
  })

  it(`includes hash of additional file(s)`, () => {
    const additional = [`gatsby-config.js`, `gatsby-node.js`, `package.json`]

    expect(getHash({ additional })).resolves.toEqual(
      expect.objectContaining({
        hash: {
          "gatsby-config.js": `gatsby-config.js`,
          "gatsby-node.js": `gatsby-node.js`,
          "package.json": `package.json`,
        },
      })
    )
  })

  it(`uses empty string as key if file does not exist`, () => {
    md5File.mockRejectedValueOnce(() => new Error(`File does not exist`))
    const additional = [`gatsby-config.js`]

    expect(getHash({ additional })).resolves.toEqual(
      expect.objectContaining({
        hash: {
          "gatsby-config.js": ``,
        },
      })
    )
  })
})
