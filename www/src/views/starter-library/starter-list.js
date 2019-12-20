/** @jsx jsx */
import { jsx } from "theme-ui"
import { Link } from "gatsby"
import LaunchDemoIcon from "react-icons/lib/md/launch"
import GithubIcon from "react-icons/lib/go/mark-github"
import MdStar from "react-icons/lib/md/star"
import {
  showcaseList,
  showcaseItem,
  withTitleHover,
  shortcutIcon,
  meta,
} from "../shared/styles"
import ThumbnailLink from "../shared/thumbnail"
import EmptyGridItems from "../shared/empty-grid-items"
import V2Icon from "!raw-loader!../../assets/icons/v2icon.svg"
import { get } from "lodash-es"

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
          <small
            sx={{
              color: `textMuted`,
              display: `block`,
              fontWeight: `body`,
              mt: 2,
            }}
          >
            Why not write one and
            {` `}
            <Link to="/contributing/submit-to-starter-library/">submit it</Link>
            ? Or learn more
            {` `}
            <Link to="/docs/starters">about starters</Link>.
          </small>
        </h1>
      </div>
    )
  }
  if (count) {
    starters = starters.sort(sortingFunction()).slice(0, count)
    return (
      <div sx={showcaseList}>
        {starters.map(({ node: starter }) => {
          const {
            description,
            gatsbyMajorVersion,
            name,
            githubFullName,
            lastUpdated,
            owner,
            slug,
            stars,
          } = starter.fields.starterShowcase
          const { url: demoUrl } = starter

          return (
            starter.fields && ( // have to filter out null fields from bad data
              <div
                key={starter.id}
                sx={{
                  ...showcaseItem,
                  ...withTitleHover,
                }}
              >
                <ThumbnailLink
                  slug={`/starters${slug}`}
                  image={starter.childScreenshot}
                  title={`${owner}/${name}`}
                />
                <div sx={meta}>
                  <div
                    css={{ display: `flex`, justifyContent: `space-between` }}
                  >
                    <span
                      sx={{
                        color: `textMuted`,
                        fontSize: 0,
                        textTransform: `uppercase`,
                        letterSpacing: `tracked`,
                        fontFamily: `heading`,
                      }}
                    >
                      {owner} /
                    </span>
                    <span css={{ display: `flex` }}>
                      {gatsbyMajorVersion &&
                        gatsbyMajorVersion[0] &&
                        gatsbyMajorVersion[0][1] === `2` && (
                          <span
                            sx={{
                              alignItems: `center`,
                              bg: `muted`,
                              display: `flex`,
                              borderRadius: 5,
                              fontSize: 0,
                              lineHeight: `solid`,
                              px: `2px`,
                              pr: 2,
                              py: `2px`,
                              mr: 2,
                            }}
                          >
                            <span
                              dangerouslySetInnerHTML={{ __html: V2Icon }}
                              sx={{
                                color: `textMuted`,
                                mb: 0,
                                mr: 2,
                                "& svg": { height: 12, width: 12 },
                              }}
                            />
                            {` `}
                            v2
                          </span>
                        )}
                      <div
                        sx={{
                          alignItems: `center`,
                          display: `inline-flex`,
                          fontSize: 0,
                        }}
                      >
                        <MdStar /> {stars}
                      </div>
                    </span>
                  </div>
                  <div>
                    <Link to={`/starters${slug}`}>
                      <h5 sx={{ m: 0, fontSize: 2 }}>
                        <strong className="title">{name}</strong>
                      </h5>
                    </Link>
                  </div>
                  <div
                    sx={{
                      color: `text`,
                      textOverflow: `ellipsis`,
                      overflow: `hidden`,
                      whiteSpace: `nowrap`,
                      marginBottom: 4,
                    }}
                  >
                    {description || `No description`}
                  </div>
                  <div
                    css={{
                      display: `flex`,
                      justifyContent: `space-between`,
                    }}
                  >
                    <div sx={{ display: `inline-block`, fontSize: 0 }}>
                      Updated {new Date(lastUpdated).toLocaleDateString()}
                    </div>
                    <span>
                      <a
                        href={`https://github.com/${githubFullName}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{
                          ...shortcutIcon,
                          svg: { verticalAlign: `text-top !important` },
                        }}
                        aria-label={`Open source code for ${name}`}
                      >
                        <GithubIcon />
                      </a>
                      {` `}
                      <a
                        href={demoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{
                          ...shortcutIcon,
                          svg: { verticalAlign: `text-top !important` },
                        }}
                        aria-label={`Open demo for ${name}`}
                      >
                        <LaunchDemoIcon />
                      </a>
                    </span>
                  </div>
                </div>
              </div>
            )
          )
        })}
        {starters.length && <EmptyGridItems styles={showcaseItem} />}
      </div>
    )
  }
  return null
}

export default StartersList

function sortingFunction() {
  return function({ node: nodeA }, { node: nodeB }) {
    const metricA = get(nodeA, `fields.starterShowcase.stars`, 0)
    const metricB = get(nodeB, `fields.starterShowcase.stars`, 0)
    return metricB - metricA
  }
}
