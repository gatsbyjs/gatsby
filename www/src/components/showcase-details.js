/** @jsx jsx */
import { jsx } from "theme-ui"
import { Fragment } from "react"
import { Link, StaticQuery, graphql } from "gatsby"
import { Helmet } from "react-helmet"
import url from "url"
import Img from "gatsby-image"
import qs from "qs"

import { space, mediaQueries } from "../gatsby-plugin-theme-ui"
import Layout from "../components/layout"
import ShareMenu from "../components/share-menu"
import Button from "../components/button"
import Screenshot from "../views/shared/screenshot"

import MdArrowUpward from "react-icons/lib/md/arrow-upward"
import MdLink from "react-icons/lib/md/link"
import FeaturedIcon from "../assets/icons/featured-sites-icons"
import GithubIcon from "react-icons/lib/go/mark-github"

const gutter = 6
const gutterDesktop = 8

const styles = {
  link: {
    color: `link.color`,
    textDecoration: `none`,
  },
  prevNextLink: {
    color: `lilac`,
    fontFamily: `header`,
    position: `absolute`,
    top: 280,
    width: 300,
    transform: `translateX(-75px) rotate(90deg)`,
  },
  prevNextLinkSiteTitle: {
    color: `gatsby`,
    fontWeight: `bold`,
  },
  prevNextImage: {
    borderRadius: 1,
    boxShadow: `overlay`,
  },
  prevNextPermalinkLabel: {
    color: `textMuted`,
    fontFamily: `header`,
    fontWeight: `body`,
  },
  prevNextPermalinkImage: {
    mb: 0,
    mt: 6,
  },
  prevNextPermalinkTitle: {
    color: `gatsby`,
    display: `block`,
    position: `relative`,
  },
  prevNextPermalinkContainer: {
    width: `50%`,
  },
  truncate: {
    whiteSpace: `nowrap`,
    overflow: `hidden`,
    textOverflow: `ellipsis`,
    display: `block`,
    width: `100%`,
  },
  prevNextPermalinkArrow: {
    color: `lilac`,
    mr: 4,
    verticalAlign: `sub`,
    position: `absolute`,
    left: `-${space[6]}`,
    top: `50%`,
    transform: `translateY(-50%)`,
  },
  prevNextPermalinkMeta: {
    mr: 8,
    display: `flex`,
    flexDirection: `row`,
    justifyContent: `flex-end`,
  },
  prevNextPermalinkMetaInner: {
    flexBasis: 540,
    flexGrow: 0,
    flexShrink: 1,
    minWidth: 0,
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
    }}
  >
    <GithubIcon sx={{ fontSize: 3, mr: 2, color: `link.color` }} />
    Source
  </a>
)

