const babelPluginAddUseInputKey = api => {
    const { types: t } = api
  
    return {
      visitor: {
        CallExpression(path) {
          const name = path.node.callee.name
          if (name !== `useInput`) {
            return undefined
          }
  
          const varDeclarations = path.parentPath.node.id?.elements || []
          if (!varDeclarations[0]) {
            return undefined
          }
  
          const keyArgument = t.stringLiteral(varDeclarations[0].name)
          const eventArgument = t.identifier(`sendEvent`)
          path.node.arguments = [keyArgument, eventArgument]
        },
      },
    }
  }
  
  export default babelPluginAddUseInputKey