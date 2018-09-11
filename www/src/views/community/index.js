import React, { Component } from "react"
import { Link } from "gatsby"
import Helmet from "react-helmet"
import typography, { rhythm, scale } from "../../utils/typography"
import Layout from "../../components/layout"
import CommunityHeader from "./community-header"
import Img from "gatsby-image"
import GithubIcon from "react-icons/lib/go/mark-github"
import { navigate } from "gatsby"
import { colors } from "../../utils/presets"
import qs from "qs"

class CommunityView extends Component {
  state = {
    creators: this.props.data.allCreatorsYaml.edges,
    for_hire: false,
    hiring: false,
  }

  componentDidUpdate(prevProps) {
    if (prevProps.location.state !== null) {
      const filterStateChanged =
        this.props.location.state.filter !== prevProps.location.state.filter
      const isNotFiltered = this.props.location.state.filter === ``
      const isFiltered = this.props.location.state.filter !== ``
      if (filterStateChanged && isNotFiltered) {
        this.setState({
          creators: this.props.data.allCreatorsYaml.edges,
          [prevProps.location.state.filter]: false,
        })
      }
      if (filterStateChanged && isFiltered) {
        let items = this.state.creators.filter(
          item => item.node[this.props.location.state.filter] === true
        )
        this.setState({
          creators: items,
          [this.props.location.state.filter]: true,
          [prevProps.location.state.filter]: false,
        })
      }
    }
  }

  componentDidMount() {
    const query = qs.parse(this.props.location.search.slice(1))
    if (query.filter) {
      let items = this.state.creators.filter(
        item => item.node[query.filter] === true
      )
      this.setState({
        creators: items,
        [query.filter]: true,
      })
      navigate(`${location.pathname}?filter=${query.filter}`, {
        state: { filter: query.filter },
      })
    } else {
      navigate(`${location.pathname}`, { state: { filter: `` } })
    }
  }

  render() {
    const { location, title, data } = this.props
    const { creators } = this.state

    const applyFilter = filter => {
      if (this.state[filter] === true) {
        this.setState({
          creators: data.allCreatorsYaml.edges,
          [filter]: false,
        })
        navigate(`${location.pathname}`, { state: { filter: `` } })
      } else {
        let items = creators.filter(item => item.node[filter] === true)
        this.setState({
          creators: items,
          [filter]: true,
        })
        navigate(`${location.pathname}?filter=${filter}`, {
          state: { filter: filter },
        })
      }
    }

    return (
      <Layout location={location}>
        <Helmet>
          <title>{title}</title>
        </Helmet>
        <CommunityHeader
          applyFilter={filter => applyFilter(filter)}
          forHire={this.state.for_hire}
          hiring={this.state.hiring}
        />
        <main
          role="main"
          css={{
            padding: rhythm(3 / 4),
            fontFamily: typography.options.headerFontFamily.join(`,`),
          }}
        >
          <div
            css={{
              display: `flex`,
            }}
          >
            {creators.length < 1 ? (
              <p css={{ color: colors.gatsby }}>No results</p>
            ) : (
              creators.map(item => (
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
                  <div
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
                  </div>
                  <div
                    css={{
                      margin: `${rhythm(1 / 6)} 0`,
                      color: colors.gray.bright,
                      ...scale(-1 / 3),
                    }}
                  >{`${item.node.location}`}</div>
                  {item.node.for_hire || item.node.hiring ? (
                    <div
                      css={[
                        styles.badge,
                        item.node.for_hire ? styles.forHire : styles.hiring,
                      ]}
                    >
                      {item.node.for_hire ? `For Hire` : `Hiring`}
                    </div>
                  ) : null}
                </Link>
              ))
            )}
          </div>
        </main>
      </Layout>
    )
  }
}

export default CommunityView

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
