import { GatsbyNode } from "gatsby"
import { working } from "../utils/say-what-ts"
import { createPages } from "../utils/create-pages-ts"

this is wrong syntax that should't compile

export const onPreInit: GatsbyNode["onPreInit"] = ({ reporter }) => {
  reporter.info(working)
}

type Character = {
  id: string
  name: string
}

export const sourceNodes: GatsbyNode["sourceNodes"] = async ({ actions, createNodeId, createContentDigest }) => {
  const { createNode } = actions

  let characters: Array<Character> = [
    {
      id: `0`,
      name: `A`
    },
    {
      id: `1`,
      name: `B`
    }
  ]

  characters.forEach((character: Character) => {
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
