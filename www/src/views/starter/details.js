/** @jsx jsx */
import { jsx } from "theme-ui"
import { Link } from "gatsby"
import { MdLaunch } from "react-icons/md"

import { mediaQueries } from "gatsby-design-tokens/dist/theme-gatsbyjs-org"

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
      [mediaQueries.md]: {
        display: `grid`,
        gridRowGap: 6,
        gridColumnGap: 6,
        gridTemplateColumns: `auto 1fr`,
        p: 8,
      },
    }}
  >
    <h2 sx={styles.headline}>Tags</h2>
    <div sx={styles.content}>{startersYaml.tags.join(`, `)}</div>

    <h2 sx={styles.headline}>Description</h2>
    <div sx={styles.content}>{startersYaml.description}</div>

    <h2 sx={styles.headline}>Features</h2>
    <div sx={styles.content}>
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

    <h2 sx={styles.headline}>Dependencies</h2>

    <div>
      <div
        sx={{
          display: `grid`,
          [mediaQueries.lg]: {
            gridTemplateColumns: `repeat(3, 1fr)`,
            gridGap: 5,
          },
        }}
      >
        {shownDeps &&
          shownDeps.map(dep =>
            // gatsby-cypress is a helper plugin and not shown inside our plugins section
            // for that reason we are excluding it from our list of plugins
            /^gatsby-/.test(dep) && dep !== `gatsby-cypress` ? (
              <div key={dep}>
                <Link to={`/packages/${dep}`}>{dep}</Link>
              </div>
            ) : (
              <div key={dep}>
                <a href={`https://npm.im/${dep}`}>
                  {`${dep} `}
                  <MdLaunch />
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
    color: `textMuted`,
    fontWeight: `normal`,
    fontSize: 3,
    mt: 0,
    mb: 2,
    [mediaQueries.md]: {
      mb: 0,
    },
  },
  content: {
    pb: 8,
    [mediaQueries.md]: { pb: 0 },
  },
  showMoreButton: {
    backgroundColor: `gatsby`,
    border: 0,
    borderRadius: 1,
    cursor: `pointer`,
    fontFamily: `heading`,
    fontWeight: `bold`,
    py: 1,
    px: 4,
    "&&": {
      borderBottom: `none`,
      color: `white`,
    },
  },
}
