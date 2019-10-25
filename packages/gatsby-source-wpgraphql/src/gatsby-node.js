const url = require(`url`)

const getPagesQuery = postType => `
  # Define our query variables
  query GET_GATSBY_PAGES($first:Int $after:String) {
    wpgraphql {
      ${postType}(
        first: $first
        after:$after
      ) {
          pageInfo {
            hasNextPage
            endCursor
          }
          nodes {
            content
            title
            link
            date
            id
          }
      }
    }
  }
`

/**
 * Array to store allpagess. We make paginated requests
 * to WordPress to get allpagess, and once we have all pages,
 * then we iterate over them to create pages.
 *
 * @type {Array}
 */
const allPages = []

/**
 * Fetch pages method. This accepts variables to alter
 * the query. The variable `first` controls how many items to
 * request per fetch and the `after` controls where to start in
 * the dataset.
 *
 * @param variables
 * @returns {Promise<*>}
 */
const fetchPostTypePages = async ({ graphql, postType, ...variables }) => {
  const query = getPagesQuery(postType)
  const { data } = await graphql(query, variables)

  const {
    wpgraphql: {
      [postType]: {
        nodes,
        pageInfo: { hasNextPage, endCursor },
      },
    },
  } = data

  if (nodes) {
    nodes.forEach(pages => {
      allPages.push(pages)
    })
  }

  /**
   * If there's another page, fetch more
   * so we can have all the data we need.
   */
  if (hasNextPage) {
    pageNumber++
    console.log(`fetch page ${pageNumber} of pages...`)
    return fetchPostTypePages({
      first: 10,
      after: endCursor,
      graphql,
      postType,
    })
  }

  /**
   * Once we're done, return all the pages
   * so we can create the necessary pages with
   * all the data on hand.
   */
  return allPages
}

/**
 * We track the page number so we can output the page number to the console.
 *
 * @type {number}
 */
let pageNumber = 0

const getAvailablePostTypes = async ({ graphql }) => {
  const postTypesQuery = await graphql(`
    query SITE_META {
      wpgraphql {
        postTypes {
          fieldNames {
            plural
          }
        }
      }
    }
  `)

  const postTypes =
    postTypesQuery.data &&
    postTypesQuery.data.wpgraphql &&
    postTypesQuery.data.wpgraphql.postTypes
      ? postTypesQuery.data.wpgraphql.postTypes
      : [`pages`, `posts`]

  return postTypes
}

const createContentNodes = async ({ actions, graphql }) => {
  const { createPage } = actions

  const postTypes = await getAvailablePostTypes({ graphql })

  await Promise.all(
    postTypes.map(async postType => {
      /**
       * Kick off our `fetchPostTypePages` method which will get us all
       * the pages we need to create individual pages.
       */
      const allPages = await fetchPostTypePages({
        first: 10,
        after: null,
        postType: postType.fieldNames.plural,
        graphql,
      })

      if (!allPages) {
        return
      }

      /**
       * Map over the allPages array to create the
       * single pages
       */
      await Promise.all(
        allPages.map(async page => {
          const { pathname } = url.parse(page.link)
          console.log(`create pages: ${pathname}`)

          // await createPage({
          //   path: pathname,
          //   component: pageTemplate,
          //   context: {
          //     id: page.id,
          //   },
          // })
        })
      )
    })
  )
}

exports.sourceNodes = async ({ actions, graphql }) => {
  await createContentNodes({ actions, graphql })
}
