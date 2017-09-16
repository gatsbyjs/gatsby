import React, { Component } from "react"
import PropTypes from "prop-types"
import Link from "gatsby-link"

class Home extends Component {
  render() {
    // this.props is where all the data of my site lives: { data, history, location. match... }
    // much of this if from the router, but data object is where all my api data lives

    console.log(this.props.data)
    const data = this.props.data

    return (
      <div>
        <h1>Pages</h1>
        {data.allWordpressPage.edges.map(({ node }) => {
          return (
            <div>
              <Link to={node.slug} style={{ textDecoration: `none` }}>
                <h3>{node.title}</h3>
                <div dangerouslySetInnerHTML={{ __html: node.excerpt }} />
              </Link>
            </div>
          )
        })}
        <h1>Posts</h1>
        {data.allWordpressPost.edges.map(({ node }) => {
          return (
            <div>
              <Link to={node.slug} style={{ textDecoration: `none` }}>
                <h3>{node.title}</h3>
                <div dangerouslySetInnerHTML={{ __html: node.excerpt }} />
              </Link>
            </div>
          )
        })}
      </div>
    )
  }
}

export default Home

Home.propTypes = {
  data: PropTypes.object.isRequired,
  allWordpressPage: PropTypes.object,
  edges: PropTypes.array,
}

// Set here the ID of the home page.
export const pageQuery = graphql`
  query homePageQuery {
    allWordpressPage {
      edges {
        node {
          title
          excerpt
          slug
        }
      }
    }
    allWordpressPost {
      edges {
        node {
          title
          excerpt
          slug
        }
      }
    }
  }
`
