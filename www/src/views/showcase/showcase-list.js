import React from "react"
import { Link } from "gatsby"
import Img from "gatsby-image"

import styles from "../shared/styles"
import qs from "qs"

import ShowcaseItemCategories from "./showcase-item-categories"
import { rhythm, scale } from "../../utils/typography"
import presets, { colors } from "../../utils/presets"

import GithubIcon from "react-icons/lib/go/mark-github"
import FeaturedIcon from "../../assets/featured-sites-icons--white.svg"

const ShowcaseList = ({ items, count }) => {
  if (count) items = items.slice(0, count)

  return (
    <div
      css={{
        ...styles.showcaseList,
      }}
    >
      {items.map(
        ({ node }) =>
          node.fields &&
          node.fields.slug && ( // have to filter out null fields from bad data
            <div
              key={node.id}
              css={{
                ...styles.showcaseItem,
              }}
            >
              <Link
                to={node.fields.slug}
                state={{ isModal: true }}
                {...styles.withTitleHover}
                css={{
                  "&&": {
                    borderBottom: `none`,
                    boxShadow: `none`,
                    transition: `all ${presets.animation.speedDefault} ${
                      presets.animation.curveDefault
                    }`,
                    "&:hover": {
                      ...styles.screenshotHover,
                    },
                    "&:hover ~ .meta > .featured-site": {
                      transform: `translateY(-3px)`,
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
              </Link>
              <div
                css={{
                  ...scale(-2 / 5),
                  display: `flex`,
                  justifyContent: `space-between`,
                  alignItems: `baseline`,
                  "&&": {
                    color: `#9B9B9B`,
                  },
                }}
                className="meta"
              >
                <div
                  css={{
                    paddingRight: rhythm(1),
                    lineHeight: 1.3,
                  }}
                >
                  <ShowcaseItemCategories categories={node.categories} />
                </div>
                {node.source_url && (
                  <div>
                    <a
                      css={{
                        "&&": {
                          color: colors.gray.bright,
                          fontWeight: `normal`,
                          borderBottom: `none`,
                          boxShadow: `none`,
                          "&:hover": {
                            background: `none`,
                            color: colors.gatsby,
                          },
                        },
                      }}
                      href={node.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <GithubIcon style={{ verticalAlign: `text-top` }} />
                    </a>
                  </div>
                )}
                {node.featured && (
                  <Link
                    css={{
                      "&&": {
                        ...styles.featuredItem,
                      },
                    }}
                    to={`/showcase?${qs.stringify({
                      filters: `Featured`,
                    })}`}
                    className="featured-site"
                  >
                    <img
                      src={FeaturedIcon}
                      alt="icon"
                      css={{
                        ...styles.featuredIcon,
                      }}
                    />
                  </Link>
                )}
              </div>
            </div>
          )
      )}
    </div>
  )
}

export default ShowcaseList
