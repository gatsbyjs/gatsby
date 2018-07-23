import React from "react"
import { Link } from "gatsby"
import Img from "gatsby-image"

import styles from '../shared/styles'
import { /*options,*/ scale, rhythm } from "../../utils/typography"
import presets /*, { colors }*/ from "../../utils/presets"

const ShowcaseList = ({ items, count }) => {
  if (count) items = items.slice(0, count)

  return (
    <div
      css={{
        display: `flex`,
        flexWrap: `wrap`,
        padding: rhythm(3 / 4),
        justifyContent: `center`,
        [presets.Desktop]: {
          justifyContent: `flex-start`,
        },
      }}
    >
      {items.map(
        ({ node }) =>
          node.fields &&
          node.fields.slug && ( // have to filter out null fields from bad data
            <Link
              key={node.id}
              to={{ pathname: node.fields.slug, state: { isModal: true } }}
              {...styles.withTitleHover}
              css={{
                margin: rhythm(3 / 4),
                width: 280,
                "&&": {
                  borderBottom: `none`,
                  boxShadow: `none`,
                  transition: `all ${presets.animation.speedDefault} ${
                    presets.animation.curveDefault
                  }`,
                  "&:hover": {
                    ...styles.screenshotHover,
                  },
                },
              }}
            >
              {node.childScreenshot ? (
                <Img
                  resolutions={
                    node.childScreenshot.screenshotFile.childImageSharp
                      .resolutions
                  }
                  alt={`Screenshot of ${node.title}`}
                  css={{
                    ...styles.screenshot,
                  }}
                />
              ) : (
                <div
                  css={{
                    width: 320,
                    backgroundColor: `#d999e7`,
                  }}
                >
                  missing
                </div>
              )}
              <div>
                <span className="title">{node.title}</span>
              </div>
              <div
                css={{
                  ...scale(-2 / 5),
                  color: `#9B9B9B`,
                  fontWeight: `normal`,
                }}
              >
                {node.categories && node.categories.join(`, `)}
              </div>
            </Link>
          )
      )}
    </div>
  )
}

export default ShowcaseList
