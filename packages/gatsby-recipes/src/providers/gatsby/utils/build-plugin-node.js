const t = require(`@babel/types`)
const template = require(`@babel/template`).default

module.exports = ({ name, options, key }) => {
  if (!options && !key) {
    return t.stringLiteral(name)
  }

  const pluginWithOptions = template(`
    const foo = {
      resolve: '${name}',
      options: ${JSON.stringify(options, null, 2)},
      ${key ? `__key: "` + key + `"` : ``}
    }
  `)()

  return pluginWithOptions.declarations[0].init
}
