import React from "react"
import { Link } from "gatsby"

import styles from "../shared/styles"
import ThumbnailLink from "../shared/thumbnail"
import qs from "qs"

import ShowcaseItemCategories from "./showcase-item-categories"
import { rhythm } from "../../utils/typography"
import { colors } from "../../utils/presets"

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
              <ThumbnailLink
                slug={node.fields.slug}
                image={node.childScreenshot}
                title={node.title}
              >
                <div>
                  <span className="title">{node.title}</span>
                </div>
              </ThumbnailLink>
              <div
                css={{
                  ...styles.meta,
                  display: `flex`,
                  justifyContent: `space-between`,
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
      {/* makes last row items equal width and aligned left */}
      <div aria-hidden="true" css={{ ...styles.showcaseItem, marginTop: 0, marginBottom: 0 }} />
      <div aria-hidden="true" css={{ ...styles.showcaseItem, marginTop: 0, marginBottom: 0 }} />
      <div aria-hidden="true" css={{ ...styles.showcaseItem, marginTop: 0, marginBottom: 0 }} />
      <div aria-hidden="true" css={{ ...styles.showcaseItem, marginTop: 0, marginBottom: 0 }} />
      <div aria-hidden="true" css={{ ...styles.showcaseItem, marginTop: 0, marginBottom: 0 }} />
      <div aria-hidden="true" css={{ ...styles.showcaseItem, marginTop: 0, marginBottom: 0 }} />
    </div>
  )
}

export default ShowcaseList
