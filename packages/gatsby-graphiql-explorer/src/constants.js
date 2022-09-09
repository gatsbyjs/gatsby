export const FALLBACK_QUERY = `# Welcome to GraphiQL
#
# GraphiQL is an in-browser IDE for writing, validating, and testing GraphQL queries.
#
# Type queries into this side of the screen and you will see intellisense suggestions.
# GraphQL queries typically start with a "{" character, lines that starts with a # are ignored.
#
# You can find the keyboard shortcuts in the bottom left corner.`

export const LOCAL_STORAGE_NAMES = {
  operationName: `graphiql:operationName`,
  query: `graphiql:query`,
  variables: `graphiql:variables`,
  tabState: `graphiql:tabState`,
}

export const GRAPHIQL_URL = `/___graphql`
export const REFRESH_URL = `/__refresh`
