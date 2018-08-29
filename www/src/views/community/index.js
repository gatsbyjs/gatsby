import React, { Component } from "react"
import { Link } from "gatsby"
import Helmet from "react-helmet"
import typography, { rhythm, scale } from "../../utils/typography"
import Layout from "../../components/layout"
import CommunityHeader from "./community-header"
import Img from "gatsby-image"
import GithubIcon from "react-icons/lib/go/mark-github"

import presets, { colors } from "../../utils/presets"

class CommunityView extends Component {
  state = {
    creators: this.props.data.allCreatorsYaml.edges,
    for_hire: false,
    hiring: false,
  }
  render() {
    const { location, title, data } = this.props
    const { creators } = this.state
    // let items = this.props.data.allCreatorsYaml.edges

    const applyFilter = filter => {
      if (this.state[filter] === true) {
        this.setState({
          creators: this.props.data.allCreatorsYaml.edges,
          [filter]: false,
        })
      }

      //   this.setState(prevState => { filters[filter]: !prevState.filters[filter]}
      //  );
      // }
      else {
        let items = creators.filter(item => item.node[filter] === true)
        this.setState({ creators: items, [filter]: true })
      }
    }

    // calculate the forhire and hiring here and render accordingly, trigger that function from the header

    // change URL from the header via URLQuery as well
    return (
      <Layout location={location}>
        <Helmet>
          <title>{title}</title>
        </Helmet>
        <CommunityHeader applyFilter={filter => applyFilter(filter)} />
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
            {creators.map(item => (
              // this is probably going to be a link rendering a template
              // config on gatsby-node.js
              <Link
                key={item.node.name}
                css={{
                  "&&": {
                    borderBottom: `none`,
                    boxShadow: `none`,
                    transition: `box-shadow .3s cubic-bezier(.4,0,.2,1), transform .3s cubic-bezier(.4,0,.2,1)`,
                    display: `flex`,
                    flexDirection: `column`,
                    marginRight: `1rem`,
                    fontFamily: typography.options.headerFontFamily.join(`,`),
                    "&:hover": {
                      background: `transparent`,
                    },
                  },
                }}
                to={item.node.fields.slug}
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
                  <p
                    css={{
                      margin: `0`,
                    }}
                  >{`${item.node.name}`}</p>
                  {item.node.github && (
                    <GithubIcon
                      css={{
                        marginLeft: `auto`,
                        color: colors.gray.bright,
                      }}
                    />
                  )}
                </span>
                <span
                  css={{
                    margin: `${rhythm(1 / 6)} 0`,
                    color: colors.gray.bright,
                    ...scale(-1 / 3),
                  }}
                >{`${item.node.location}`}</span>
                {item.node.for_hire || item.node.hiring ? (
                  <span
                    css={[
                      styles.badge,
                      item.node.for_hire ? styles.forHire : styles.hiring,
                    ]}
                  >
                    {item.node.for_hire ? `For Hire` : `Hiring`}
                  </span>
                ) : null}
              </Link>
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

const styles = {
  badge: {
    ...scale(-1 / 3),
    padding: `0 ${rhythm(1 / 3)}`,
    borderRadius: `20px`,
    alignSelf: `flex-start`,
  },
  hiring: {
    background: colors.ui.light,
    color: colors.gatsby,
  },
  forHire: {
    background: colors.success,
    color: `white`,
  },
}
