const path = require(`path`)
const fs = require(`fs`)

exports.createSchemaCustomization = ({ actions, store, reporter }) => {
  const { directory } = store.getState().program
  const { createTypes, printTypeDefinitions } = actions

  const options = {
    path: path.resolve(directory + `/schema.gql`),
  }

  const filePath = options.path

  if (fs.existsSync(options.path)) {
    reporter.info(`Reading GraphQL type definitions from ${filePath}`)
    const schema = fs.readFileSync(filePath, { encoding: `utf-8` })
    createTypes(schema)
  }
  printTypeDefinitions(options)
}
