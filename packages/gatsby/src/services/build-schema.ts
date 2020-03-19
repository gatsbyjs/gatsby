const { build } = require(`../schema`)
const report = require(`gatsby-cli/lib/reporter`)
const createGraphqlRunner = require(`../bootstrap/graphql-runner`)

export async function buildSchema({ store, parentSpan }): Promise<any> {
  const activity = report.activityTimer(`building schema`, {
    parentSpan,
  })
  activity.start()
  await build({ parentSpan: activity.span })
  activity.end()
  const graphqlRunner = createGraphqlRunner(store, report)
  return {
    graphqlRunner,
  }
}
