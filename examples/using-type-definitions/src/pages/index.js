import React from 'react'
import { Link, graphql } from 'gatsby'
import Img from 'gatsby-image'

import Layout from '../components/layout'
import Image from '../components/image'
import SEO from '../components/seo'

const IndexPage = ({ data }) => (
  <Layout>
    <SEO title="Home" keywords={[`gatsby`, `application`, `react`]} />
    <h1>Hi people</h1>
    <p>Welcome to your new Gatsby site.</p>
    <p>Now go build something great.</p>
    <div style={{ maxWidth: `300px`, marginBottom: `1.45rem` }}>
      <Image />
    </div>
    {data.cms.blogPosts.map(({ title, post, titleImage }, i) => (
      <div key={i}>
        <h2>{title}</h2>
        <div dangerouslySetInnerHTML={{ __html: post }} />
        {titleImage && (
          <Img fixed={titleImage.imageFile.childImageSharp.fixed} />
        )}
      </div>
    ))}
    <Link to="/page-2/">Go to page 2</Link>
  </Layout>
)

export default IndexPage

export const query = graphql`
  {
    cms {
      blogPosts {
        title
        post
        titleImage {
          imageFile {
            childImageSharp {
              fixed {
                ...GatsbyImageSharpFixed
              }
            }
          }
        }
      }
    }
  }
`
