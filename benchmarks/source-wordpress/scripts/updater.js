const fetchGraphql = require(`gatsby-source-wordpress/dist/utils/fetch-graphql`)
  .default

const faker = require(`faker`)

const authedWPGQLRequest = async query => {
  if (!process.env.BENCHMARK_WPGRAPHQL_URL) {
    console.error(`No process.env.BENCHMARK_WPGRAPHQL_URL url found`)
    process.exit(1)
  }
  const { errors, data } = await fetchGraphql({
    url: process.env.BENCHMARK_WPGRAPHQL_URL,
    query,
    headers: {
      Authorization: `Basic ${Buffer.from(
        `${process.env.BENCHMARK_WORDPRESS_USERNAME}:${process.env.BENCHMARK_WORDPRESS_PASSWORD}`
      ).toString(`base64`)}`,
    },
  })

  if (errors && errors.length) {
    errors.forEach(error => console.error(error))
    throw new Error(
      `There were some problems making a request to WPGQL. See above for more info`
    )
  }

  return data
}

// Remove last word of title and replace it with a random word.
const updateTitle = title =>
  `${title.substring(0, title.lastIndexOf(` `))} ${faker.lorem.word()}`

const mutateArticle = async article => {
  const newTitle = updateTitle(article.title)

  await authedWPGQLRequest(/* GraphQL */ `
    mutation {
      updatePost(
        input: {
          clientMutationId: "${newTitle}"
          id: "${article.id}"
          title: "${newTitle}"
        }
      ) {
        clientMutationId
        post {
          title
        }
      }
    }
  `)

  console.log(`Updated post ${article.id} with new title ${newTitle}`)
}

const getFirstArticle = async () => {
  const { posts } = await authedWPGQLRequest(/* GraphQL */ `
    {
      posts(first: 1, where: { orderby: { field: DATE, order: DESC } }) {
        nodes {
          title
          id
        }
      }
    }
  `)

  return posts.nodes[0]
}

const update = async ({ username, password, server }) => {
  if (!username || !password || !server) {
    console.error(
      `You must add the BENCHMARK_WORDPRESS_USERNAME, BENCHMARK_WORDPRESS_PASSWORD and BENCHMARK_WPGRAPHQL_URL env variables`
    )
    return
  }

  const article = await getFirstArticle()
  await mutateArticle(article)
}

module.exports = update
