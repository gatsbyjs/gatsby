import React from "react"
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
  startersYaml,
}) => (
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
    <div>{startersYaml.tags.join(`, `)}</div>

    <div
      css={{
        color: colors.gray.calm,
        fontFamily: options.headerFontFamily.join(`,`),
        paddingRight: 20,
      }}
    >
      Description
    </div>
    <div>{startersYaml.description}</div>

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
          marginBottom: rhythm(options.blockMarginBottom * 5),
          [presets.Desktop]: {
            gridTemplateColumns: `repeat(3, 1fr)`,
            gridGap: 20,
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
  showMoreButton: {
    border: 0,
    borderRadius: presets.radius,
    cursor: `pointer`,
    fontFamily: options.headerFontFamily.join(`,`),
    fontWeight: `bold`,
    padding: `${rhythm(1 / 5)} ${rhythm(2 / 3)}`,
    WebkitFontSmoothing: `antialiased`,
    "&&": {
      backgroundColor: colors.gatsby,
      borderBottom: `none`,
      boxShadow: `none`,
      color: `white`,
      "&:hover": {
        backgroundColor: colors.gatsby,
      },
    },
  },
}
