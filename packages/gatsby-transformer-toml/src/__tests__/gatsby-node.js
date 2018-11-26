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
    const actions = { createNode, createParentChildLink }
    const createNodeId = jest.fn()
    createNodeId.mockReturnValue(`uuid-from-gatsby`)

    await onCreateNode({
      node,
      loadNodeContent,
      actions,
      createNodeId,
    }).then(() => {
      expect(createNode.mock.calls).toMatchSnapshot()
      expect(createParentChildLink.mock.calls).toMatchSnapshot()
      expect(createNode).toHaveBeenCalledTimes(1)
      expect(createParentChildLink).toHaveBeenCalledTimes(1)
    })
  })

  // Since TOML transformer doesn't generate sub-objects from arrays,
  // but directly uses the object, 'id' uniqueness tests between sub-objects
  // are omitted.
})
