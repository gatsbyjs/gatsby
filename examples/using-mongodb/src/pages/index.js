import React from "react"

import StoryItem from "../components/story-item"

class Index extends React.Component {
  render() {
    console.log(this.props)
    const { allMongodbCloudDocuments } = this.props.data

    return (
      <div className="itemlist" cellPadding={0} cellSpacing={0}>
        {allMongodbCloudDocuments.edges.map(({ node }) =>
          <StoryItem item={node} key={node.id} />
        )}
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
