import { spawn } from "child_process"
import on from "wait-on"
import kill from "tree-kill"
import gql from "gatsby-source-wordpress-experimental/utils/gql"
import { authedWPGQLRequest } from "./authed-wpgql-request"

export const runGatsby = async () => {
  let gatsbyProcess

  beforeAll(async () => {
    if (process.env.WPGQL_INCREMENT) {
      // mutate remote schema
      await authedWPGQLRequest(gql`
        mutation {
          updatePage(
            input: {
              id: "cGFnZToxMQ=="
              title: "testing 1"
              clientMutationId: "increment-test"
            }
          ) {
            clientMutationId
          }
        }
      `)
    }

    gatsbyProcess = spawn(`yarn`, [`develop-test-runtime`], {
      env: {
        ...process.env,
        NODE_ENV: `development`,
      },
    })

    gatsbyProcess.stdout.pipe(process.stdout)

    await on({ resources: [`http://localhost:8000`] })
  })

  afterAll(async () => {
    if (process.env.WPGQL_INCREMENT) {
      // change remote schema back
      await authedWPGQLRequest(gql`
        mutation {
          updatePage(
            input: {
              id: "cGFnZToxMQ=="
              title: "Home"
              clientMutationId: "de-increment-test"
            }
          ) {
            clientMutationId
          }
        }
      `)
    }

    kill(gatsbyProcess.pid)
  })
}
