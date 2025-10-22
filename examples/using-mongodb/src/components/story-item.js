import React from "react"
import { Link, graphql } from "gatsby"

function StoryItem({item}) {
  const item = item
return (
<li>
<div>
<a href={item.url}>{item.name}</a> —{` `}
<Link to={`/item/${item.id}/`}>more details</Link>
</div>
</li>
);
}

export default StoryItem

export const storyFragment = graphql`
  fragment Story_item on mongodbCloudDocuments {
    id
    url
    name
  }
`
