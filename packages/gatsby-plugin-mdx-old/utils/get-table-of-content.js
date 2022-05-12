const visit = require(`unist-util-visit`)

// parse mdast-utils-toc object to JSON object:
//
// {"items": [{
//   "url": "#something-if",
//   "title": "Something if",
//   "items": [
//     {
//       "url": "#something-else",
//       "title": "Something else"
//     },
//     {
//       "url": "#something-elsefi",
//       "title": "Something elsefi"
//     }
//   ]},
//   {
//     "url": "#something-iffi",
//     "title": "Something iffi"
//   }]}
//
// TODO: fully test it with different options, tight=True
//
function getItems(node, current) {
  if (!node) {
    return {}
  } else if (node.type === `paragraph`) {
    visit(node, item => {
      if (item.type === `link`) {
        current.url = item.url
      }
      if (item.type === `text`) {
        current.title = item.value
      }
    })
    return current
  } else {
    if (node.type === `list`) {
      current.items = node.children.map(i => getItems(i, {}))
      return current
    } else if (node.type === `listItem`) {
      const heading = getItems(node.children[0], {})
      if (node.children.length > 1) {
        getItems(node.children[1], heading)
      }
      return heading
    }
  }
  return {}
}
module.exports = getItems
