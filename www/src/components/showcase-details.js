/** @jsx jsx */
import { jsx } from "theme-ui"
import React, { Fragment } from "react"
import { useStaticQuery, graphql } from "gatsby"
import Link from "./localized-link"
import url from "url"
import Img from "gatsby-image"
import qs from "qs"

import { mediaQueries } from "gatsby-design-tokens/dist/theme-gatsbyjs-org"
import Modal from "./modal"
import ShareMenu from "./share-menu"
import Button from "./button"
import Screenshot from "../views/shared/screenshot"
import PageMetadata from "../components/site-metadata"

import FeaturedIcon from "../assets/icons/featured-sites-icons"
import { MdArrowUpward, MdLink } from "react-icons/md"
import { GoMarkGithub as GithubIcon } from "react-icons/go"
import { filterByCategories } from "../views/showcase/filtered-showcase"

const gutter = 6
const gutterDesktop = 8

const styles = {
  link: {
    color: `link.color`,
    textDecoration: `none`,
  },
  prevNextLink: {
    color: `lilac`,
    fontFamily: `heading`,
    px: [6, null, null, 0],
  },
  prevNextLinkSiteTitle: {
    color: `link.color`,
    fontWeight: `bold`,
  },
  prevNextImage: {
    borderRadius: 1,
    boxShadow: `overlay`,
  },
}

const cleanUrl = mainUrl => {
  const parsed = url.parse(mainUrl)
  let path = parsed.pathname
  if (path[path.length - 1] === `/`) path = path.slice(0, path.length - 1)
  return parsed.hostname + path
}

const Featured = () => (
  <div
    sx={{
      color: `textMuted`,
      display: `flex`,
      fontWeight: `bold`,
      mr: 4,
    }}
  >
    <span
      sx={{
        height: t => t.space[5],
        m: 0,
        mr: 2,
        width: t => t.space[5],
      }}
    >
      <FeaturedIcon />
    </span>
    {` `}
    Featured
  </div>
)

const SourceLink = ({ ...props }) => (
  <a
    {...props}
    sx={{
      "&&": {
        border: 0,
      },
      display: `flex`,
      alignItems: `center`,
      mr: 3,
      color: `link.color`,
      width: `100%`,
    }}
  >
    <GithubIcon sx={{ fontSize: 3, mr: 2, color: `link.color` }} />
    Source
  </a>
)

function usePrevAndNextSite(item, filters = []) {
  const { allSitesYaml } = useStaticQuery(graphql`
    query {
      allSitesYaml(
        filter: {
          main_url: { ne: null }
          fields: { hasScreenshot: { eq: true } }
        }
      ) {
        nodes {
          title
          categories
          fields {
            slug
          }
          childScreenshot {
            screenshotFile {
              childImageSharp {
                resize(width: 200, height: 200) {
                  src
                }
              }
            }
          }
        }
      }
    }
  `)

  const sites = filterByCategories(allSitesYaml.nodes, filters)
  const currentIndex = sites.findIndex(node => node.fields.slug === item)
  const nextSite = sites[(currentIndex + 1) % sites.length]
  const previousSite =
    sites[currentIndex === 0 ? sites.length - 1 : currentIndex - 1]
  return { nextSite, previousSite }
}

/**
 * @returns {string} - the URI that should be navigated to when the showcase details modal is closed
 */
function getExitLocation(filters = {}) {
  if (Object.keys(filters).length) {
    const queryString = qs.stringify({ filters })
    return `/showcase/?${queryString}`
  } else {
    return `/showcase/`
  }
}

