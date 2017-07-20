import React from "react"
import Link from "gatsby-link"

class StoryItem extends React.Component {
  render() {
    const item = this.props.item
    return (
      <div>
        <div>
          <a href={item.url} className="storylink">
            {item.name}
          </a>
        </div>
        <div>
          <Link to={`/item/${item.id}/`}>more details</Link>
          {` `}
        </div>
        <br />
        <br />
      </div>
    )
  }
}

export default StoryItem

export const storyFragment = graphql`
  fragment Story_item on mongoDBDocField {
    id
    url
    name
  }
`
