import fetch from "isomorphic-fetch"

const fetchGraphql = async ({ url, query, variables = {} }) => {
  const response = await fetch(url, {
    method: `POST`,
    headers: { "Content-Type": `application/json` },
    body: JSON.stringify({ query, variables }),
  })

  if (response.status !== 200) {
    console.error(`[gatsby-source-wordpress] Couldn't connect to ${url}`)
    process.exit()
  }

  const contentType = response.headers.get(`content-type`)

  if (!contentType.includes(`application/json;`)) {
    console.error(
      `[gatsby-source-wordpress] Unable to connect to WPGraphQL.
        Double check that your WordPress URL is correct and WPGraphQL is installed.
        ${url}`
    )
    process.exit()
  }

  const json = await response.json()

  if (json.errors) {
    json.errors.forEach(error => {
      console.error(error)
    })
    process.exit()
  }

  return json
}

export default fetchGraphql
