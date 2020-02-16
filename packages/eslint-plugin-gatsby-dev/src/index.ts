import GatsbyCliNoDirectReactImports from "./gatsby-cli/no-direct-react-imports"

export const rules = {
  "no-direct-react-imports": GatsbyCliNoDirectReactImports,
}

export const configs = {
  recommended: {
    plugins: [`gatsby-dev`],
    rules: {},
  },
}
