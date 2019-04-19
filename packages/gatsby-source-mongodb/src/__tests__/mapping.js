const mapping = require(`../mapping`)

test(`it is a function`, () => {
  expect(mapping).toEqual(expect.any(Function))
})

const params = {
  node: {
    id: `someStringifiedObjectId`,
    mongodb_id: `someObjectId`,
    parent: `__someCollection__`,
    children: [],
    internal: {
      type: `mongodbCloudsomeCollection`,
      content: `someData`,
      contentDigest: `someCrypto`,
    },
  },
  key: `someKey`,
  text: `someText`,
  mediaType: `someMediaType`,
  createContentDigest: jest.fn().mockReturnValue(`contentDigest`),
  createNode: jest.fn(),
}

test(`it returns an object`, () => {
  expect(
    mapping(
      params.node,
      params.key,
      params.text,
      params.mediaType,
      params.createContentDigest,
      params.createNode
    )
  ).toHaveProperty(`id`)
  expect(
    mapping(
      params.node,
      params.key,
      params.text,
      params.mediaType,
      params.createContentDigest,
      params.createNode
    )
  ).toHaveProperty(`parent`)
  expect(
    mapping(
      params.node,
      params.key,
      params.text,
      params.mediaType,
      params.createContentDigest,
      params.createNode
    )
  ).toHaveProperty(`children`)
  expect(
    mapping(
      params.node,
      params.key,
      params.text,
      params.mediaType,
      params.createContentDigest,
      params.createNode
    )
  ).toHaveProperty(`internal`)
  expect(
    mapping(
      params.node,
      params.key,
      params.text,
      params.mediaType,
      params.createContentDigest,
      params.createNode
    )
  ).toHaveProperty(`someKey`)
})

test(`it returns a transformed object`, () => {
  const desiredResult = {
    id: `someStringifiedObjectIdsomeKeyMappingNode`,
    parent: `someStringifiedObjectId`,
    someKey: `someText`,
    children: [],
    internal: {
      type: `mongodbCloudsomeCollectionSomeKeyMappingNode`,
      mediaType: `someMediaType`,
      content: `someText`,
      contentDigest: expect.any(String),
    },
  }
  expect(
    mapping(
      params.node,
      params.key,
      params.text,
      params.mediaType,
      params.createContentDigest,
      params.createNode
    )
  ).toMatchObject(desiredResult)
})
