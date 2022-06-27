export const ROUTES_DIRECTORY =
  _CFLAGS_.GATSBY_MAJOR === `4` ? `.cache/page-ssr/routes/` : `public/`

export const RUNNING_IN_GRAPHQL_ENGINE_VAR_NAME = `BUNDLER_CONFIG_RUNNING_IN_GRAPHQL_ENGINE`
export const RUNNING_IN_GRAPHQL_ENGINE =
  // @ts-ignore filled by webpack config for engines
  typeof BUNDLER_CONFIG_RUNNING_IN_GRAPHQL_ENGINE !== `undefined` ? true : false
