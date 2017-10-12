import React from "react"
import Link from "gatsby-link"

class Item extends React.Component {
  render() {
    const story = this.props.data.mongodbCloudDocuments

    return (
      <div>
        <a href={story.url} className="itemlink">
          {story.name}
        </a>
        <p>
          <div
            dangerouslySetInnerHTML={{
              __html: story.description.childMarkdownRemark.html,
            }}
            className="story"
          />
        </p>
      </div>
    )
  }
}

export default Item

export const pageQuery = graphql`
  query ItemQuery($id: String!) {
    mongodbCloudDocuments(id: { eq: $id }) {
      id
      name
      url
      description {
        childMarkdownRemark {
          html
        }
      }
    }
  }
`
