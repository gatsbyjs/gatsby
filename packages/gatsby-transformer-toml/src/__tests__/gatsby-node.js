const Promise = require(`bluebird`)
const _ = require(`lodash`)

const { onCreateNode } = require(`../gatsby-node`)

describe(`Process TOML nodes correctly`, () => {
  const node = {
    id: `whatever`,
    parent: `SOURCE`,
    children: [],
    extension: `toml`,
    internal: {
      contentDigest: `whatever`,
    },
    name: `test`,
  }

  // Provide fake functions
  const loadNodeContent = node => Promise.resolve(node.content)

  it(`Correctly creates nodes from TOML test file`, async () => {
  // Unfortunately due to TOML limitations no JSON -> TOML convertors exist,
  // which means that we are stuck with JS template literals.
    node.content = `
    [the]
    test_string = "You'll hate me after this - #"

    [the.hard]
    test_array = [ "] ", " # "]      # ]
    test_array2 = [ "Test #11 ]proved that", "Experiment #9 was a success" ]
    another_test_string = " Same thing, but with a string #"
    harder_test_string = " And when \\"'s are in the string, along with # \\""
    # Things will get harder

        [the.hard."bit#"]
        "what?" = "You don't think some user won't do that?"
        multi_line_array = [
            "]",
            # ] Oh yes I did
            ]
    `

    const createNode = jest.fn()
    const createParentChildLink = jest.fn()
    const boundActionCreators = { createNode, createParentChildLink }

    await onCreateNode({
      node,
      loadNodeContent,
      boundActionCreators,
    }).then(() => {
      expect(createNode.mock.calls).toMatchSnapshot()
      expect(createParentChildLink.mock.calls).toMatchSnapshot()
      expect(createNode).toHaveBeenCalledTimes(1)
      expect(createParentChildLink).toHaveBeenCalledTimes(1)
    })
  })

  it(`If the object has an id, it uses that as the id instead of the auto-generated one`, async () => {
    node.content = `
          id = 'foo'
          blue = true
          funny = 'yup'
    `

    const createNode = jest.fn()
    const createParentChildLink = jest.fn()
    const boundActionCreators = { createNode, createParentChildLink }

    await onCreateNode({
      node,
      loadNodeContent,
      boundActionCreators,
    }).then(() => {
      expect(createNode.mock.calls[0][0].id).toEqual(`foo`)
    })
  })

  // Since TOML transformer doesn't generate sub-objects from arrays,
  // but directly uses the object, 'id' uniqueness tests between sub-objects
  // are omitted.
})
