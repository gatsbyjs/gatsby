const pageFields = `
  content
  title
  link
  date
  id
`

const getPageQuery = singleName => `
  query GET_GATSBY_PAGE($id: ID!) {
    wpContent: ${singleName}(id: $id) {
      ${pageFields}
    }
  }
`

const getPaginatedQuery = query =>
  `query GENERIC_QUERY ($first: Int!, $after: String) {${query}}`

const getActionMonitorQuery = () => `
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

const getAvailablePostTypesQuery = () => `
  {
    postTypes {
      fieldNames {
        plural
        singular
      }
    }
  }
`

module.exports = {
  getPageQuery,
  getPaginatedQuery,
  getActionMonitorQuery,
  getAvailablePostTypesQuery,
}
// const getPagesQuery = contentTypePlural => `
//   # Define our query variables
//   query GET_GATSBY_PAGES($first:Int $after:String) {
//     ${contentTypePlural}(
//         first: $first
//         after: $after
//       ) {
//           pageInfo {
//             hasNextPage
//             endCursor
//           }
//           nodes {
//             ${pageFields}
//           }
//       }
//   }
// `

// const getContentTypeIntrospection = singleName => ``