function ShowcaseModal({ children, location, isModal }) {
  if (!isModal) return children
  const { filters } = location.state || {}
  const { previousSite, nextSite } = usePrevAndNextSite(
    location.pathname,
    filters
  )
  return (
    <Modal
      modalBackgroundPath={getExitLocation(filters)}
      next={nextSite.fields.slug}
      previous={previousSite.fields.slug}
      filters={filters}
      modalNextLink={
        <>
          <Img
            key={nextSite.fields.slug}
            sx={styles.prevNextImage}
            backgroundColor
            fixed={{
              srcSet: ``,
              src:
                nextSite.childScreenshot.screenshotFile.childImageSharp.resize
                  .src,
              width: 100,
              height: 100,
            }}
            imgStyle={{
              margin: 0,
            }}
            alt=""
          />
          <div
            sx={{
              ...styles.prevNextLink,
              [mediaQueries.md]: {
                position: `absolute`,
                top: 240,
                width: 300,
                transform: `translateX(-80px) rotate(90deg)`,
              },
            }}
          >
            <MdArrowUpward
              sx={{
                transform: `rotate(90deg)`,
                [mediaQueries.md]: {
                  transform: `none`,
                },
              }}
            />
            <div> Next Site in Showcase </div>
            <div sx={styles.prevNextLinkSiteTitle}>{nextSite.title}</div>
          </div>
        </>
      }
      modalPreviousLink={
        <>
          <Img
            key={previousSite.fields.slug}
            sx={styles.prevNextImage}
            backgroundColor
            fixed={{
              srcSet: ``,
              src:
                previousSite.childScreenshot.screenshotFile.childImageSharp
                  .resize.src,
              width: 100,
              height: 100,
            }}
            imgStyle={{
              margin: 0,
            }}
            alt=""
          />
          <div
            sx={{
              ...styles.prevNextLink,
              [mediaQueries.md]: {
                textAlign: `right`,
                position: `absolute`,
                top: 240,
                width: 300,
                transform: `translateX(-80px) rotate(-90deg)`,
              },
            }}
          >
            <MdArrowUpward
              sx={{
                transform: `rotate(-90deg)`,
                [mediaQueries.md]: {
                  transform: `none`,
                },
              }}
            />
            <div> Previous Site in Showcase </div>
            <div sx={styles.prevNextLinkSiteTitle}>{previousSite.title}</div>
          </div>
        </>
      }
    >
      {children}
    </Modal>
  )
}

const ShowcaseDetails = ({ location, site, isModal, categories }) => {
  const screenshotFile = site.childScreenshot.screenshotFile.childImageSharp

  return (
    <ShowcaseModal isModal={isModal} location={location}>
      <div
        sx={{
          display: `flex`,
          flexDirection: `column`,
          maxWidth: isModal ? false : 1080,
          margin: isModal ? false : `0 auto`,
          width: `100%`,
          order: 1,
        }}
      >
        <div css={{ width: `100%` }}>
          <PageMetadata
            title={`${site.title}: Showcase`}
            description={site.description || site.main_url}
            image={screenshotFile.resize}
            twitterCard="summary_large_image"
          />
          <div
            sx={{
              p: gutter,
              [mediaQueries.lg]: {
                p: gutterDesktop,
                pb: gutter,
                pr: isModal ? 96 : false,
              },
            }}
          >
            <h1 sx={{ m: 0 }}>{site.title}</h1>
            <a href={site.main_url} sx={styles.link}>
              {cleanUrl(site.main_url)}
            </a>
            {site.built_by && (
              <span sx={{ color: `textMuted` }}>
                <span sx={{ px: 2 }}>/</span>
                Built by {` `}
                {site.built_by_url ? (
                  <a href={site.built_by_url} sx={{ ...styles.link }}>
                    {site.built_by}
                  </a>
                ) : (
                  site.built_by
                )}
              </span>
            )}
          </div>
          <div
            sx={{
              alignItems: `center`,
              display: `flex`,
              fontFamily: `header`,
              mx: gutter,
              py: 4,
              [mediaQueries.lg]: {
                mx: gutterDesktop,
              },
            }}
          >
            {site.featured && <Featured />}
            {site.source_url && <SourceLink href={site.source_url} />}
            <div
              sx={{
                alignSelf: `center`,
                ml: `auto`,
              }}
            >
              <div
                css={{
                  display: `flex`,
                  position: `relative`,
                  zIndex: 1,
                }}
              >
                <Button
                  icon={<MdLink />}
                  overrideCSS={{ mr: 2 }}
                  tag="href"
                  to={site.main_url}
                >
                  Visit site
                </Button>
                <ShareMenu
                  image={`https://www.gatsbyjs.org${screenshotFile.resize.src}`}
                  title={site.title}
                  url={site.main_url}
                />
              </div>
            </div>
          </div>
          <Screenshot
            alt={`Screenshot of ${site.title}`}
            boxShadow={!isModal}
            imageSharp={screenshotFile.fluid}
            key={site.id}
          />
          <div
            sx={{
              p: gutter,
              [mediaQueries.lg]: { p: gutterDesktop },
            }}
          >
            <p>{site.description}</p>
            <div sx={{ display: `flex` }}>
              <div sx={{ color: `textMuted`, pr: 5 }}>Categories</div>
              <div>
                {categories.map((c, i) => (
                  <Fragment key={c}>
                    <Link
                      to={`/showcase/?${qs.stringify({ filters: [c] })}`}
                      state={{ isModal: true }}
                      sx={styles.link}
                    >
                      {c}
                    </Link>
                    {i === categories.length - 1 ? `` : `, `}
                  </Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ShowcaseModal>
  )
}

export default ShowcaseDetails