const ShowcaseDetails = ({ parent, data, isModal, categories }) => (
  <StaticQuery
    query={graphql`
      query {
        allSitesYaml(
          filter: {
            featured: { eq: true }
            main_url: { ne: null }
            fields: { hasScreenshot: { eq: true } }
          }
        ) {
          edges {
            node {
              id
              url
              title
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
      }
    `}
    render={staticData => {
      const allSitesYaml = staticData.allSitesYaml
      const nextSite = parent.getNext(allSitesYaml)
      const previousSite = parent.getPrevious(allSitesYaml)
      const { filters } = parent.props.location.state || {}
      const screenshotFile =
        data.sitesYaml.childScreenshot.screenshotFile.childImageSharp

      return (
        <Layout
          location={parent.props.location}
          isModal={isModal}
          modalBackgroundPath={parent.getExitLocation()}
          modalNext={() => parent.next(allSitesYaml)}
          modalPrevious={() => parent.previous(allSitesYaml)}
          modalNextLink={
            <Link
              to={nextSite.fields.slug}
              state={{
                isModal: true,
                filters,
              }}
              css={{
                display: `block`,
                position: `fixed`,
                top: `150px`,
                transform: `translateX(750px)`,
              }}
            >
              <div css={{ margin: `25px` }}>
                <Img
                  key={nextSite.id}
                  sx={styles.prevNextImage}
                  backgroundColor
                  fixed={{
                    srcSet: ``,
                    src:
                      nextSite.childScreenshot.screenshotFile.childImageSharp
                        .resize.src,
                    width: 100,
                    height: 100,
                  }}
                  alt=""
                />
              </div>
              <div sx={styles.prevNextLink}>
                <MdArrowUpward />
                <div> Next Site in Showcase </div>
                <div sx={styles.prevNextLinkSiteTitle}>{nextSite.title}</div>
              </div>
            </Link>
          }
          modalPreviousLink={
            <Link
              to={previousSite.fields.slug}
              state={{
                isModal: true,
                filters,
              }}
              css={{
                display: `block`,
                position: `fixed`,
                top: `150px`,
                transform: `translateX(-100%)`,
              }}
            >
              <div css={{ margin: `25px` }}>
                <Img
                  key={previousSite.id}
                  sx={styles.prevNextImage}
                  backgroundColor
                  fixed={{
                    srcSet: ``,
                    src:
                      previousSite.childScreenshot.screenshotFile
                        .childImageSharp.resize.src,
                    width: 100,
                    height: 100,
                  }}
                  alt=""
                />
              </div>
              <div
                sx={{
                  ...styles.prevNextLink,
                  transform: `translateX(-75px) rotate(-90deg)`,
                  textAlign: `right`,
                }}
              >
                <MdArrowUpward />
                <div> Previous Site in Showcase </div>
                <div sx={styles.prevNextLinkSiteTitle}>
                  {previousSite.title}
                </div>
              </div>
            </Link>
          }
        >
          <div
            sx={{
              alignItems: `center`,
              display: `flex`,
              flexDirection: `column`,
              maxWidth: isModal ? false : 1080,
              margin: isModal ? false : `0 auto`,
            }}
          >
            <div css={{ width: `100%` }}>
              <Helmet titleTemplate="%s | GatsbyJS">
                <title>{`${data.sitesYaml.title}: Showcase`}</title>
                <meta
                  property="og:image"
                  content={`https://www.gatsbyjs.org${screenshotFile.resize.src}`}
                />
                <meta
                  name="twitter:image"
                  content={`https://www.gatsbyjs.org${screenshotFile.resize.src}`}
                />
                <meta name="twitter:card" content="summary_large_image" />
                <meta
                  name="og:title"
                  value={`${data.sitesYaml.title}: Showcase | GatsbyJS`}
                />
                <meta
                  property="og:image:width"
                  content={screenshotFile.resize.width}
                />
                <meta
                  property="og:image:height"
                  content={screenshotFile.resize.height}
                />
                <meta
                  property="og:description"
                  content={
                    data.sitesYaml.description || data.sitesYaml.main_url
                  }
                />
                <meta
                  name="twitter:description"
                  content={
                    data.sitesYaml.description || data.sitesYaml.main_url
                  }
                />
              </Helmet>
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
                <h1 sx={{ m: 0 }}>{data.sitesYaml.title}</h1>
                <a href={data.sitesYaml.main_url} sx={styles.link}>
                  {cleanUrl(data.sitesYaml.main_url)}
                </a>
                {data.sitesYaml.built_by && (
                  <span sx={{ color: `textMuted` }}>
                    <span sx={{ px: 2 }}>/</span>
                    Built by {` `}
                    {data.sitesYaml.built_by_url ? (
                      <a
                        href={data.sitesYaml.built_by_url}
                        sx={{ ...styles.link }}
                      >
                        {data.sitesYaml.built_by}
                      </a>
                    ) : (
                      data.sitesYaml.built_by
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
                {data.sitesYaml.featured && <Featured />}
                {data.sitesYaml.source_url && (
                  <SourceLink href={data.sitesYaml.source_url} />
                )}
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
                      to={data.sitesYaml.main_url}
                    >
                      Visit site
                    </Button>
                    <ShareMenu
                      image={`https://www.gatsbyjs.org${screenshotFile.resize.src}`}
                      title={data.sitesYaml.title}
                      url={data.sitesYaml.main_url}
                    />
                  </div>
                </div>
              </div>
              <Screenshot
                alt={`Screenshot of ${data.sitesYaml.title}`}
                boxShadow={!isModal}
                imageSharp={screenshotFile.fluid}
                key={data.sitesYaml.id}
              />
              <div
                sx={{
                  p: gutter,
                  [mediaQueries.lg]: { p: gutterDesktop },
                }}
              >
                <p>{data.sitesYaml.description}</p>
                <div
                  sx={{
                    display: `flex`,
                  }}
                >
                  <div sx={{ color: `textMuted`, pr: 5 }}>Categories</div>
                  <div>
                    {categories.map((c, i) => (
                      <Fragment key={c}>
                        <Link
                          to={`/showcase?${qs.stringify({ filters: [c] })}`}
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
        </Layout>
      )
    }}
  />
)

export default ShowcaseDetails
