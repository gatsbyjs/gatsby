import React from "react"
import { graphql } from "gatsby"
import Img from "gatsby-image"

export default ({ data }) => (
  <div
    style={{
      padding: 32,
    }}
  >
    <h1>Posts</h1>
    <section
      style={{
        display: `grid`,
        gridTemplateColumns: `repeat( auto-fit, minmax(250px, 1fr) )`,
        gridGap: 16,
        justifyContent: "space-between",
      }}
    >
      {data.allPost.nodes.map(post => (
        <div
          style={{
            display: `flex`,
            flexDirection: `column`,
            justifyContent: `space-between`,
            padding: 16,
            border: `1px solid #ccc`,
            borderRadius: 8,
          }}
        >
          <h2>{post.slug}</h2>
          <span>By: {post.author.name}</span>
          <p>{post.description}</p>
          <Img
            fluid={post.remoteImage.childImageSharp.fluid}
            alt={post.imgAlt}
            style={{
              maxHeight: 300,
            }}
          />
        </div>
      ))}
    </section>
  </div>
)

export const query = graphql`
  {
    allPost {
      nodes {
        id
        slug
        description
        imgAlt
        author {
          id
          name
        }
        slug
        remoteImage {
          id
          childImageSharp {
            id
            fluid {
              ...GatsbyImageSharpFluid
            }
          }
        }
      }
    }
  }
`
