/** @jsx jsx */
import { jsx } from "theme-ui"
import React from "react"
import { Link } from "gatsby"
import { mediaQueries } from "../../gatsby-plugin-theme-ui"
import FaExtLink from "react-icons/lib/fa/external-link"

const Details = ({
  allDeps,
  shownDeps,
  showAllDeps,
  showMore,
  startersYaml,
}) => (
  <div
    sx={{
      p: 6,
      [mediaQueries.lg]: {
        display: `grid`,
        gridRowGap: 5,
        gridTemplateColumns: `auto 1fr`,
        p: 8,
      },
    }}
  >
    <div sx={styles.headline}>Tags</div>
    <div>{startersYaml.tags.join(`, `)}</div>

    <div sx={styles.headline}>Description</div>
    <div>{startersYaml.description}</div>

    <div sx={styles.headline}>Features</div>
    <div>
      {startersYaml.features ? (
        <ul sx={{ mt: 0 }}>
          {startersYaml.features.map((f, i) => (
            <li key={i}>{f}</li>
          ))}
        </ul>
      ) : (
        `No features`
      )}
    </div>

    <div sx={styles.headline}>Dependencies</div>

    <div>
      <div
        sx={{
          display: `grid`,
          marginBottom: `7.5rem`,
          [mediaQueries.lg]: {
            gridTemplateColumns: `repeat(3, 1fr)`,
            gridGap: 5,
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
              <div key={dep}>
                <a href={`https://npm.im/${dep}`}>
                  {`${dep} `}
                  <FaExtLink />
                </a>
              </div>
            )
          )}
        {showMore && (
          <button sx={styles.showMoreButton} onClick={showAllDeps}>
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
    color: `text.secondary`,
    fontFamily: `header`,
    pr: 5,
  },
  showMoreButton: {
    backgroundColor: `gatsby`,
    border: 0,
    borderRadius: 1,
    cursor: `pointer`,
    fontFamily: `header`,
    fontWeight: `bold`,
    py: 1,
    px: 4,
    "&&": {
      borderBottom: `none`,
      color: `white`,
    },
  },
}
