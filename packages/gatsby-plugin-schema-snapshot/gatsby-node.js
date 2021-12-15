const fs = require(`fs`)
const path = require(`path`)

exports.createSchemaCustomization = ({ actions, reporter }, options = {}) => {
  const { createTypes, printTypeDefinitions } = actions

  if (!printTypeDefinitions) {
    reporter.error(
      `\`gatsby-plugin-schema-snapshot\` needs Gatsby v2.13.55 or above.`
    )
    return
  }

  const filePath = path.resolve(options.path || `schema.gql`)

  try {
    if (fs.existsSync(filePath)) {
      reporter.info(`Reading GraphQL type definitions from ${filePath}`)
      const schema = fs.readFileSync(filePath, { encoding: `utf-8` })

      createTypes(schema, { name: `default-site-plugin` })

      if (options.update) {
        // If this is the first time the plugin is run, we can expect there won't be a file to unlink.
        // Adding the empty try catch to just continue, since the file not existing is what is expected.
        try {
          fs.unlinkSync(filePath)
        } catch (error) {} 
        printTypeDefinitions(options)
      }
    } else {
      printTypeDefinitions(options)
    }
  } catch (error) {
    reporter.error(
      `The plugin \`gatsby-plugin-schema-snapshot\` encountered an error`, error
    )
  }
}
