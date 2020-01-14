import gql from "../utils/gql"

export const getActionMonitorQuery = () => `
    query GET_ACTION_MONITOR_ACTIONS($since: Float!) {
      actionMonitorActions(where: {sinceTimestamp: $since}) {
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

const availablePostTypesSelectionSet = gql`
  postTypes {
    fieldNames {
      plural
      singular
    }
    typeName
  }
`

export const getAvailablePostTypesQuery = () => `
  {
    ${availablePostTypesSelectionSet}
  }
`
export const introspectionQuery = `
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
