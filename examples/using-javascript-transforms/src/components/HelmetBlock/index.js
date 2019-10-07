import React from "react"
import { Helmet } from "react-helmet"
import moment from "moment"

class HelmetBlock extends React.Component {
  render() {
    const frontmatter = this.props
    return (
      <div>
        <Helmet>
          <title>{frontmatter.title}</title>
          <meta name="description" content={frontmatter.description} />
          <meta
            property="og:url"
            content={`https://www.jacobbolda.com/${frontmatter.path}`}
          />
          <meta property="og:description" content={frontmatter.description} />
          <meta property="og:type" content="article" />
          <meta property="og:article:author" content="Jacob Bolda" />
          <meta
            property="og:article:published_time"
            content={moment(frontmatter.written, `YYYY-MM-DD`)}
          />
          <meta
            property="og:article:modified_time"
            content={moment(frontmatter.updated, `YYYY-MM-DD`)}
          />
          <meta property="og:article:tag" content={frontmatter.category} />
          <meta name="twitter:label1" content="Category" />
          <meta name="twitter:data1" content={frontmatter.category} />
          <meta name="twitter:label2" content="Written" />
          <meta name="twitter:data2" content={frontmatter.written} />
        </Helmet>
      </div>
    )
  }
}

export default HelmetBlock
