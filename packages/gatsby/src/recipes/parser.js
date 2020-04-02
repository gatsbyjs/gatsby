const unified = require(`unified`)
const remarkMdx = require(`remark-mdx`)
const remarkParse = require(`remark-parse`)
const remarkStringify = require(`remark-stringify`)
const jsxToJson = require(`simplified-jsx-to-json`)
const visit = require(`unist-util-visit`)
const remove = require('unist-util-remove')

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
  visit(stepAst, 'jsx', (node, index, parent) => {
    parent.children.splice(index, 1)
  })
  // remove(stepAst, 'jsx')
  return u.stringify(stepAst)
}

module.exports = src => {
  const ast = u.parse(src)
  const steps = partitionSteps(ast)

  return {
    ast,
    steps,
    commands: extractCommands(steps),
    stepsAsMdx: steps.map(toMdx),
    stepsAsMdxWithoutJsx: steps.map(toMdxWithoutJsx)
  }
}
