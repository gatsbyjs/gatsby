const unified = require(`unified`)
const remarkMdx = require(`remark-mdx`)
const remarkParse = require(`remark-parse`)
const remarkStringify = require(`remark-stringify`)
const visit = require(`unist-util-visit`)
const fetch = require('node-fetch')
const fs = require('fs-extra')
const isUrl = require('is-url')
const path = require('path')

const extractImports = require('./extract-imports')
const removeElementByName = require('./remove-element-by-name')
const jsxToJson = require(`./jsx-to-json`)

const asRoot = nodes => {
  return {
    type: `root`,
    children: nodes,
  }
}

const toJson = value => {
  const obj = {}
  jsxToJson(value).forEach(([type, props = {}]) => {
    if (type === `\n`) {
      return
    }
    obj[type] = obj[type] || []
    obj[type].push(props)
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

const u = unified()
  .use(remarkParse)
  .use(remarkStringify)
  .use(remarkMdx)

const handleImports = tree => {
  let imports = {}
  visit(tree, 'import',  async (node, index, parent) => {
    imports = { ...imports, ...extractImports(node.value) }
    parent.children.splice(index, 1)
  })
  return imports
}

const unwrapImports = async (tree, imports) => {
  return new Promise((resolve, reject) => {
    let count = 0

    visit(tree, 'jsx', () => {
      count++
    })

    if (count === 0) {
      return resolve()
    }

    visit(tree, 'jsx', async (node, index, parent) => {
      const names = toJson(node.value)
      const _newValue = removeElementByName(node.value, { names: Object.keys(imports) })
  
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
          parent.children = parent.children.flat()
          resolve()
        })
      }
    })
  })
}

const partitionSteps = ast => {
  const steps = []
  let index = 0
  ast.children.forEach(node => {
    if (node.type === `thematicBreak`) {
      index++
      return
    }

    steps[index] = steps[index] || []
    steps[index].push(node)
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
  const ast = u.parse(src)
  const imports = handleImports(ast)
  await unwrapImports(ast, imports)
  const steps = partitionSteps(ast)

  return {
    ast,
    steps,
    commands: extractCommands(steps),
    stepsAsMdx: steps.map(toMdx),
    stepsAsMdxWithoutJsx: steps.map(toMdxWithoutJsx),
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
    const result = await fetch(pathOrUrl)
    const src = await result.text()
    return src
  }
  if (isRelative(pathOrUrl)) {
    recipePath = path.join(projectRoot, pathOrUrl)
  } else {
    recipePath = path.join(__dirname, pathOrUrl)
  }
  if (recipePath.slice(-4) !== `.mdx`) {
    recipePath += `.mdx`
  }

  const src = await fs.readFile(recipePath, 'utf8')
  return src
}

module.exports = async (recipePath, projectRoot) => {
  const src = await getSource(recipePath, projectRoot)
  const result = await parse(src)
  return result
}

module.exports.parse = parse