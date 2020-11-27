import unified from "unified"
import remarkMdx from "remark-mdx"
import remarkMdxjs from "remark-mdxjs"
import remarkParse from "remark-parse"
import remarkStringify from "remark-stringify"
import visit from "unist-util-visit"
import remove from "unist-util-remove"
import transformMdx from "../transform-recipe-mdx"
import { uuid } from "./util"

const IGNORED_COMPONENTS = [`RecipeIntroduction`, `RecipeStep`]

const asRoot = node => {
  return {
    type: `root`,
    children: [node],
  }
}

const pluckExports = tree => {
  let exports = []
  visit(tree, `export`, node => {
    exports.push(node)
  })

  remove(tree, `export`)

  return exports
}

const applyUuid = tree => {
  visit(tree, `mdxBlockElement`, node => {
    if (!IGNORED_COMPONENTS.includes(node.name)) {
      node.attributes.push({
        type: `mdxAttribute`,
        name: `_uuid`,
        value: uuid(),
      })
      node.attributes.push({
        type: `mdxAttribute`,
        name: `_type`,
        value: node.name,
      })
    }
  })

  return tree
}

const u = unified()
  .use(remarkParse)
  .use(remarkStringify)
  .use(remarkMdx)
  .use(remarkMdxjs)

const partitionSteps = ast => {
  const steps = []
  let index = 0
  ast.children.forEach(node => {
    if (node.type === `thematicBreak`) {
      index++
      return undefined
    }

    steps[index] = steps[index] || []
    steps[index].push(node)
    return undefined
  })

  return steps
}

const toMdx = nodes => {
  const stepAst = applyUuid(asRoot(nodes))
  const mdxSrc = u.stringify(stepAst)

  return mdxSrc
}

const parse = async src => {
  try {
    const ast = u.parse(src)
    const exportNodes = pluckExports(ast)
    const [intro, ...resourceSteps] = partitionSteps(ast)

    const wrappedIntroStep = {
      type: `mdxBlockElement`,
      name: `RecipeIntroduction`,
      attributes: [],
      children: intro,
    }

    const wrappedResourceSteps = resourceSteps.map((step, i) => {
      return {
        type: `mdxBlockElement`,
        name: `RecipeStep`,
        attributes: [
          {
            type: `mdxAttribute`,
            name: `step`,
            value: String(i + 1),
          },
          {
            type: `mdxAttribute`,
            name: `totalSteps`,
            value: String(resourceSteps.length),
          },
        ],
        children: step,
      }
    })

    const steps = [wrappedIntroStep, ...wrappedResourceSteps]
    ast.children = [...exportNodes, ...ast.children]

    const exportsAsMdx = exportNodes.map(toMdx)
    const stepsAsMdx = steps.map(toMdx)
    const stepsAsJS = stepsAsMdx.map(transformMdx)

    return {
      ast,
      steps,
      exports: exportNodes,
      exportsAsMdx,
      stepsAsMdx,
      stepsAsJS,
      recipe: exportsAsMdx.join(`\n`) + `\n\n` + stepsAsMdx.join(`\n`),
    }
  } catch (e) {
    throw e
  }
}

export default parse
export { parse, u }
