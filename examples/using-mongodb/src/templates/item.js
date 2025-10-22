import React from "react"
import { graphql } from "gatsby"
import Layout from "../layouts"

function Item({data}) {
  const story = data.mongodbCloudDocuments

return (
<Layout>
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
</Layout>
);
}

export default Item

export const pageQuery = graphql`
  query($id: String!) {
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
