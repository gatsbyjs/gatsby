const { authedWPGQLRequest } = require("./authed-wpgql-request")

exports.resetSchema = async () => {
  console.log(`unmutating remote api`)
  const results = await authedWPGQLRequest(/* GraphQL */ `
    {
      pageToDelete: page(
        id: "/inc-page-with-full-static-file-url/"
        idType: URI
      ) {
        id
      }
    }
  `)

  const pageIdToRemove = results?.pageToDelete?.id

  return authedWPGQLRequest(
    /* GraphQL */ `
      mutation ($shouldRemoveAPage: Boolean!, $pageIdToRemove: ID!) {
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
            firstName: "admin"
            id: "dXNlcjo0"
          }
        ) {
          clientMutationId
        }

        removeFeaturedImageFromNodeById(
          input: { clientMutationId: "remove-featured-image", postId: 94 }
        ) {
          clientMutationId
        }

        updateMediaItemPost: updatePost(
          input: {
            clientMutationId: "post-test"
            id: "cG9zdDo5NA=="
            title: "Gutenberg: Common Blocks"
          }
        ) {
          clientMutationId
        }

        deletePage(
          input: {
            clientMutationId: "remove-page-with-full-static-file-url"
            id: $pageIdToRemove
          }
        ) @include(if: $shouldRemoveAPage) {
          clientMutationId
        }
      }
    `,
    {
      variables: {
        pageIdToRemove: pageIdToRemove ?? "",
        shouldRemoveAPage: !!pageIdToRemove,
      },
    }
  )
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
          firstName: "admin DELTA SYNC"
          id: "dXNlcjo0"
        }
      ) {
        clientMutationId
      }

      attachFeaturedImageToNodeById(
        input: {
          clientMutationId: "attach-featured-image"
          mediaItemId: 195
          postId: 94
        }
      ) {
        clientMutationId
      }

      updateMediaItemPost: updatePost(
        input: {
          clientMutationId: "post-test"
          id: "cG9zdDo5NA=="
          title: "Gutenberg: Common Blocks DELTA SYNC"
        }
      ) {
        clientMutationId
      }

      addPageWithFullStaticFileUrl: createPage(
        input: {
          clientMutationId: "add-page-with-full-static-file-url"
          authorId: 4
          title: "inc page with full static file url"
          content: "http://localhost:8001/wp-content/uploads/2020/08/file-sample_1MB.doc"
          status: PUBLISH
        }
      ) {
        clientMutationId
      }
    }
  `)
}
