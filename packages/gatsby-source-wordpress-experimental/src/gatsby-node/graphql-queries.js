import gql from "../utils/gql"

export const getActionMonitorQuery = () => `
    query GET_ACTION_MONITOR_ACTIONS($since: Float!) {
      actionMonitorActions(where: {sinceTimestamp: $since}) {
        nodes {
          referencedPostID
          referencedPostStatus
          referencedPostGlobalRelayID
          referencedPostSingleName
          referencedPostPluralName
          actionType
        }
      }
    }
  `

export const getAvailablePostTypesQuery = () => `
  {
    postTypes {
      fieldNames {
        plural
        singular
      }
    }
  }
`
export const introspectionQuery = gql`
  {
    __schema {
      queryType {
        fields {
          name
          args {
            type {
              kind
            }
          }
          type {
            kind
            name
            possibleTypes {
              kind
              name
            }
            fields {
              name
              args {
                type {
                  kind
                }
              }
              type {
                name
                kind
                possibleTypes {
                  kind
                  name
                }
                ofType {
                  kind
                  name
                  fields {
                    name
                  }
                }
                fields {
                  name
                  args {
                    type {
                      kind
                    }
                  }
                  type {
                    kind
                    name
                    possibleTypes {
                      kind
                      name
                    }
                    ofType {
                      kind
                      name
                      fields {
                        name
                      }
                    }
                    fields {
                      name
                      args {
                        type {
                          kind
                        }
                      }
                      type {
                        name
                        kind
                        possibleTypes {
                          kind
                          name
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`
