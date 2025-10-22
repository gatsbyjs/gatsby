import React from "react"
import { graphql } from "gatsby"
import StoryItem from "../components/story-item"
import Layout from "../layouts"

function Index({data}) {
  const { allMongodbCloudDocuments } = data

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
);
}

export default Index

export const pageQuery = graphql`
  query {
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
