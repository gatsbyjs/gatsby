import type { GatsbyNode } from "gatsby"

const westworldParks = [
  {
    name: "Westworld",
    description: "Westworld is a park owned by Delos Incorporated and was the first park to be built. Guests pay to immerse themselves in a carefully crafted simulation of the American Wild West.",
    type: "Theme Park",
  },
  {
    name: "Medievalworld",
    description: "This is Medievalworld, where we have reconstructed 13th-century Europe. A world of chivalry and combat, romance and excitement. Our teams of engineers have spared no expense in this re-creation, precise to the smallest detail.",
    type: "Resort",
  },
  {
    name: "Shōgunworld",
    description: "Shōgunworld is a Delos destination modeled and influenced by the Edo period in Japan. The world features a strong military presence, reflecting the military rule and political uncertainty of the Japanese period.",
    type: "Theme Park",
  }
]

export const sourceNodes: GatsbyNode["sourceNodes"] = ({ actions, createNodeId, createContentDigest }) => {
  const { createNode } = actions

  westworldParks.forEach(park => {
    const node = {
      ...park,
      id: createNodeId(`${park.name} >>> Park`),
      parent: null,
      children: [],
      internal: {
        type: `Park`,
        contentDigest: createContentDigest(park),
      },
    }

    createNode(node)
  })
}