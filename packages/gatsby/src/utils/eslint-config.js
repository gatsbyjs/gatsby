import { printSchema } from "graphql"

module.exports = schema => {
  return {
    useEslintrc: false,
    baseConfig: {
      globals: {
        graphql: true,
        __DISABLE_ALL_REDIRECTS_BECASUE_IM_USING_GATSBY_AS_A_STATIC_PAGE_GENERATOR__: false,
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
