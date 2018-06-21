import React from "react"
import StoryItem from "../components/story-item"
import Layout from "../layouts"

class Index extends React.Component {
  render() {
    const { allMongodbCloudDocuments } = this.props.data

    return (
      <Layout>
        <div>
          <h1>Website information stored in MongoDB</h1>
          <ul>
            {allMongodbCloudDocuments.edges.map(({ node }) => (
              <StoryItem item={node} key={node.id} />
            ))}
          </ul>
        </div>
      </Layout>
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
