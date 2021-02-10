const globula = require("glob")
const fs = require("fs-extra")

describe(`query generation`, () => {
  const gqlDirectory = `${process.cwd()}/test-site/WordPress/GraphQL`

  const graphqlFilePaths = globula.sync(`${gqlDirectory}/**/*.graphql`)

  const graphqlQueriesByType = graphqlFilePaths.reduce((accumulator, path) => {
    const relativePath = path.replace(`${gqlDirectory}/`, ``)

    // relative paths are named like Page/query.graphql and Post/query.graphql
    const [typeName, fileName] = relativePath.split(`/`)

    // filenames are named like node-preview-query.graphql
    // so the first index will be the type of the query
    const key = fileName.split(`-`)[1]

    if (!accumulator[typeName]) {
      accumulator[typeName] = {
        typeName,
      }
    }

    accumulator[typeName][key] = path

    return accumulator
  }, [])

  Object.values(graphqlQueriesByType).forEach(({ typeName, ...queries }) => {
    Object.entries(queries).forEach(([queryTitle, queryFilePath]) => {
      test(`${typeName} node ${queryTitle} query hasn't changed`, () => {
        const fileContents = fs.readFileSync(queryFilePath, {
          encoding: `utf8`,
        })
        expect(fileContents).toMatchSnapshot()
      })
    })
  })
})
