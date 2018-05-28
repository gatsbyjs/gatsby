import React from "react"

export const RemarkImages = ({ data })  => {
 const content = data.allContentfulRemarkTest.edges[0].node.content.childMarkdownRemark.html
 return (
   <div dangerouslySetInnerHTML={{ __html: content  }} />
 )
}

export default RemarkImages

export const pageQuery = graphql`
query remarkQuery {
  allContentfulRemarkTest {
    edges {
      node {
        title
        content {
          childMarkdownRemark {
            html

        }
      }
    }
  }
}
}
`
