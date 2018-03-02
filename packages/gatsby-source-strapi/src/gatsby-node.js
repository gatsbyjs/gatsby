import fetchData from "./fetch"
import { Node } from "./nodes"
import { capitalize } from "lodash"

exports.sourceNodes = async (
  { boundActionCreators },
  { apiURL = `http://localhost:1337`, contentTypes = [] }
) => {
  const { createNode } = boundActionCreators

  // Generate a list of promises based on the `contentTypes` option.
  const promises = contentTypes.map(contentType =>
    fetchData({
      apiURL,
      contentType,
    })
  )

  // Execute the promises.
  const data = await Promise.all(promises)

  // Create nodes.
  contentTypes.forEach((contentType, i) => {
    const items = data[i]

    items.forEach(item => {
      const node = Node(capitalize(contentType), item)
      createNode(node)
    })
  })
}
