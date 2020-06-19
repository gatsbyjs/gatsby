const unified = require(`unified`)
const remarkMdx = require(`remark-mdx`)
const remarkMdxjs = require(`remark-mdxjs`)
const remarkParse = require(`remark-parse`)
const remarkStringify = require(`remark-stringify`)
const fetch = require(`node-fetch`)
const fs = require(`fs-extra`)
const isUrl = require(`is-url`)
const path = require(`path`)
const visit = require(`unist-util-visit`)
const remove = require(`unist-util-remove`)

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

    return {
      ast,
      steps,
      exports: exportNodes,
      exportsAsMdx: exportNodes.map(toMdx),
      stepsAsMdx: steps.map(toMdx),
    }
  } catch (e) {
    throw e
  }
}

const isRelative = path => {
  if (path.slice(0, 1) == `.`) {
    return true
  }

  return false
}

const getSource = async (pathOrUrl, projectRoot) => {
  let recipePath
  if (isUrl(pathOrUrl)) {
    const res = await fetch(pathOrUrl)
    const src = await res.text()
    return src
  }
  if (isRelative(pathOrUrl)) {
    recipePath = path.join(projectRoot, pathOrUrl)
  } else {
    const url = `https://unpkg.com/gatsby-recipes/recipes/${pathOrUrl}`
    const res = await fetch(url.endsWith(`.mdx`) ? url : url + `.mdx`)

    if (res.status !== 200) {
      throw new Error(
        JSON.stringify({
          fetchError: `Could not fetch ${pathOrUrl} from official recipes`,
        })
      )
    }

    const src = await res.text()
    return src
  }
  if (recipePath.slice(-4) !== `.mdx`) {
    recipePath += `.mdx`
  }

  const src = await fs.readFile(recipePath, `utf8`)
  return src
}

module.exports = async (recipePath, projectRoot) => {
  const src = await getSource(recipePath, projectRoot)
  try {
    const result = await parse(src)
    return result
  } catch (e) {
    console.log(e)
    throw e
  }
}

module.exports.parse = parse
module.exports.u = u
