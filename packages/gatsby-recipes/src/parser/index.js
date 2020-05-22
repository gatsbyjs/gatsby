const unified = require(`unified`)
const remarkMdx = require(`remark-mdx`)
const remarkParse = require(`remark-parse`)
const remarkStringify = require(`remark-stringify`)
const visit = require(`unist-util-visit`)
const fetch = require(`node-fetch`)
const fs = require(`fs-extra`)
const isUrl = require(`is-url`)
const path = require(`path`)
const _ = require(`lodash`)

const extractImports = require(`./extract-imports`)
const removeElementByName = require(`./remove-element-by-name`)
const jsxToJson = require(`./jsx-to-json`)

const asRoot = nodes => {
  return {
    type: `root`,
    children: nodes,
  }
}

const toJson = value => {
  const obj = {}
  const values = jsxToJson(value)
  values.forEach(([type, props = {}]) => {
    if (type === `\n`) {
      return undefined
    }
    obj[type] = obj[type] || []
    obj[type].push(props)
    return undefined
  })
  return obj
}

const extractCommands = steps => {
  const commands = steps
    .map(nodes => {
      const stepAst = asRoot(nodes)
      let cmds = []
      visit(stepAst, `jsx`, node => {
        const jsx = node.value
        cmds = cmds.concat(toJson(jsx))
      })
      return cmds
    })
    .reduce((acc, curr) => {
      const cmdByName = {}
      curr.map(v => {
        Object.entries(v).forEach(([key, value]) => {
          cmdByName[key] = cmdByName[key] || []
          cmdByName[key] = cmdByName[key].concat(value)
        })
      })
      return [...acc, cmdByName]
    }, [])

  return commands
}

const u = unified().use(remarkParse).use(remarkStringify).use(remarkMdx)

const handleImports = tree => {
  let imports = {}
  visit(tree, `import`, async (node, index, parent) => {
    imports = { ...imports, ...extractImports(node.value) }
    parent.children.splice(index, 1)
  })
  return imports
}

const unwrapImports = async (tree, imports) =>
  new Promise((resolve, reject) => {
    if (!Object.keys(imports).length) {
      return resolve()
    }

    let count = 0

    visit(tree, `jsx`, () => {
      count++
    })

    if (count === 0) {
      return resolve()
    }

    return visit(tree, `jsx`, async (node, index, parent) => {
      let names
      try {
        names = toJson(node.value)
        removeElementByName(node.value, {
          names: Object.keys(imports),
        })
      } catch (e) {
        throw e
      }

      if (names) {
        Object.keys(names).map(async name => {
          const url = imports[name]
          if (!url) {
            return resolve()
          }

          const result = await fetch(url)
          const mdx = await result.text()
          const nodes = u.parse(mdx).children
          parent.children.splice(index, 1, nodes)
          parent.children = _.flatten(parent.children)
          return resolve()
        })
      }
    })
  })

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

const toMdxWithoutJsx = nodes => {
  const stepAst = asRoot(nodes)
  visit(stepAst, `jsx`, (node, index, parent) => {
    parent.children.splice(index, 1)
  })
  return u.stringify(stepAst)
}

const parse = async src => {
  try {
    const ast = u.parse(src)
    const imports = handleImports(ast)
    await unwrapImports(ast, imports)
    const steps = partitionSteps(ast)
    const commands = extractCommands(steps)

    return {
      ast,
      steps,
      commands,
      stepsAsMdx: steps.map(toMdx),
      stepsAsMdxWithoutJsx: steps.map(toMdxWithoutJsx),
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
