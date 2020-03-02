/** @jsx jsx */
import { jsx } from "theme-ui"
import React, { Component } from "react"
import { Helmet } from "react-helmet"
import FooterLinks from "../../components/shared/footer-links"
import CreatorsHeader from "./creators-header"
import Badge from "./badge"
import GithubIcon from "react-icons/lib/go/mark-github"
import { navigate } from "gatsby"
import { mediaQueries } from "gatsby-design-tokens/dist/theme-gatsbyjs-org"
import qs from "qs"
import ThumbnailLink from "../shared/thumbnail"
import EmptyGridItems from "../shared/empty-grid-items"
import { meta, shortcutIcon } from "../shared/styles"

class CreatorsView extends Component {
  state = {
    creators: this.props.data.allCreatorsYaml.nodes,
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
          creators: this.props.data.allCreatorsYaml.nodes,
          [prevProps.location.state.filter]: false,
        })
      }
      if (filterStateChanged && isFiltered) {
        let items = this.state.creators.filter(
          item => item[this.props.location.state.filter] === true
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
        item => item[query.filter] === true
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
          creators: data.allCreatorsYaml.nodes,
          [filter]: false,
        })
        navigate(`${location.pathname}`, { state: { filter: `` } })
      } else {
        let items = creators.filter(item => item[filter] === true)
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
      <>
        <Helmet>
          <title>{title}</title>
          <meta
            name="description"
            content="Discover developers skilled in working on Gatsby applications available for hire"
          />
        </Helmet>
        <CreatorsHeader
          applyFilter={filter => applyFilter(filter)}
          forHire={this.state.for_hire}
          hiring={this.state.hiring}
          submissionText={submissionText}
        />
        <main
          id={`reach-skip-nav`}
          sx={{
            p: 6,
            paddingBottom: `10vh`,
            [mediaQueries.md]: {
              pb: 6,
            },
          }}
        >
          <div
            css={{
              display: `flex`,
              flexWrap: `wrap`,
              justifyContent: `center`,
              [mediaQueries.lg]: {
                justifyContent: `flex-start`,
              },
            }}
          >
            {creators.length < 1 ? (
              <p sx={{ color: `gatsby` }}>No results</p>
            ) : (
              creators.map(node => (
                <div key={node.name} sx={styles.creatorCard}>
                  <ThumbnailLink
                    slug={node.fields.slug}
                    image={node.image}
                    title={node.name}
                  >
                    <strong className="title">{node.name}</strong>
                  </ThumbnailLink>
                  <div sx={{ display: `flex`, ...meta }}>
                    <div
                      sx={{
                        mb: 1,
                        color: `textMuted`,
                      }}
                    >
                      {node.location}
                    </div>
                    {node.github && (
                      <a
                        sx={{
                          ...shortcutIcon,
                          ml: `auto`,
                        }}
                        href={node.github}
                      >
                        <GithubIcon style={{ verticalAlign: `text-top` }} />
                      </a>
                    )}
                  </div>
                  {node.for_hire || node.hiring ? (
                    <div
                      sx={{
                        alignSelf: `flex-start`,
                        fontSize: 0,
                      }}
                    >
                      <Badge forHire={node.for_hire}>
                        {node.for_hire ? `For Hire` : `Hiring`}
                      </Badge>
                    </div>
                  ) : null}
                </div>
              ))
            )}
            {creators.length && <EmptyGridItems styles={styles.creatorCard} />}
          </div>
        </main>
        <FooterLinks />
      </>
    )
  }
}

export default CreatorsView

const styles = {
  creatorCard: {
    display: `flex`,
    flexDirection: `column`,
    m: 6,
    minWidth: 200,
    maxWidth: 240,
    flex: `1 0 0`,
    position: `relative`,
  },
}
