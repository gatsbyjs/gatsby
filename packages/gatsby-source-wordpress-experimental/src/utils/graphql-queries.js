import gql from "./gql"

/**
 * Used to fetch WP changes since a unix timestamp
 * so we can do incremental data fetches
 */
export const actionMonitorQuery = gql`
  query GET_ACTION_MONITOR_ACTIONS($since: Float!, $after: String) {
    # @todo add pagination in case there are more than 100 actions since the last build
    actionMonitorActions(
      where: { sinceTimestamp: $since, orderby: { field: DATE, order: ASC } }
      first: 100
      after: $after
    ) {
      nodes {
        id
        title
        actionType
        referencedNodeID
        referencedNodeStatus
        referencedNodeGlobalRelayID
        referencedNodeSingularName
        referencedNodePluralName
      }
      pageInfo {
        hasNextPage
        endCursor
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
        enumValues {
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
