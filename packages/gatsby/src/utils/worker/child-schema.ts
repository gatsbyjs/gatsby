import reporter from "gatsby-cli/lib/reporter"
import apiRunnerNode from "../api-runner-node"
import { IGatsbyState } from "../../redux/types"
import { store } from "../../redux"
import { build } from "../../schema"
import { createGraphQLRunner } from "../../bootstrap/create-graphql-runner"

interface IWorkerBuildSchemaContext {
  workerNumber: number
  flattenedPlugins: IGatsbyState["flattenedPlugins"]
  inferenceMetadata: IGatsbyState["inferenceMetadata"]
}

export async function buildSchema(
  context: IWorkerBuildSchemaContext
): Promise<void> {
  reporter.log(
    `building schema start ${process.pid} - ${process.env.JEST_WORKER_ID}`
  )

  // we need to "hydrate" plugins in worker so api-runner-node knows about them
  store.dispatch({
    type: `SET_SITE_FLATTENED_PLUGINS`,
    payload: context.flattenedPlugins,
  })

  // we reuse inference metadata from main process to avoid inferring again
  store.dispatch({
    type: `SET_INFERENCE_METADATA`,
    payload: context.inferenceMetadata,
  })

  // gatsby-plugin-sharp captures `actions` in onPreBootstrap, so we do need to call it.
  // alternative would be adjusting gatsby-plugin-sharp not to rely on this but it's unclear
  // how to do this quickly that isn't even more hacky than what it currently does
  await apiRunnerNode(`onPreBootstrap`)

  // need to call createSchemaCustomization as that doesn't happen inside schema building (as opposed to `createResolvers` and `setFieldsOnGraphQLNodeType`)
  await apiRunnerNode(`createSchemaCustomization`)

  // we will have inference metadata from main process
  await build({ fullMetadataBuild: false })

  reporter.log(
    `building schema end ${process.pid} - ${process.env.JEST_WORKER_ID}`
  )

  reporter.log(`run query start ${process.pid} - ${process.env.JEST_WORKER_ID}`)

  const graphql = createGraphQLRunner(store, reporter)

  // this is hardcoded query against schema from gatsby-starter-blog
  // (with addition of`inferred` field which is added to frontmatter
  // of one of posts and`justSchemaCustomization` that is added by
  // schema customization but without actual data), just to test
  // if created schema can execute
  const result = await graphql(
    `
      query {
        site {
          siteMetadata {
            title
          }
        }
        allMarkdownRemark(sort: { fields: [frontmatter___date], order: DESC }) {
          nodes {
            excerpt
            fields {
              slug
            }
            frontmatter {
              date(formatString: "MMMM DD, YYYY")
              title
              description
              inferred
              justSchemaCustomization
            }
          }
        }
      }
    `,
    {}
  )

  reporter.log(`run query end ${process.pid} - ${process.env.JEST_WORKER_ID}`)

  require(`fs-extra`).outputFile(
    `q-worker-${process.env.JEST_WORKER_ID}.json`,
    JSON.stringify(result, null, 2)
  )
}
