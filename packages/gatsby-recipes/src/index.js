// data = { recipe?: string, graphqlPort: number, projectRoot: string }
module.exports = async data => {
  const cli = require(`import-jsx`)(require.resolve(`./cli`))
  return cli(data)
}
