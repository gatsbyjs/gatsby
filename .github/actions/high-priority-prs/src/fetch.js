const { Toolkit } = require("actions-toolkit")
const tools = new Toolkit()
const query = `
query GitHubOpenPullRequestsQuery {
    repository(name: "gatsby", owner: "gatsbyjs") {
      pullRequests(
        orderBy: { direction: ASC, field: UPDATED_AT }
        first: 100
        states: OPEN
        baseRefName: "master"
      ) {
        totalCount
        nodes {
          createdAt
          updatedAt
          title
          url
          author {
            url
          }
          baseRefName
          comments(first: 100) {
            totalCount
            nodes {
              createdAt
              author {
                url
              }
            }
          }
          commits(last: 50) {
            totalCount
            nodes {
              commit {
                authoredDate
                message
              }
            }
          }
          reviews(last: 100) {
            totalCount
            nodes {
              createdAt
              author {
                url
              }
            }
          }
        }
      }
    }
}
`

module.exports = async () => {
  let data
  try {
    data = await tools.github.graphql(query)
  } catch (error) {
    tools.log.fatal(error)
    tools.exit.failure()
  }

  // do something great with this precious data
  return data
}
