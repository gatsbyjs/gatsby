import React, { Component } from "react"
import { Helmet } from "react-helmet"
import typography, { rhythm, scale } from "../../utils/typography"
import Layout from "../../components/layout"
import CreatorsHeader from "./creators-header"
import Badge from "./badge"
import GithubIcon from "react-icons/lib/go/mark-github"
import { navigate } from "gatsby"
import presets, { colors } from "../../utils/presets"
import qs from "qs"
import ThumbnailLink from "../shared/thumbnail"
import EmptyGridItems from "../shared/empty-grid-items"
import sharedStyles from "../shared/styles"

class CreatorsView extends Component {
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
    let submissionText
    if (title === `All`) {
      submissionText = `Add Yourself`
    } else if (title === `People`) {
      submissionText = `Add Yourself`
    } else if (title === `Agencies`) {
      submissionText = `Add Your Agency`
    } else if (title === `Companies`) {
      submissionText = `Add Your Company`
    }

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
        <CreatorsHeader
          applyFilter={filter => applyFilter(filter)}
          forHire={this.state.for_hire}
          hiring={this.state.hiring}
          submissionText={submissionText}
        />
        <main
          id={`reach-skip-nav`}
          css={{
            padding: rhythm(3 / 4),
            paddingBottom: `10vh`,
            fontFamily: typography.options.headerFontFamily.join(`,`),
            [presets.Tablet]: {
              paddingBottom: rhythm(3 / 4),
            },
          }}
        >
          <div
            css={{
              display: `flex`,
              flexWrap: `wrap`,
              justifyContent: `center`,
              [presets.Desktop]: {
                justifyContent: `flex-start`,
              },
            }}
          >
            {creators.length < 1 ? (
              <p css={{ color: colors.gatsby }}>No results</p>
            ) : (
              creators.map(item => (
                <div key={item.node.name} css={styles.creatorCard}>
                  <ThumbnailLink
                    slug={item.node.fields.slug}
                    image={item.node.image}
                    title={item.node.name}
                  >
                    <strong className="title">{item.node.name}</strong>
                  </ThumbnailLink>
                  <div css={{ display: `flex`, ...sharedStyles.meta }}>
                    <div
                      css={{
                        margin: `0 0 ${rhythm(1 / 8)}`,
                        color: colors.gray.calm,
                        ...scale(-1 / 3),
                      }}
                    >
                      {item.node.location}
                    </div>
                    {item.node.github && (
                      <a
                        css={{
                          ...sharedStyles.shortcutIcon,
                          marginLeft: `auto`,
                        }}
                        href={item.node.github}
                      >
                        <GithubIcon style={{ verticalAlign: `text-top` }} />
                      </a>
                    )}
                  </div>
                  {item.node.for_hire || item.node.hiring ? (
                    <div
                      css={{
                        alignSelf: `flex-start`,
                        ...scale(-1 / 3),
                      }}
                    >
                      <Badge forHire={item.node.for_hire}>
                        {item.node.for_hire ? `For Hire` : `Hiring`}
                      </Badge>
                    </div>
                  ) : null}
                </div>
              ))
            )}
            {creators.length && <EmptyGridItems styles={styles.creatorCard} />}
          </div>
        </main>
      </Layout>
    )
  }
}

export default CreatorsView

const styles = {
  creatorCard: {
    display: `flex`,
    flexDirection: `column`,
    margin: rhythm(3 / 4),
    minWidth: 200,
    maxWidth: 240,
    flex: `1 0 0`,
    position: `relative`,
  },
}
