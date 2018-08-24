import React, { Component } from "react"
import Helmet from "react-helmet"
import { rhythm } from "../../utils/typography"
import Layout from "../../components/layout"
import CommunityHeader from "./community-header"
import Img from "gatsby-image"

class CommunityView extends Component {
  render() {
    const { location, title, data } = this.props
    let items = data.allCreatorsYaml.edges
    console.log(items)
    return (
      <Layout location={location}>
        <Helmet>
          <title>{title}</title>
        </Helmet>
        <CommunityHeader />
        <main
          role="main"
          css={{
            paddingLeft: rhythm(3 / 4),
            paddingRight: rhythm(3 / 4),
          }}
        >
          <h1>{title}</h1>

          <div
            css={{
              display: `flex`,
            }}
          >
            {items.map(item => (
              <Img
                key={item.node.id}
                alt={`${item.node.name}`}
                fixed={item.node.image.childImageSharp.fixed}
                css={{
                  marginRight: `1rem`,
                }}
              />
            ))}
          </div>
        </main>
      </Layout>
    )
  }
}

export default CommunityView

// pass the data here
// map through items and render gatsby images

// make this a template
// pass the type from Page
// query based on that
