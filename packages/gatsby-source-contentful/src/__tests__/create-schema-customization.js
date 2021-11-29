// @ts-check
import { createSchemaCustomization } from "../create-schema-customization"
import { contentTypes } from "../__fixtures__/content-types"

const createMockCache = () => {
  return {
    get: jest.fn(key => contentTypes),
  }
}

describe(`create-schema-customization`, () => {
  const actions = { createTypes: jest.fn() }
  const schema = {
    buildObjectType: jest.fn(),
    buildInterfaceType: jest.fn(),
    buildUnionType: jest.fn(),
  }
  const cache = createMockCache()
  const reporter = {
    info: jest.fn(),
    verbose: jest.fn(),
    panic: jest.fn(),
    activityTimer: () => {
      return { start: jest.fn(), end: jest.fn() }
    },
  }

  beforeEach(() => {
    cache.get.mockClear()
    process.env.GATSBY_WORKER_ID = `mocked`
  })

  it(`builds schema based on Contentful Content Model`, async () => {
    await createSchemaCustomization(
      { schema, actions, reporter, cache },
      { spaceId: `testSpaceId` }
    )

    expect(schema.buildObjectType).toHaveBeenCalled()
    expect(schema.buildObjectType.mock.calls).toMatchSnapshot()
    expect(schema.buildInterfaceType).toHaveBeenCalled()
    expect(schema.buildInterfaceType.mock.calls).toMatchSnapshot()
    expect(schema.buildUnionType).toHaveBeenCalled()
    expect(schema.buildUnionType.mock.calls).toMatchSnapshot()
  })
})
