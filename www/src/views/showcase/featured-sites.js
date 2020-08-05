/** @jsx jsx */
import { jsx } from "theme-ui"
import { Component } from "react"
import Img from "gatsby-image"
import hex2rgba from "hex2rgba"
import { useColorMode } from "theme-ui"

import { screenshot, screenshotHover, withTitleHover } from "../shared/styles"
import ShowcaseItemCategories from "./showcase-item-categories"
import { ShowcaseIcon } from "../../assets/icons"
import {
  mediaQueries,
  colors,
} from "gatsby-design-tokens/dist/theme-gatsbyjs-org"
import { svgStyles } from "../../utils/styles"
import Button from "../../components/button"
import { MdArrowForward as ArrowForwardIcon } from "react-icons/md"
import Link from "../../components/localized-link"

const featuredSitesCard = {
  display: `flex`,
  flexDirection: `column`,
  flexGrow: 0,
  flexShrink: 0,
  width: 320,
  marginBottom: 9,
  marginRight: 6,
  [mediaQueries.xl]: {
    width: 360,
    marginRight: 8,
  },
  [mediaQueries.xxl]: {
    width: 400,
  },
}

const GradientOverlay = () => {
  const [colorMode] = useColorMode()
  const gradientColor =
    colorMode === `dark` ? colors.modes.dark.background : colors.background

  return (
    <div
      sx={{
        background: () =>
          `linear-gradient(90deg, ${hex2rgba(gradientColor, 0)} 0%, ${hex2rgba(
            gradientColor,
            1
          )} 100%)`,
        bottom: 6,
        pointerEvents: `none`,
        position: `absolute`,
        right: -6,
        top: 0,
        width: 60,
      }}
    />
  )
}

class FeaturedSites extends Component {
  setFilterToFeatured = e => {
    e.preventDefault()

    this.props.setFilters(`Featured`)
  }

  render() {
    const { featured, setFilters } = this.props

    return (
      <section
        className="featured-sites"
        sx={{
          mt: 6,
          mx: 6,
          position: `relative`,
          display: `none`,
          [mediaQueries.lg]: {
            display: `block`,
          },
        }}
      >
        <div
          sx={{
            display: `flex`,
            alignItems: `center`,
            flexWrap: `wrap`,
          }}
        >
          <h1
            sx={{
              fontFamily: `heading`,
              fontSize: 4,
              fontWeight: `bold`,
              ml: 1,
              mr: 30,
              my: 0,
            }}
          >
            Featured Sites
          </h1>
          <a
            href="#showcase"
            sx={{
              ...withTitleHover,
              display: `none`,
              fontSize: 1,
              [mediaQueries.sm]: {
                display: `block`,
              },
              "&&": {
                borderBottom: 0,
                cursor: `pointer`,
                "&:hover": {
                  color: `link.hoverColor`,
                },
              },
            }}
            onClick={this.setFilterToFeatured}
          >
            <span className="title">View all</span>
            {` `}
            <ArrowForwardIcon sx={{ verticalAlign: `sub` }} />
          </a>
          <div
            css={{
              alignItems: `center`,
              display: `flex`,
              marginLeft: `auto`,
            }}
          >
            <div
              sx={{
                color: `textMuted`,
                display: `none`,
                fontSize: 1,
                mr: 4,
                [mediaQueries.md]: {
                  display: `block`,
                },
              }}
            >
              Want to get featured?
            </div>
            <Button
              to="https://www.gatsbyjs.org/contributing/site-showcase-submissions/"
              tag="href"
              target="_blank"
              rel="noopener noreferrer"
              variant="small"
              icon={<ArrowForwardIcon />}
            >
              Submit your Site
            </Button>
          </div>
        </div>
        <div css={{ position: `relative` }}>
          <div
            sx={{
              borderBottom: 1,
              borderColor: `ui.border`,
              display: `flex`,
              flexShrink: 0,
              mx: -6,
              overflowX: `scroll`,
              pt: 6,
              px: 6,
            }}
          >
            {featured.slice(0, 9).map(node => (
              <div
                key={node.id}
                sx={{
                  ...featuredSitesCard,
                  ...withTitleHover,
                }}
              >
                <Link
                  sx={{
                    "&&": {
                      borderBottom: `none`,
                      color: `heading`,
                      fontFamily: `heading`,
                      fontSize: 3,
                      fontWeight: `bold`,
                      transition: t =>
                        `box-shadow ${t.transition.speed.slow} ${t.transition.curve.default}, transform .3s ${t.transition.curve.default}`,
                      "&:hover": { ...screenshotHover },
                    },
                  }}
                  to={node.fields.slug}
                  state={{ isModal: true }}
                >
                  {node.childScreenshot && (
                    <Img
                      fluid={
                        node.childScreenshot.screenshotFile.childImageSharp
                          .fluid
                      }
                      alt={node.title}
                      sx={{ ...screenshot }}
                    />
                  )}
                  <div>
                    <span className="title">{node.title}</span>
                  </div>
                </Link>
                <div
                  sx={{
                    color: `textMuted`,
                    fontSize: 1,
                    fontWeight: `body`,
                    [mediaQueries.lg]: {
                      marginTop: `auto`,
                    },
                  }}
                >
                  {node.built_by && (
                    <div
                      sx={{ color: `text`, fontFamily: `heading`, fontSize: 2 }}
                    >
                      Built by {node.built_by}
                    </div>
                  )}
                  <ShowcaseItemCategories
                    categories={node.categories}
                    onCategoryClick={c => setFilters(c)}
                  />
                </div>
              </div>
            ))}
            <div sx={{ display: `flex` }}>
              <a
                href="#showcase"
                sx={{
                  backgroundColor: `card.background`,
                  borderRadius: 1,
                  marginRight: t => `${t.space[6]} !important`,
                  textAlign: `center`,
                  "&&": {
                    border: 0,
                    transition: `default`,
                    "&:hover": {
                      transform: t => `translateY(-${t.space[1]})`,
                      boxShadow: `overlay`,
                    },
                  },
                  ...featuredSitesCard,
                }}
                onClick={this.setFilterToFeatured}
              >
                <div
                  sx={{
                    alignItems: `center`,
                    borderRadius: 1,
                    display: `flex`,
                    flexBasis: `100%`,
                    position: `relative`,
                  }}
                >
                  <span
                    sx={{
                      color: `gatsby`,
                      mx: `auto`,
                    }}
                  >
                    <span
                      sx={{
                        display: `block`,
                        height: 44,
                        mx: `auto`,
                        mb: 6,
                        width: `auto`,
                        [mediaQueries.md]: {
                          height: 64,
                        },
                        [mediaQueries.xl]: {
                          height: 72,
                        },
                        "& svg": {
                          height: `100%`,
                          ...svgStyles.active,
                        },
                      }}
                    >
                      <ShowcaseIcon />
                    </span>
                    View all Featured Sites
                  </span>
                </div>
              </a>
            </div>
          </div>
          <GradientOverlay />
        </div>
      </section>
    )
  }
}

export default FeaturedSites
