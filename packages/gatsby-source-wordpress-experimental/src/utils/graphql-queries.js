import gql from "./gql"

/**
 * Used to fetch WP changes since a unix timestamp
 * so we can do incremental data fetches
 */
export const actionMonitorQuery = gql`
  query GET_ACTION_MONITOR_ACTIONS($since: Float!, $after: String) {
    # @todo add pagination in case there are more than 100 actions since the last build
    actionMonitorActions(
      # @todo the orderby args aren't actually doing anything here. need to fix this
      where: { sinceTimestamp: $since, orderby: { field: DATE, order: DESC } }
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
          ofType {
            kind
            name
            ofType {
              kind
              name
            }
          }
        }
        fields {
          name
          description
          args {
            name
            type {
              kind
              name
              inputFields {
                name
              }
            }
          }
          type {
            name
            kind
            ofType {
              kind
              name
              ofType {
                kind
                name
                ofType {
                  kind
                  name
                }
              }
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
