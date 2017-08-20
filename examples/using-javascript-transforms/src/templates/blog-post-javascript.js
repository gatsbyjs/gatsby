import React from "react"
import Link from "gatsby-link"
import Helmet from "react-helmet"
import moment from "moment"

class jsBlogPostTemplate extends React.Component {
  render() {
    console.log(this)

    return (
      <div className='test'>

      </div>
    )
/*
    let frontmatter = this.props.frontmatter
    let siteMetadata = this.props.siteMetadata

    const home = (
      <div className="nav">
        <div className="container">
          <div className="nav-left">
            <Link className="nav-item is-tab is-active" to={`/`}>
              Home
            </Link>
          </div>
        </div>
      </div>
    )

    if (frontmatter.updated === null) {
      var published = (
        <div className="date-published">
          <p>
            <em>
              published {moment(frontmatter.written).format(`D MMM YYYY`)}
            </em>
          </p>
        </div>
      )
    } else {
      var published = (
        <div className="date-published">
          <p>
            <em>
              originally published{` `}
              {moment(frontmatter.written).format(`D MMM YYYY`)} and updated{` `}
              {moment(frontmatter.updated).format(`D MMM YYYY`)}
            </em>
          </p>
        </div>
      )
    }


    return (
      <div className="ArticleTemplate">
        <Helmet
          title={frontmatter.title}
          meta={[
            { name: `description`, content: frontmatter.description },
            {
              property: `og:url`,
              content: `https://www.jacobbolda.com/` + frontmatter.path,
            },
            { property: `og:description`, content: frontmatter.description },
            { property: `og:type`, content: `article` },
            { property: `og:article:author`, content: `Jacob Bolda` },
            {
              property: `og:article:published_time`,
              content: moment(frontmatter.written, `YYYY-MM-DD`),
            },
            {
              property: `og:article:modified_time`,
              content: moment(frontmatter.updated, `YYYY-MM-DD`),
            },
            { property: `og:article:tag`, content: frontmatter.category },
            { name: `twitter:label1`, content: `Category` },
            { name: `twitter:data1`, content: frontmatter.category },
            { name: `twitter:label2`, content: `Written` },
            { name: `twitter:data2`, content: frontmatter.written },
          ]}
        />
        {home}
        <div className="container">
          {this.props.children()}
        </div>
        <div className="footer container">
          {published}
          <hr />
          <p>
            {siteMetadata.siteDescr}
            <a href={siteMetadata.siteTwitterUrl}>
              <br /> <strong>{siteMetadata.siteAuthor}</strong> on Twitter
            </a>
          </p>
        </div>
      </div>
    )
    */
  }
}

export default jsBlogPostTemplate
export default jsBlogPostTemplate

export const pageQuery = graphql`
query javascriptTemplateBySlug($slug: String!) {
  jsFrontmatter(fields: { slug: { eq: $slug } }) {
    fileAbsolutePath
    data {
      error
      layoutType
      path
      title
      written
      updated
      category
      description
    }
  }
}
`
