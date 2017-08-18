import React from "react"
import Link from "gatsby-link"

class Item extends React.Component {
  render() {
    console.log(this.props)
    const story = this.props.data.mongodbCloudDocuments

    console.log(story)
    return (
      <div>
        <a href={story.url} className="itemlink">
          {story.name}
        </a>
        <p>
          <div dangerouslySetInnerHTML={{ __html: story.children[0].children[0].html }} className="story" />
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
      children {
          ... on mongodbCloudDocumentsDescriptionMappingNode {
            id
            children {
              ... on MarkdownRemark {
                id
                html
              }
            }
          }
      }
    }
  }
`
