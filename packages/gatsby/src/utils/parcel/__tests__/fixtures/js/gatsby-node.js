import { working } from "../utils/say-what"
import { createPages } from "../utils/create-pages"

export const onPreInit = ({ reporter }) => {
  reporter.info(working)
}

export const sourceNodes = async ({ actions, createNodeId, createContentDigest }) => {
  const { createNode } = actions

  let characters = [
    {
      id: `0`,
      name: `A`
    },
    {
      id: `1`,
      name: `B`
    }
  ]

  characters.forEach((character) => {
    const node = {
      ...character,
      id: createNodeId(`characters-${character.id}`),
      parent: null,
      children: [],
      internal: {
        type: 'Character',
        content: JSON.stringify(character),
        contentDigest: createContentDigest(character),
      },
    }

    createNode(node)
  })
}

export { createPages }