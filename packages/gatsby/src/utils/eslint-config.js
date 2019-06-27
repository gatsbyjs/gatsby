import { printSchema } from "graphql"

module.exports = schema => {
  return {
    useEslintrc: false,
    baseConfig: {
      globals: {
        graphql: true,
        __PATH_PREFIX__: true,
        __BASE_PATH__: true, // this will rarely, if ever, be used by consumers
        __DISABLE_LOAD_TIME_CANONICAL_CHECK_REDIRECT__: false,
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
