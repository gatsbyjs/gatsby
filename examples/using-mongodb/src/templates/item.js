import React from "react"
import Link from "gatsby-link"

class Item extends React.Component {
  render() {
    console.log(this.props)
    const story = this.props.data.mongoDbDocField

    return (
      <div>
        <a href={story.url} className="itemlink">
          {story.name}
        </a>
        <div>
          {` `}{story.description}{` `}
        </div>
      </div>
    )
  }
}

export default Item

export const pageQuery = graphql`
  query ItemQuery($id: String!) {
    mongoDbDocField(id: { eq: $id }) {
      id
      name
      url
      description
    }
  }
`
