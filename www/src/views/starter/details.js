import { Link } from "gatsby"
import presets, { colors } from "../../utils/presets"
import { options, rhythm } from "../../utils/typography"
import sharedStyles from "../shared/styles"
import FaExtLink from "react-icons/lib/fa/external-link"

const Details = ({
  allDeps,
  shownDeps,
  showAllDeps,
  showMore,
  frontmatter,
}) => {
  return (
    <div
      css={{
        padding: sharedStyles.gutter,
        [presets.Desktop]: {
          padding: sharedStyles.gutterDesktop,
          display: `grid`,
          gridTemplateColumns: `auto 1fr`,
          gridRowGap: `20px`,
        },
      }}
    >
      <div
        css={{
          color: colors.gray.calm,
          fontFamily: options.headerFontFamily.join(`,`),
          paddingRight: 20,
        }}
      >
        Tags
      </div>
      <div>{frontmatter.tags.join(`, `)}</div>

      <div
        css={{
          color: colors.gray.calm,
          fontFamily: options.headerFontFamily.join(`,`),
          paddingRight: 20,
        }}
      >
        Description
      </div>
      <div>{frontmatter.description}</div>

      <div
        css={{
          color: colors.gray.calm,
          fontFamily: options.headerFontFamily.join(`,`),
          paddingRight: 20,
        }}
      >
        Features
      </div>
      <div>
        {frontmatter.features ? (
          <ul css={{ marginTop: 0 }}>
            {frontmatter.features.map((f, i) => (
              <li key={i}>{f}</li>
            ))}
          </ul>
        ) : (
          `No features`
        )}
      </div>

      <div
        css={{
          color: colors.gray.calm,
          fontFamily: options.headerFontFamily.join(`,`),
          paddingRight: 20,
        }}
      >
        Dependencies
      </div>

      <div>
        <div
          css={{
            display: `grid`,
            gridAutoRows: `50px`,
            marginBottom: rhythm(options.blockMarginBottom * 5),
            [presets.Desktop]: {
              gridTemplateColumns: `repeat(3, 1fr)`,
              gridColumnGap: 20,
            },
          }}
        >
          {shownDeps &&
            shownDeps.map(
              dep =>
                /^gatsby-/.test(dep) ? (
                  <div key={dep}>
                    <Link to={`/packages/${dep}`}>{dep}</Link>
                  </div>
                ) : (
                  <div
                    key={dep}
                    css={{
                      ...sharedStyles.truncate,
                      marginBottom: `1rem`,
                    }}
                  >
                    <a href={`https://npm.im/${dep}`}>
                      {`${dep} `}
                      <FaExtLink />
                    </a>
                  </div>
                )
            )}
          {showMore && (
            <button css={{ ...sharedStyles.button }} onClick={showAllDeps}>
              {`Show ${allDeps.length - shownDeps.length} more`}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default Details
