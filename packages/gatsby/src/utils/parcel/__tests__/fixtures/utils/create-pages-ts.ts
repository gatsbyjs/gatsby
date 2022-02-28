import { GatsbyNode } from "gatsby"
import path from "path"

// require.resolve not working
const pageTemplate = path.resolve(`src/templates/template.tsx`)

export const createPages: GatsbyNode["createPages"] = async ({ graphql, actions, reporter }) => {
  const { createPage } = actions

  const result = await graphql<{ allDuneYaml: { nodes: { id: string; name: string }[] } }>(`
    {
      allDuneYaml {
        nodes {
          id
          name
        }
      }
    }
  `)

  if (result.errors) {
    reporter.panicOnBuild(`error!`, result.errors)
  }

  result.data?.allDuneYaml.nodes.forEach(d => {
    createPage({
      path: `/${d.name}`,
      component: pageTemplate,
      defer: true,
      context: {
        id: d.id,
        name: d.name
      }
    })
  })
}