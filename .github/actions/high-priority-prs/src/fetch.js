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
          reviewRequests(first: 10) {
            nodes {
              requestedReviewer {
                ... on Team {
                  id
                  name
                }
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
    data = await tools.github.graphql(query, {
      headers: {
        authorization: `token ${process.env.PERSONAL_GITHUB_TOKEN}`,
      },
    })
    // const filecontents = tools.getFile(
    //   ".github/actions/high-priority-prs/src/data.json"
    // )
    // data = JSON.parse(filecontents)
    tools.log.info("-----------BEGIN DATA-----------")
    tools.log.info(data.repository.pullRequests)
    tools.log.info(data.repository.pullRequests.nodes[0])
    tools.log.info("-----------END DATA-----------")
  } catch (error) {
    tools.log.fatal(error)
    tools.exit.failure()
  }

  // do something great with this precious data
  return data
}
