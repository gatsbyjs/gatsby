function createImportAST(name, filePath) {
  return {
    type: `import`,
    value: `import ${name} from '${filePath}'`,
  }
}

module.exports = ({ markdownAST }) => {
  markdownAST.children = [
    createImportAST(`* as testInjection`, `@private/test-inject`),
    ...markdownAST.children,
  ]
  return markdownAST
}
