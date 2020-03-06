import { spawn } from "child_process"
import on from "wait-on"
import kill from "tree-kill"
import gql from "gatsby-source-wordpress-experimental/utils/gql"
import { authedWPGQLRequest } from "./authed-wpgql-request"

const resetSchema = async () =>
  authedWPGQLRequest(gql`
    mutation {
      updatePage(
        input: {
          id: "cGFnZToy"
          title: "Sample Page"
          clientMutationId: "de-increment-test"
        }
      ) {
        clientMutationId
      }
      updatePost(
        input: {
          clientMutationId: "post-test"
          id: "cG9zdDox"
          title: "Hello world!"
        }
      ) {
        clientMutationId
      }
      updateUser(
        input: {
          clientMutationId: "user-test"
          firstName: "Tyler"
          id: "dXNlcjox"
        }
      ) {
        clientMutationId
      }
    }
  `)

const mutateSchema = async () =>
  authedWPGQLRequest(gql`
    mutation {
      updatePage(
        input: {
          id: "cGFnZToy"
          title: "Sample Page DELTA SYNC"
          clientMutationId: "increment-test"
        }
      ) {
        clientMutationId
      }
      updatePost(
        input: {
          clientMutationId: "post-test"
          id: "cG9zdDox"
          title: "Hello world! DELTA SYNC"
        }
      ) {
        clientMutationId
      }
      updateUser(
        input: {
          clientMutationId: "user-test"
          firstName: "Tyler DELTA SYNC"
          id: "dXNlcjox"
        }
      ) {
        clientMutationId
      }
    }
  `)

export const runGatsby = async () => {
  let gatsbyProcess

  beforeAll(async () => {
    if (process.env.WPGQL_INCREMENT) {
      await mutateSchema()
    } else {
      await resetSchema()
    }

    gatsbyProcess = spawn(`yarn`, [`develop-test-runtime`], {
      env: {
        ...process.env,
        NODE_ENV: `development`,
      },
    })

    if (process.env.SHOW_GATSBY_PROCESS_STDOUT) {
      gatsbyProcess.stdout.pipe(process.stdout)
    } else {
      console.log(
        `running \`gatsby develop\` via \`yarn develop-test-runtime\`...`
      )
    }

    await on({ resources: [`http://localhost:8000`] })
  })

  afterAll(async () => {
    if (process.env.WPGQL_INCREMENT) {
      await resetSchema()
    }

    kill(gatsbyProcess.pid)
  })
}
