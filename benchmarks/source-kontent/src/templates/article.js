import React from "react"
import { graphql, Link } from "gatsby"
import Img from "gatsby-image"
import Layout from "../components/layout_1"

const Article = ({ data }) => {
  return (
    <Layout>
      <Link to="/">Go back to index page</Link>
      <div>
        <h2>{data.article.elements.title.value}</h2>
        {data.article.elements.image.value.length > 0 ? (
          <Img fluid={data.article.elements.image.value[0].fluid} />
        ) : (
          <div>Image can't be displayed</div>
        )}
        <div dangerouslySetInnerHTML={{ __html: data.article.elements.content.value }} />
      </div>
    </Layout>
  )
}

export default Article

export const query = graphql`
  query($slug: String!){
    article: kontentItemArticle(elements: {slug: {value: {eq: $slug }}}) {
      elements {
        title{
          value
        }
        content {
          value
        }
        image{
          value {
            fluid(maxWidth: 960) {
              ...KontentAssetFluid
            }
          }
        }
      }
    }
  }
`