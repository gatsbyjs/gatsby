const { createPages } = require(`../gatsby-node`)
const PROPS = require(`./fixtures/all-query`)
const options = require(`./fixtures/options`)

const toJson = val => JSON.stringify(val, null, 2)

const getMockPages = ({ createPage }) =>
  createPage.mock.calls.map(([page]) => page)

const adjustCtOptions = (opts, newOption) => {
  const ctOptions = opts.contentTypes[0]
  const newCtOptions = Object.assign({}, ctOptions, newOption)
  return { contentTypes: [newCtOptions] }
}

const graphql = jest.fn().mockReturnValue(Promise.resolve(PROPS))
const boundActionCreators = {
  createPage: jest.fn(),
}

const pluginInput = {
  graphql,
  boundActionCreators,
}

describe(`createPages`, () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it(`should call graphql with query`, () => {
    createPages(pluginInput, options).catch(e => {})
    expect(graphql).toBeCalled()
    expect(graphql.mock.calls[0][0]).toMatchSnapshot()
  })

  it(`should allow mapping of the entry data before creating the page object`, async () => {
    const map = ({ id, slug, tags, price, quantity }) => {
      return {
        id: `${id}--foobar`,
        slug,
        tags,
        price,
        quantity,
      }
    }
    const optionsWithMap = adjustCtOptions(options, { map })
    await createPages(pluginInput, optionsWithMap)
    const actual = getMockPages(boundActionCreators)
    expect(toJson(actual)).toMatchSnapshot()
  })

  it(`should accept component name functions`, async () => {
    const component = ({ tags }) => tags.join(``)
    const optionsWithComponent = adjustCtOptions(options, { component })
    await createPages(pluginInput, optionsWithComponent)
    const actual = getMockPages(boundActionCreators)
    expect(toJson(actual)).toMatchSnapshot()
  })

  it(`should create a page for each entry of each content type`, async () => {
    await createPages(pluginInput, options)
    const actual = getMockPages(boundActionCreators)
    expect(toJson(actual)).toMatchSnapshot()
  })
})
