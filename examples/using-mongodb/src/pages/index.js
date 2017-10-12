import React from "react"

import StoryItem from "../components/story-item"

class Index extends React.Component {
  render() {
    console.log(this.props)
    const { allMongodbCloudDocuments } = this.props.data

    return (
      <div>
        <h1>Website information stored in MongoDB</h1>
        <ul>
          {allMongodbCloudDocuments.edges.map(({ node }) => (
            <StoryItem item={node} key={node.id} />
          ))}
        </ul>
      </div>
    )
  }
}

export default Index

export const pageQuery = graphql`
  query PageQuery {
    allMongodbCloudDocuments {
      edges {
        node {
          id
          url
          name
        }
      }
    }
  }
`
