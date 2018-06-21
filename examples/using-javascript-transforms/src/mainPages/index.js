import React from "react"
import { Link } from "gatsby"
import Helmet from "react-helmet"
import sortBy from "lodash/sortBy"
import moment from "moment"
import InsetPageLayout from "../components/Layouts/insetPage"

exports.frontmatter = {
  layoutType: `page`,
  path: `/`,
}

class SiteIndex extends React.Component {
  render() {
    const pageLinks = []
    let iteratorKey = 0
    let pageRaw = [
      ...this.props.data.allMarkdownRemark.edges,
      ...this.props.data.allJavascriptFrontmatter.edges,
    ]
    let pageArray = []
    pageRaw.forEach(page => {
      if (typeof page.node.frontmatter === `object`) {
        if (typeof page.node.frontmatter.written !== `undefined`) {
          pageArray.push(page.node.frontmatter)
        }
      }
    })

    const sortedPages = sortBy(
      pageArray,
      page => page.updated || page.written
    ).reverse()
    sortedPages.forEach(page => {
      let frontmatter = page

      if (frontmatter.layoutType === `post`) {
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
                    <h5 className="level-right">{frontmatter.category}</h5>
                  </div>
                  <h1 className="title is-marginless">
                    <Link to={frontmatter.path}>{frontmatter.title}</Link>
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

    return <InsetPageLayout {...this.props}>{pageLinks}</InsetPageLayout>
  }
}

export default SiteIndex

export const pageQuery = graphql`
  query allPosts {
    allJavascriptFrontmatter {
      edges {
        node {
          fileAbsolutePath
          frontmatter {
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
    site {
      ...site_sitemetadata
    }
  }
`
