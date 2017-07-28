import React from "react"
import Helmet from "react-helmet"
import moment from "moment"

class HelmetBlock extends React.Component {
  render() {
    const frontmatter = this.props
    return (
      <div>
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
      </div>
    )
  }
}

export default HelmetBlock
