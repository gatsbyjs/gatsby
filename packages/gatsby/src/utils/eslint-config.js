import { printSchema } from "graphql"

module.exports = schema => {
  return {
    useEslintrc: false,
    baseConfig: {
      globals: {
        graphql: true,
      },
      extends: `react-app`,
      plugins: [`graphql`],
      rules: {
        "graphql/template-strings": [
          `error`,
          {
            env: `relay`,
            schemaString: printSchema(schema),
            tagName: `graphql`,
          },
        ],
      },
    },
  }
}
