import React from "react"
import { Link } from "gatsby"
import { colors, space, radii, breakpoints, fonts } from "../../utils/presets"
import { options, rhythm } from "../../utils/typography"
import sharedStyles from "../shared/styles"
import FaExtLink from "react-icons/lib/fa/external-link"

const Details = ({
  allDeps,
  shownDeps,
  showAllDeps,
  showMore,
  startersYaml,
}) => (
  <div
    css={{
      padding: space[6],
      [breakpoints.lg]: {
        padding: space[8],
        display: `grid`,
        gridTemplateColumns: `auto 1fr`,
        gridRowGap: space[5],
      },
    }}
  >
    <div css={styles.headline}>Tags</div>
    <div>{startersYaml.tags.join(`, `)}</div>

    <div css={styles.headline}>Description</div>
    <div>{startersYaml.description}</div>

    <div css={styles.headline}>Features</div>
    <div>
      {startersYaml.features ? (
        <ul css={{ marginTop: 0 }}>
          {startersYaml.features.map((f, i) => (
            <li key={i}>{f}</li>
          ))}
        </ul>
      ) : (
        `No features`
      )}
    </div>

    <div css={styles.headline}>Dependencies</div>

    <div>
      <div
        css={{
          display: `grid`,
          marginBottom: rhythm(options.blockMarginBottom * 5),
          [breakpoints.lg]: {
            gridTemplateColumns: `repeat(3, 1fr)`,
            gridGap: space[5],
          },
        }}
      >
        {shownDeps &&
          shownDeps.map(dep =>
            /^gatsby-/.test(dep) ? (
              <div key={dep}>
                <Link to={`/packages/${dep}`}>{dep}</Link>
              </div>
            ) : (
              <div key={dep} css={{ ...sharedStyles.truncate }}>
                <a href={`https://npm.im/${dep}`}>
                  {`${dep} `}
                  <FaExtLink />
                </a>
              </div>
            )
          )}
        {showMore && (
          <button css={{ ...styles.showMoreButton }} onClick={showAllDeps}>
            {`Show ${allDeps.length - shownDeps.length} more`}
          </button>
        )}
      </div>
    </div>
  </div>
)

export default Details

const styles = {
  headline: {
    color: colors.gray.calm,
    fontFamily: fonts.header,
    paddingRight: space[5],
  },
  showMoreButton: {
    backgroundColor: colors.gatsby,
    border: 0,
    borderRadius: radii[1],
    cursor: `pointer`,
    fontFamily: fonts.header,
    fontWeight: `bold`,
    padding: `${space[1]} ${space[4]}`,
    WebkitFontSmoothing: `antialiased`,
    "&&": {
      borderBottom: `none`,
      color: colors.white,
    },
  },
}
