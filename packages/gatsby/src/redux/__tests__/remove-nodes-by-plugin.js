const removeNodesByPlugin = require(`../remove-nodes-by-plugin`)

const getNode = ({ type, owner, id, ...rest }) => {
  return {
    ...rest,
    id: `${owner}-${id}`,
    internal: {
      type,
      owner,
    },
  }
}

const getState = (groupByType = true) =>
  [
    getNode({
      type: `File`,
      owner: `gatsby-source-filesystem`,
      id: 1,
    }),
    getNode({
      type: `File`,
      owner: `gatsby-source-filesystem`,
      children: [`gatsby-transformer-remark-1`],
      id: 2,
    }),
    getNode({
      type: `File`,
      owner: `gatsby-source-filesystem`,
      children: [`gatsby-transformer-remark-2`, `gatsby-transformer-remark-3`],
      id: 3,
    }),
  ]
    .concat(
      new Array(3).fill(undefined).map((_, index) =>
        getNode({
          type: `MarkdownRemark`,
          owner: `gatsby-transformer-remark`,
          id: index + 1,
        })
      )
    )
    .reduce((merged, node) => {
      if (groupByType) {
        const nodes = merged.get(node.internal.type) || new Map()
        return merged.set(node.internal.type, nodes.set(node.id, node))
      }
      return merged.set(node.id, node)
    }, new Map())

test(`it invalidates state with empty plugins array`, () => {
  const state = getState()
  expect(removeNodesByPlugin([], state)).toEqual(new Map())
})

test(`it removes nodes for a particular plugin`, () => {
  const state = getState()

  expect(state.has(`MarkdownRemark`)).toBe(true)
  const updated = removeNodesByPlugin([`gatsby-transformer-remark`], state)

  expect(updated.has(`MarkdownRemark`)).toBe(false)
})

test(`it removes children nodes recursively`, () => {
  const state = getState()
  const updated = removeNodesByPlugin([`gatsby-source-filesystem`], state)

  expect(updated.has(`File`)).toBe(false)
  expect(updated.has(`MarkdownRemark`)).toBe(false)
})

describe(`grouping by node`, () => {
  const getDirtyByOwner = (state, owner) =>
    Array.from(state).reduce((merged, [id, node]) => {
      if (node.internal.owner === owner) {
        merged.push(id)
      }
      return merged
    }, [])

  test(`it returns empty array when empty plugins array`, () => {
    const state = getState(false)

    const updated = removeNodesByPlugin([], state, false)

    expect(updated).toEqual(new Map())
  })

  test(`it removes nodes marked as dirty`, () => {
    const state = getState(false)

    const dirty = getDirtyByOwner(state, `gatsby-transformer-remark`)

    const updated = removeNodesByPlugin(
      [`gatsby-transformer-remark`],
      state,
      false
    )

    dirty.forEach(id => {
      expect(updated.has(id)).toBe(false)
    })
  })

  test(`it removes dependent children nodes`, () => {
    const state = getState(false)

    const dirty = []
      .concat(getDirtyByOwner(state, `gatsby-source-filesystem`))
      .concat(getDirtyByOwner(state, `gatsby-transformer-remark`))

    const updated = removeNodesByPlugin(
      [`gatsby-source-filesystem`],
      state,
      false
    )

    dirty.forEach(id => {
      expect(updated.has(id)).toBe(false)
    })
  })
})
