const removeNodesByPlugin = require(`../remove-nodes-by-plugin`)

const getState = () =>
  [
    [`SitePage`, `default-site-plugin`],
    [`Directory`, `gatsby-source-filesystem`],
    [`File`, `gatsby-source-filesystem`],
  ].reduce(
    (lookup, [type, owner], index) =>
      lookup.set(
        type,
        new Map().set(index, {
          internal: {
            type,
            owner,
          },
        })
      ),
    new Map()
  )

test(`it removes nothing without plugins to invalidate`, () => {
  const state = getState()
  expect(removeNodesByPlugin([], state)).toEqual(state)
})

test(`it removes nodes for a particular plugin`, () => {
  const state = getState()
  const updated = removeNodesByPlugin([`default-site-plugin`], state)
  expect(updated.get(`SitePage`).size).toBe(0)
})

test(`it removes nodes for multiple plugins`, () => {
  const state = getState()
  const updated = removeNodesByPlugin(
    [`default-site-plugin`, `gatsby-source-filesystem`],
    state
  )
  for (let [type] of state) {
    expect(updated.get(type).size).toBe(0)
  }
})
