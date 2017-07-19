import React from "react"

import StoryItem from "../components/story-item"

class Index extends React.Component {
  render() {
     console.log(this.props)
    const { allMongoDbDocField } = this.props.data
   
    return (
      <div className="itemlist" cellPadding={0} cellSpacing={0}>
        {allMongoDbDocField.edges.map(({ node }) => <StoryItem item={node} key={node.id} /> )}
      </div>
    )
  }
}

export default Index

export const pageQuery = graphql`
  query PageQuery {
    allMongoDbDocField {
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
