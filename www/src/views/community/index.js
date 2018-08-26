import React, { Component } from "react"
import Helmet from "react-helmet"
import { rhythm } from "../../utils/typography"
import Layout from "../../components/layout"
import CommunityHeader from "./community-header"
import Img from "gatsby-image"
import GithubIcon from "react-icons/lib/go/mark-github"

class CommunityView extends Component {
  render() {
    const { location, title, data } = this.props
    let items = data.allCreatorsYaml.edges
    // console.log(items)
    return (
      <Layout location={location}>
        <Helmet>
          <title>{title}</title>
        </Helmet>
        <CommunityHeader />
        <main
          role="main"
          css={{
            padding: rhythm(3 / 4),
          }}
        >
          <div
            css={{
              display: `flex`,
            }}
          >
            {items.map(item => (
              // this gonna be a link rendering a template
              // config on gatsby-node.js
              <div
                key={item.node.name}
                css={{
                  display: `flex`,
                  flexDirection: `column`,
                  marginRight: `1rem`,
                }}
              >
                <Img
                  alt={`${item.node.name}`}
                  fixed={item.node.image.childImageSharp.fixed}
                />
                <span
                  css={{
                    display: `flex`,
                  }}
                >
                  <h5
                    css={{
                      margin: `0`,
                    }}
                  >{`${item.node.name}`}</h5>
                  {item.node.github && (
                    <GithubIcon
                      style={{
                        marginLeft: `auto`,
                      }}
                    />
                  )}
                </span>
                <span>{`${item.node.location}`}</span>
                {item.node.for_hire || item.node.hiring ? (
                  <span>{item.node.for_hire ? `For Hire` : `Hiring`}</span>
                ) : null}
              </div>
            ))}
          </div>
        </main>
      </Layout>
    )
  }
}

export default CommunityView

// make this a template
// pass the type from Page
// query based on that
