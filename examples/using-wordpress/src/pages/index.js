import React, { Component } from "react"
import { Link } from "gatsby"
import ClockIcon from "react-icons/lib/fa/clock-o"

import Layout from "../layouts"
import PostIcons from "../components/PostIcons"

import { rhythm } from "../utils/typography"

class Home extends Component {
  render() {
    const data = this.props.data

    return (
      <Layout>
        <div css={{ marginBottom: rhythm(1) }}>
          <h1>Pages</h1>
          {data.allWordpressPage.edges.map(({ node }) => (
            <div key={node.slug}>
              <Link to={node.slug} css={{ textDecoration: `none` }}>
                <h3>{node.title}</h3>
              </Link>
              <div dangerouslySetInnerHTML={{ __html: node.excerpt }} />
              <span>
                <ClockIcon
                  size={14}
                  css={{ position: `relative`, bottom: 1 }}
                />
                {` `}
                {node.date}
              </span>
            </div>
          ))}
        </div>
        <hr />
        <h1>Posts</h1>
        {data.allWordpressPost.edges.map(({ node }) => (
          <div css={{ marginBottom: rhythm(2) }} key={node.slug}>
            <Link to={node.slug} css={{ textDecoration: `none` }}>
              <h3>{node.title}</h3>
            </Link>
            <div dangerouslySetInnerHTML={{ __html: node.excerpt }} />
            <PostIcons node={node} />
          </div>
        ))}
      </Layout>
    )
  }
}

export default Home

// Set here the ID of the home page.
export const pageQuery = graphql`
  query homePageQuery {
    allWordpressPage {
      edges {
        node {
          id
          title
          excerpt
          slug
          date(formatString: "MMMM DD, YYYY")
        }
      }
    }
    allWordpressPost(sort: { fields: [date] }) {
      edges {
        node {
          title
          excerpt
          slug
          ...PostIcons
        }
      }
    }
  }
`
