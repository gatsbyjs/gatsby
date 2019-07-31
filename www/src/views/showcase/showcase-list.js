/** @jsx jsx */
import { jsx } from "theme-ui"
import React, { Fragment } from "react"
import { Link } from "gatsby"

import {
  showcaseList,
  showcaseItem,
  shortcutIcon,
  meta,
} from "../shared/styles"
import ThumbnailLink from "../shared/thumbnail"
import EmptyGridItems from "../shared/empty-grid-items"
import qs from "qs"

import ShowcaseItemCategories from "./showcase-item-categories"
import { mediaQueries } from "../../gatsby-plugin-theme-ui"

import GithubIcon from "react-icons/lib/go/mark-github"
import LaunchSiteIcon from "react-icons/lib/md/launch"
import FeaturedIcon from "../../assets/icons/featured-sites-icons--white.svg"

const ShowcaseList = ({ items, count, filters, onCategoryClick }) => {
  if (count) items = items.slice(0, count)

  return (
    <main id={`reach-skip-nav`} sx={showcaseList}>
      {items.map(
        ({ node }) =>
          node.fields &&
          node.fields.slug && ( // have to filter out null fields from bad data
            <div key={node.id} sx={showcaseItem}>
              <ThumbnailLink
                slug={node.fields.slug}
                image={node.childScreenshot}
                title={node.title}
                state={{ filters }}
              >
                <strong className="title">{node.title}</strong>
              </ThumbnailLink>
              <div
                sx={{
                  ...meta,
                  display: `flex`,
                  justifyContent: `space-between`,
                }}
                className="meta"
              >
                <div
                  sx={{
                    pr: 5,
                    lineHeight: `dense`,
                  }}
                >
                  <ShowcaseItemCategories
                    categories={node.categories}
                    onCategoryClick={onCategoryClick}
                  />
                </div>
                <div css={{ flex: `0 0 auto`, textAlign: `right` }}>
                  {node.source_url && (
                    <Fragment>
                      <a
                        sx={shortcutIcon}
                        href={node.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <GithubIcon style={{ verticalAlign: `text-top` }} />
                      </a>
                      {` `}
                    </Fragment>
                  )}
                  <a
                    css={shortcutIcon}
                    href={node.main_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <LaunchSiteIcon style={{ verticalAlign: `text-top` }} />
                  </a>
                </div>
                {node.featured && (
                  <Link
                    sx={{
                      "&&": {
                        display: `none`,
                        transition: t =>
                          `background ${t.transition.speed.slow} ${
                            t.transition.curve.default
                          }, transform ${t.transition.speed.slow} ${
                            t.transition.curve.default
                          }`,
                        [mediaQueries.lg]: {
                          alignItems: `center`,
                          background: `accent`,
                          border: `none`,
                          borderTopRightRadius: 1,
                          borderBottomLeftRadius: 1,
                          boxShadow: `none`,
                          cursor: `pointer`,
                          display: `flex`,
                          height: 24,
                          margin: 0,
                          padding: 0,
                          position: `absolute`,
                          top: 0,
                          right: 0,
                          width: 24,
                          "&:hover": {
                            background: `gatsby`,
                          },
                        },
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
                      xs={{ my: 0, mx: `auto`, display: `block` }}
                    />
                  </Link>
                )}
              </div>
            </div>
          )
      )}
      {items.length && <EmptyGridItems styles={showcaseItem} />}
    </main>
  )
}

export default ShowcaseList
