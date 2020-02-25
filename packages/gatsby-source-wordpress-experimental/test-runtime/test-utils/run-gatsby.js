import { spawn } from "child_process"
import on from "wait-on"
import kill from "tree-kill"
import fetchGraphql from "gatsby-source-wordpress-experimental/utils/fetch-graphql"
import gql from "gatsby-source-wordpress-experimental/utils/gql"

export const runGatsby = async () => {
  let gatsbyProcess

  beforeAll(async () => {
    if (process.env.WPGQL_INCREMENT) {
      // mutate remote schema
      await fetchGraphql({
        url: process.env.WPGRAPHQL_URL,
        query: gql`
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
        `,
        headers: {
          Authorization: `Basic Y2FsZWI6dGVzdDEyMzQ=`,
        },
      })
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
      await fetchGraphql({
        url: process.env.WPGRAPHQL_URL,
        query: gql`
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
        `,
        headers: {
          Authorization: `Basic Y2FsZWI6dGVzdDEyMzQ=`,
        },
      })
    }

    kill(gatsbyProcess.pid)
  })
}
