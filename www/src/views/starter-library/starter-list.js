import React from "react"
import { Link } from "gatsby"
import LaunchDemoIcon from "react-icons/lib/md/launch"
import GithubIcon from "react-icons/lib/go/mark-github"
import CopyToClipboardIcon from "react-icons/lib/go/clippy"
import MdStar from "react-icons/lib/md/star"
import { options } from "../../utils/typography"
import { colors } from "../../utils/presets"
import copyToClipboard from "../../utils/copy-to-clipboard"
import styles from "../shared/styles"
import ThumbnailLink from "../shared/thumbnail"
import EmptyGridItems from "../shared/empty-grid-items"
import get from "lodash/get"

const StartersList = ({ urlState, starters, count, sortRecent }) => {
  if (!starters.length) {
    // empty state!
    const emptyStateReason =
      urlState.s !== ``
        ? urlState.s // if theres a search term
        : urlState.d && !Array.isArray(urlState.d)
          ? urlState.d // if theres a single dependency
          : `matching` // if no search term or single dependency
    return (
      <div
        css={{
          display: `grid`,
          height: `80%`,
          alignItems: `center`,
          justifyContent: `center`,
          textAlign: `center`,
        }}
      >
        <h1>
          No {`${emptyStateReason}`} starters found!
          <div css={{ color: colors.gatsby }}>
            <small>
              Maybe you should write one and
              {` `}
              <Link to="/docs/submit-to-starter-library/">submit it</Link>?
            </small>
          </div>
        </h1>
      </div>
    )
  }
  if (count) {
    starters = starters.sort(sortingFunction(sortRecent)).slice(0, count)
    return (
      <div
        css={{
          fontFamily: options.headerFontFamily.join(`,`),
          ...styles.showcaseList,
        }}
      >
        {starters.map(({ node: starter }) => {
          const {
            description,
            gatsbyMajorVersion,
            gatsbyDependencies,
            name,
            githubFullName,
            lastUpdated,
            owner,
            stars,
            stub,
          } = starter.fields.starterShowcase
          const { url: demoUrl } = starter

          return (
            starter.fields && ( // have to filter out null fields from bad data
              <div
                key={starter.id}
                css={{
                  ...styles.showcaseItem,
                }}
                {...styles.withTitleHover}
              >
                <ThumbnailLink
                  slug={`/starters/${stub}`}
                  image={starter.childScreenshot}
                  title={starter.name}
                />
                <div
                  css={{
                    ...styles.meta,
                  }}
                >
                  <div
                    css={{ display: `flex`, justifyContent: `space-between` }}
                  >
                    <span css={{ color: colors.gray.dark }}>{owner} /</span>
                    <span>
                      <a
                        href="#copy-to-clipboard"
                        onClick={() =>
                          copyToClipboard(
                            `https://github.com/${githubFullName}`
                          )
                        }
                        css={{ ...styles.shortcutIcon }}
                      >
                        <CopyToClipboardIcon />
                      </a>
                      {` `}
                      <a
                        href={demoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        css={{ ...styles.shortcutIcon }}
                      >
                        <LaunchDemoIcon />
                      </a>
                      {` `}
                      <a
                        href={`https://github.com/${githubFullName}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        css={{ ...styles.shortcutIcon }}
                      >
                        <GithubIcon />
                        {` `}
                      </a>
                    </span>
                  </div>
                  <div>
                    <span className="title">
                      <h5 css={{ margin: 0 }}>
                        <strong>{name}</strong>
                      </h5>
                    </span>
                    {/* {isGatsbyVersionWarning ?
                        <span css={{ fontStyle: `italic`, color: `red` }}>Outdated Version: {minorVersion}</span> :
                        <span css={{ fontStyle: `italic`, color: `green` }}>Gatsby Version: {minorVersion}</span>
                      } */}
                  </div>
                  <div
                    css={{
                      textOverflow: `ellipsis`,
                      overflow: `hidden`,
                      whiteSpace: `nowrap`,
                    }}
                  >
                    {description || `No description`}
                  </div>
                  <div
                    css={{ display: `flex`, justifyContent: `space-between` }}
                  >
                    <div css={{ display: `inline-block` }}>
                      <MdStar
                        style={{
                          color: colors.accent,
                          verticalAlign: `text-top`,
                        }}
                      />
                      {stars}
                    </div>
                    <div css={{ display: `inline-block` }}>
                      {`Gatsby v${gatsbyMajorVersion[0][1]}`}
                    </div>
                    <div css={{ display: `inline-block` }}>
                      Updated {new Date(lastUpdated).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            )
          )
        })}
        {starters.length && <EmptyGridItems styles={styles.showcaseItem} />}
      </div>
    )
  }
}

export default StartersList

function sortingFunction(sortRecent) {
  return function({ node: nodeA }, { node: nodeB }) {
    const metricA = get(nodeA, `fields.starterShowcase.stars`, 0)
    const metricB = get(nodeB, `fields.starterShowcase.stars`, 0)
    return metricB - metricA
  }
}
