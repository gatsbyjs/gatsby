import React from "react"
import Link from "gatsby-link"
import Helmet from "react-helmet"
import sortBy from "lodash/sortBy"
import moment from "moment"
import SiteSidebar from "../components/SiteSidebar"
import siteMetadata from "../components/metadata.yaml"

class SiteIndex extends React.Component {
  render() {
    this.props.data.siteMetadata = { ...siteMetadata }

    const pageLinks = []
    let iteratorKey = 0
    let pageRaw = [
      ...this.props.data.allMarkdownRemark.edges,
      ...this.props.data.allJsFrontmatter.edges,
    ]
    let pageArray = []
    pageRaw.forEach(page => {
      if (typeof page.node.frontmatter === `object`) {
        if (typeof page.node.frontmatter.written != `undefined`) {
          pageArray.push(page.node.frontmatter)
        }
      } else if (typeof page.node.data === `object`) {
        if (
          typeof page.node.data.written != `undefined` &&
          page.node.data.written != ``
        ) {
          pageArray.push(page.node.data)
        }
      }
    })

    const sortedPages = sortBy(
      pageArray,
      page => page.updated || page.written
    ).reverse()
    sortedPages.forEach(page => {
      let frontmatter = page

      if (frontmatter.layoutType == `post`) {
        iteratorKey += 1
        pageLinks.push(
          <div className="box" key={iteratorKey}>
            <article className="media">
              <div className="media-content">
                <div className="heading">
                  <div className="level">
                    <h4 className="level-left">
                      <time
                        className="subtitle"
                        dateTime={moment(
                          frontmatter.updated || frontmatter.written
                        ).format(`MMMM D, YYYY`)}
                      >
                        {moment(
                          frontmatter.updated || frontmatter.written
                        ).format(`MMMM YYYY`)}
                      </time>
                    </h4>
                    <h5 className="level-right">
                      {frontmatter.category}
                    </h5>
                  </div>
                  <h1 className="title is-marginless">
                    <Link to={frontmatter.path}>
                      {frontmatter.title}
                    </Link>
                  </h1>
                </div>
                <div className="content">
                  <p
                    dangerouslySetInnerHTML={{
                      __html: frontmatter.description,
                    }}
                  />
                </div>
                <nav className="level">
                  <div className="level-left">
                    <span className="level-item">
                      <Link to={frontmatter.path}>Read</Link>
                    </span>
                  </div>
                </nav>
              </div>
            </article>
          </div>
        )
      }
    })

    return (
      <div>
        <div className="section">
          <div className="columns">
            <div className="column is-one-quarter">
              <SiteSidebar {...this.props} />
            </div>
            <div className="column">
              {pageLinks}
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default SiteIndex

export const pageQuery = graphql`
  query allPosts {
    allJsFrontmatter {
      edges {
        node {
          fileAbsolutePath
          data {
            path
            title
            written
            layoutType
            category
            description
            updated
          }
        }
      }
    }
    allMarkdownRemark {
      edges {
        node {
          id
          fields {
            slug
          }
          frontmatter {
            title
            path
            layoutType
            parent
            written
            updated
            category
            description
          }
          timeToRead
        }
      }
    }
  }
`
