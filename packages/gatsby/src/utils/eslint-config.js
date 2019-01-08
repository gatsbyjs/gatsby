import { printSchema } from "graphql"

module.exports = schema => {
  return {
    useEslintrc: false,
    baseConfig: {
      globals: {
        graphql: true,
        __PATH_PREFIX__: true,
      },
      extends: `react-app`,
      plugins: [`graphql`],
      rules: {
        "import/no-webpack-loader-syntax": [0],
        "graphql/template-strings": [
          `error`,
          {
            env: `relay`,
            schemaString: printSchema(schema, { commentDescriptions: true }),
            tagName: `graphql`,
          },
        ],
      },
    },
  }
}
