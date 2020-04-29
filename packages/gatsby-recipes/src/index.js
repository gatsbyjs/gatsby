module.exports = async recipe => {
  const cli = require(`import-jsx`)(require.resolve(`./cli`))
  return cli(recipe)
}
