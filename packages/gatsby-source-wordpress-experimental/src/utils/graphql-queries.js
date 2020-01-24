import gql from "./gql"

/**
 * Used to fetch WP changes since a unix timestamp
 * so we can do incremental data fetches
 */
export const actionMonitorQuery = gql`
  query GET_ACTION_MONITOR_ACTIONS($since: Float!) {
    actionMonitorActions(where: { sinceTimestamp: $since }) {
      nodes {
        referencedPostID
        referencedPostStatus
        referencedPostGlobalRelayID
        referencedPostSingularName
        referencedPostPluralName
        actionType
      }
    }
  }
`

/**
 * Returns a list of post types and some info about
 * their root field names and type names
 */
export const availablePostTypesQuery = gql`
  {
    postTypes {
      fieldNames {
        plural
        singular
      }
      typeName
    }
  }
`

export const introspectionQuery = gql`
  {
    __schema {
      types {
        kind
        name
        description
        possibleTypes {
          kind
          name
        }
        interfaces {
          kind
          name
        }
        ofType {
          kind
          name
        }
        fields {
          name
          description
          args {
            type {
              kind
            }
          }
          type {
            name
            kind
            ofType {
              kind
              name
            }
          }
        }
      }

      mutationType {
        fields {
          type {
            name
          }
        }
      }
    }
  }
`
