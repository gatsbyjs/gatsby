import React, { Fragment } from "react"
import { Link } from "gatsby"

import styles from "../shared/styles"
import ThumbnailLink from "../shared/thumbnail"
import EmptyGridItems from "../shared/empty-grid-items"
import qs from "qs"

import ShowcaseItemCategories from "./showcase-item-categories"
import { space, lineHeights } from "../../utils/presets"

import GithubIcon from "react-icons/lib/go/mark-github"
import LaunchSiteIcon from "react-icons/lib/md/launch"
import FeaturedIcon from "../../assets/featured-sites-icons--white.svg"

const ShowcaseList = ({ items, count, filters, onCategoryClick }) => {
  if (count) items = items.slice(0, count)

  return (
    <main id={`reach-skip-nav`} css={{ ...styles.showcaseList }}>
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
                state={{ filters }}
              >
                <strong className="title">{node.title}</strong>
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
                    paddingRight: space[5],
                    lineHeight: lineHeights.dense,
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
                        css={{ ...styles.shortcutIcon }}
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
                    css={{ ...styles.shortcutIcon }}
                    href={node.main_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <LaunchSiteIcon style={{ verticalAlign: `text-top` }} />
                  </a>
                </div>
                {node.featured && (
                  <Link
                    css={{ "&&": { ...styles.featuredItem } }}
                    to={`/showcase?${qs.stringify({
                      filters: `Featured`,
                    })}`}
                    className="featured-site"
                  >
                    <img
                      src={FeaturedIcon}
                      alt="icon"
                      css={{ ...styles.featuredIcon }}
                    />
                  </Link>
                )}
              </div>
            </div>
          )
      )}
      {items.length && <EmptyGridItems styles={styles.showcaseItem} />}
    </main>
  )
}

export default ShowcaseList
