const { authedWPGQLRequest } = require("./authed-wpgql-request")

exports.resetSchema = async () => {
  console.log(`unmutating remote api`)
  return authedWPGQLRequest(/* GraphQL */ `
    mutation {
      updatePage(
        input: {
          id: "cG9zdDoy"
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
}

exports.mutateSchema = async () => {
  console.log(`mutating remote api`)

  return authedWPGQLRequest(/* GraphQL */ `
    mutation {
      updatePage(
        input: {
          id: "cG9zdDoy"
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
}
