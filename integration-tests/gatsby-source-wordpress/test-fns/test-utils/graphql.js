/**
 *
 * @param {Object} options
 * @param {string} options.url
 * @param {string} options.query
 * @param {Object} options.variables
 * @param {Object} options.headers
 *
 * @returns {Promise<Object>}
 */
exports.fetchGraphql = async ({ url, query, variables = {}, headers = {} }) => {
  const response = await fetch(url, {
    method: `POST`,
    headers: {
      "Content-Type": `application/json`,
      ...headers,
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  })
  const data = await response.json()
  if (data.errors) {
    throw new Error(JSON.stringify(data.errors))
  }
  return data
}
