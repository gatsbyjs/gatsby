// This is more an integration test than it is a unit test. We try to mock as little as we can

jest.mock(`../fetch`)
jest.mock(`gatsby-core-utils`, () => {
  return {
    createContentDigest: () => `contentDigest`,
  }
})

const gatsbyNode = require(`../gatsby-node`)
const fetch = require(`../fetch`)
const normalize = require(`../normalize`)

const startersBlogFixture = require(`../__fixtures__/starter-blog-data`)

describe(`gatsby-node`, () => {
  const actions = {}
  const store = {}
  const cache = {}
  const getCache = jest.fn()
  const reporter = {
    info: jest.fn(),
  }
  const createNodeId = jest.fn(value => value)
  let currentNodeMap
  let getNodes = () => Array.from(currentNodeMap.values())
  let getNode = id => currentNodeMap.get(id)

  beforeEach(() => {
    fetch.mockClear()
    currentNodeMap = new Map()
    actions.createNode = jest.fn(async node => {
      node.internal.owner = `gatsby-source-contentful`
      currentNodeMap.set(node.id, node)
    })
    actions.deleteNode = ({ node }) => {
      currentNodeMap.delete(node.id)
    }
    actions.touchNode = jest.fn()
    actions.setPluginStatus = jest.fn()
    store.getState = jest.fn(() => {
      return {
        status: {},
      }
    })
  })

  it(`should create nodes from initial payload`, async () => {
    fetch.mockImplementationOnce(() => startersBlogFixture.initialSync)

    await gatsbyNode.sourceNodes({
      actions,
      store,
      getNodes,
      getNode,
      reporter,
      createNodeId,
      cache,
      getCache,
    })

    expect(currentNodeMap).toMatchSnapshot()
  })

  it(`should add a new blogpost and update linkedNodes`, async () => {
    const newBlogPostId = `a1b2c2345def___c5Q1RtFHGRDbvbY5rZbaaZP`
    const newBlogPostIdNl = `a1b2c2345def___c5Q1RtFHGRDbvbY5rZbaaZP___nl`
    const blogPostEntry =
      startersBlogFixture.createBlogPost.currentSyncData.entries[0]

    fetch
      .mockReturnValueOnce(startersBlogFixture.initialSync)
      .mockReturnValueOnce(startersBlogFixture.createBlogPost)

    // initial sync
    await gatsbyNode.sourceNodes({
      actions,
      store,
      getNodes,
      getNode,
      reporter,
      createNodeId,
      cache,
      getCache,
    })

    expect(getNode(newBlogPostId)).toBeUndefined()
    expect(getNode(newBlogPostIdNl)).toBeUndefined()

    // add new blog post
    await gatsbyNode.sourceNodes({
      actions,
      store,
      getNodes,
      getNode,
      reporter,
      createNodeId,
      cache,
      getCache,
    })

    const newBlogPost = getNode(newBlogPostId)
    const newBlogPostNl = getNode(newBlogPostIdNl)
    const author = getNode(newBlogPost[`author___NODE`])
    const authorNl = getNode(newBlogPostNl[`author___NODE`])

    const expectedObjectUS = {
      contentful_id: blogPostEntry.sys.id.substr(1),
      title: blogPostEntry.fields.title[`en-US`],
      slug: blogPostEntry.fields.slug[`en-US`],
      node_locale: `en-US`,
      description___NODE: createNodeId(`${newBlogPostId}descriptionTextNode`),
      body___NODE: createNodeId(`${newBlogPostId}bodyTextNode`),
      heroImage___NODE: normalize.makeId({
        spaceId: blogPostEntry.sys.space.sys.id,
        id: blogPostEntry.fields.heroImage[`en-US`].sys.id,
        defaultLocale: `en-US`,
        currentLocale: `en-US`,
      }),
      author___NODE: normalize.makeId({
        spaceId: blogPostEntry.sys.space.sys.id,
        id: blogPostEntry.fields.author[`en-US`].sys.id,
        defaultLocale: `en-US`,
        currentLocale: `en-US`,
      }),
    }
    const expectedObjectNl = {
      ...expectedObjectUS,
      node_locale: `nl`,
      description___NODE: createNodeId(`${newBlogPostIdNl}descriptionTextNode`),
      body___NODE: createNodeId(`${newBlogPostIdNl}bodyTextNode`),
      heroImage___NODE: normalize.makeId({
        spaceId: blogPostEntry.sys.space.sys.id,
        id: blogPostEntry.fields.heroImage[`en-US`].sys.id,
        defaultLocale: `en-US`,
        currentLocale: `nl`,
      }),
      author___NODE: normalize.makeId({
        spaceId: blogPostEntry.sys.space.sys.id,
        id: blogPostEntry.fields.author[`en-US`].sys.id,
        defaultLocale: `en-US`,
        currentLocale: `nl`,
      }),
    }

    expect(newBlogPost).toMatchObject(expectedObjectUS)
    expect(newBlogPostNl).toMatchObject(expectedObjectNl)

    // test author links
    expect(author[`blog post___NODE`]).toContain(newBlogPost.id)
    expect(authorNl[`blog post___NODE`]).toContain(newBlogPostNl.id)

    expect(currentNodeMap).toMatchSnapshot()
  })

  it(`should update a blogpost`, async () => {
    const updatedBlogPostId = `a1b2c2345def___c5Q1RtFHGRDbvbY5rZbaaZP`
    const updatedBlogPostIdNl = `a1b2c2345def___c5Q1RtFHGRDbvbY5rZbaaZP___nl`
    const blogPostEntry =
      startersBlogFixture.updateBlogPost.currentSyncData.entries[0]

    fetch
      .mockReturnValueOnce(startersBlogFixture.initialSync)
      .mockReturnValueOnce(startersBlogFixture.createBlogPost)
      .mockReturnValueOnce(startersBlogFixture.updateBlogPost)

    // initial sync
    await gatsbyNode.sourceNodes({
      actions,
      store,
      getNodes,
      getNode,
      reporter,
      createNodeId,
      cache,
      getCache,
    })

    // create blog post
    await gatsbyNode.sourceNodes({
      actions,
      store,
      getNodes,
      getNode,
      reporter,
      createNodeId,
      cache,
      getCache,
    })

    // updated blog post
    await gatsbyNode.sourceNodes({
      actions,
      store,
      getNodes,
      getNode,
      reporter,
      createNodeId,
      cache,
      getCache,
    })

    const updatedBlogPost = getNode(updatedBlogPostId)
    const updatedBlogPostNl = getNode(updatedBlogPostIdNl)

    expect(updatedBlogPost.title).toBe(blogPostEntry.fields.title[`en-US`])
    expect(updatedBlogPostNl.title).toBe(blogPostEntry.fields.title[`en-US`])
    expect(updatedBlogPost.tags).toEqual(blogPostEntry.fields.tags[`en-US`])
    expect(updatedBlogPostNl.tags).toEqual(blogPostEntry.fields.tags[`en-US`])
    expect(updatedBlogPost[`author___NODE`]).toEqual(
      normalize.makeId({
        spaceId: blogPostEntry.sys.space.sys.id,
        id: blogPostEntry.fields.author[`en-US`].sys.id,
        defaultLocale: `en-US`,
        currentLocale: `en-US`,
      })
    )
    expect(updatedBlogPostNl[`author___NODE`]).toEqual(
      normalize.makeId({
        spaceId: blogPostEntry.sys.space.sys.id,
        id: blogPostEntry.fields.author[`en-US`].sys.id,
        defaultLocale: `en-US`,
        currentLocale: `nl`,
      })
    )

    expect(currentNodeMap).toMatchSnapshot()
  })

  it(`should remove a blogpost and update linkedNodes`, async () => {
    const removedBlogPostId = `a1b2c2345def___c5Q1RtFHGRDbvbY5rZbaaZP`
    const removedBlogPostIdNl = `a1b2c2345def___c5Q1RtFHGRDbvbY5rZbaaZP___nl`

    fetch
      .mockReturnValueOnce(startersBlogFixture.initialSync)
      .mockReturnValueOnce(startersBlogFixture.createBlogPost)
      .mockReturnValueOnce(startersBlogFixture.removeBlogPost)

    // initial sync
    await gatsbyNode.sourceNodes({
      actions,
      store,
      getNodes,
      getNode,
      reporter,
      createNodeId,
      cache,
      getCache,
    })

    // create blog post
    await gatsbyNode.sourceNodes({
      actions,
      store,
      getNodes,
      getNode,
      reporter,
      createNodeId,
      cache,
      getCache,
    })

    expect(currentNodeMap.has(removedBlogPostId)).toBeTruthy()
    expect(currentNodeMap.has(removedBlogPostIdNl)).toBeTruthy()
    const authorId = getNode(removedBlogPostId)[`author___NODE`]
    const authorIdNl = getNode(removedBlogPostIdNl)[`author___NODE`]

    expect(getNode(authorId)[`blog post___NODE`]).toContain(removedBlogPostId)
    expect(getNode(authorIdNl)[`blog post___NODE`]).toContain(
      removedBlogPostIdNl
    )

    // remove blog post
    await gatsbyNode.sourceNodes({
      actions,
      store,
      getNodes,
      getNode,
      reporter,
      createNodeId,
      cache,
      getCache,
    })

    expect(currentNodeMap.has(removedBlogPostId)).toBeFalsy()
    expect(currentNodeMap.has(removedBlogPostIdNl)).toBeFalsy()

    expect(getNode(authorId)[`blog post___NODE`]).not.toContain(
      removedBlogPostId
    )
    expect(getNode(authorIdNl)[`blog post___NODE`]).not.toContain(
      removedBlogPostIdNl
    )

    expect(currentNodeMap).toMatchSnapshot()
  })

  it(`should remove an asset`, async () => {
    const removedAssetId = `a1b2c2345def___c2gPoPORmbNHm4LwDcgEmvd`
    const removedAssetIdNl = `a1b2c2345def___c2gPoPORmbNHm4LwDcgEmvd___nl`

    fetch
      .mockReturnValueOnce(startersBlogFixture.initialSync)
      .mockReturnValueOnce(startersBlogFixture.createBlogPost)
      .mockReturnValueOnce(startersBlogFixture.removeAsset)

    // initial sync
    await gatsbyNode.sourceNodes({
      actions,
      store,
      getNodes,
      getNode,
      reporter,
      createNodeId,
      cache,
      getCache,
    })

    // create blog post
    await gatsbyNode.sourceNodes({
      actions,
      store,
      getNodes,
      getNode,
      reporter,
      createNodeId,
      cache,
      getCache,
    })

    expect(currentNodeMap.has(removedAssetId)).toBeTruthy()
    expect(currentNodeMap.has(removedAssetIdNl)).toBeTruthy()

    // remove asset
    await gatsbyNode.sourceNodes({
      actions,
      store,
      getNodes,
      getNode,
      reporter,
      createNodeId,
      cache,
      getCache,
    })

    expect(currentNodeMap.has(removedAssetId)).toBeFalsy()
    expect(currentNodeMap.has(removedAssetIdNl)).toBeFalsy()

    expect(currentNodeMap).toMatchSnapshot()
  })
})
