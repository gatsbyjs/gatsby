const { Toolkit } = require("actions-toolkit")
const tools = new Toolkit()
const query = `
query GitHubOpenPullRequestsQuery {
    repository(name: "gatsby", owner: "gatsbyjs") {
      pullRequests(
        orderBy: { direction: ASC, field: CREATED_AT }
        first: 100
        states: OPEN
        baseRefName: "master"
      ) {
        totalCount
        nodes {
          createdAt
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
          commits(last: 1) {
            totalCount
            nodes {
              commit {
                authoredDate
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

async function start() {
  let data
  try {
    data = await tools.github.graphql(query)
  } catch (error) {
    tools.log.fatal(error)
    tools.exit.failure()
  }

  // do something great with this precious data
  if (data) require(`./process`)(data)
}

start()
