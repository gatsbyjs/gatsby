const OLD_NAME = `boundActionCreators`
const NEW_NAME = `actions`

module.exports = (file, api, options) => {
  const j = api.jscodeshift
  const root = j(file.source)

  root.find(j.Identifier).forEach(path => {
    if (path.value.name === OLD_NAME) {
      path.value.name = NEW_NAME
    }
  })

  return root.toSource({ lineTerminator: `\n` })
}
