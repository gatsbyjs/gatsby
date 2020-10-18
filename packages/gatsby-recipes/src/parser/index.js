const unified = require(`unified`)
const remarkMdx = require(`remark-mdx`)
const remarkMdxjs = require(`remark-mdxjs`)
const remarkParse = require(`remark-parse`)
const remarkStringify = require(`remark-stringify`)
const visit = require(`unist-util-visit`)
const remove = require(`unist-util-remove`)
const transformMdx = require(`../transform-recipe-mdx`).default

const { uuid } = require(`./util`)

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

module.exports = parse
module.exports.parse = parse
module.exports.u = u
