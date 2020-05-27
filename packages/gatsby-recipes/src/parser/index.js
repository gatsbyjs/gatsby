const unified = require(`unified`)
const remarkMdx = require(`remark-mdx`)
const remarkParse = require(`remark-parse`)
const remarkStringify = require(`remark-stringify`)
const fetch = require(`node-fetch`)
const fs = require(`fs-extra`)
const isUrl = require(`is-url`)
const path = require(`path`)

const asRoot = nodes => {
  return {
    type: `root`,
    children: nodes,
  }
}

const u = unified().use(remarkParse).use(remarkStringify).use(remarkMdx)

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
  const stepAst = asRoot(nodes)
  return u.stringify(stepAst)
}

const parse = async src => {
  try {
    const ast = u.parse(src)
    const steps = partitionSteps(ast)

    return {
      ast,
      steps,
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
