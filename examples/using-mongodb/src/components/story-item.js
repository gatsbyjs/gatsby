import React from "react"
import Link from "gatsby-link"

class StoryItem extends React.Component {
  render() {
    const item = this.props.item
    return (
      <li>
        <div>
          <a href={item.url}>{item.name}</a> —{` `}
          <Link to={`/item/${item.id}/`}>more details</Link>
        </div>
      </li>
    )
  }
}

export default StoryItem

export const storyFragment = graphql`
  fragment Story_item on mongodbCloudDocuments {
    id
    url
    name
  }
`
