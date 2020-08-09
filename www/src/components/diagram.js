/** @jsx jsx */
import { jsx } from "theme-ui"
import { Fragment } from "react"
import { keyframes } from "@emotion/core"
import { StaticQuery, graphql } from "gatsby"
import Link from "./localized-link"

import logo from "../assets/monogram.svg"
import { GraphQLIcon, ReactJSIcon } from "../assets/tech-logos"
import FuturaParagraph from "./futura-paragraph"
import TechWithIcon from "./tech-with-icon"
import { mediaQueries } from "gatsby-design-tokens/dist/theme-gatsbyjs-org"

const lineAnimation = keyframes({
  to: { strokeDashoffset: 10 },
})

const Segment = ({ className, children }) => (
  <div
    className={`Segment ${className}`}
    css={{
      margin: `0 auto`,
      maxWidth: `48rem`,
      textAlign: `center`,
    }}
  >
    {children}
  </div>
)

const SegmentTitle = ({ children }) => (
  <h2
    className="Segment-title"
    sx={{
      bg: `accent`,
      borderRadius: 1,
      bottom: -2,
      color: `black`,
      display: `inline`,
      fontSize: 1,
      fontWeight: `body`,
      letterSpacing: `tracked`,
      lineHeight: `solid`,
      margin: `0 auto`,
      position: `relative`,
      px: 3,
      py: 2,
      textTransform: `uppercase`,
      transform: `translateZ(0)`,
    }}
  >
    {children}
  </h2>
)

const VerticalLine = () => (
  <svg
    width="20"
    height="30"
    viewBox="0 0 20 30"
    css={{ margin: `0 auto`, display: `block` }}
  >
    <path
      d="M10 40 L10 -10"
      sx={{
        stroke: `lilac`,
        strokeWidth: `3`,
        strokeLinecap: `round`,
        strokeDasharray: `0.5 10`,
        animation: `${lineAnimation} 400ms linear infinite`,
      }}
    />
  </svg>
)

const box = {
  border: 1,
  borderColor: `ui.border`,
  borderRadius: 2,
  px: 7,
  py: 5,
}

const borderAndBoxShadow = {
  bg: `card.background`,
  border: 0,
  borderRadius: 1,
  boxShadow: `raised`,
  transform: `translateZ(0)`,
  width: `100%`,
}

const SourceItems = ({ children }) => (
  <div
    sx={{
      display: `flex`,
      flexWrap: `wrap`,
      justifyContent: `center`,
      ...box,
    }}
  >
    {children}
  </div>
)

const boxPadding = { py: 3, px: 4 }

const SourceItem = ({ children }) => (
  <div
    sx={{
      py: 4,
      px: 5,
      display: `flex`,
      flex: [null, `1 1 50%`, null, `1 1 33%`],
      maxWidth: [null, null, null, `33%`],
    }}
  >
    <div
      sx={{
        ...borderAndBoxShadow,
        ...boxPadding,
        lineHeight: `dense`,
        textAlign: `left`,
      }}
    >
      {children}
    </div>
  </div>
)

const ItemTitle = ({ children }) => (
  <h3
    sx={{
      fontSize: 2,
      margin: 0,
      color: `card.header`,
    }}
  >
    {children}
  </h3>
)

const ItemDescription = ({ children, color }) => (
  <small
    sx={{
      color: color ? color : `textMuted`,
      display: `block`,
      fontFamily: `body`,
      fontSize: 1,
      lineHeight: `dense`,
    }}
  >
    {children}
  </small>
)

const ItemDescriptionLink = ({ to, children }) => (
  <Link css={{ "&&": { color: `purple.80` } }} to={to}>
    {children}
  </Link>
)

const Gatsby = () => (
  <div
    sx={{
      ...borderAndBoxShadow,
      bg: `white`,
      p: 5,
      margin: `0 auto`,
      width: `8.5rem`,
      height: `8.5rem`,
    }}
  >
    <img
      src={logo}
      sx={{
        display: `inline-block`,
        height: [t => t.space[8], null, null, null, t => t.space[9]],
        margin: 0,
        verticalAlign: `middle`,
        width: `auto`,
      }}
      alt="Gatsby"
    />
    <ItemDescription>
      <small
        sx={{
          color: `grey.50`,
          display: `block`,
          mt: 2,
          mb: 1,
        }}
      >
        powered by
      </small>
      <span sx={{ color: `gatsby` }}>
        <TechWithIcon icon={GraphQLIcon}>GraphQL</TechWithIcon>
      </span>
    </ItemDescription>
  </div>
)

const Diagram = () => (
  <StaticQuery
    query={graphql`
      query StaticHostsQuery {
        allStaticHostsYaml {
          nodes {
            title
            url
          }
        }
      }
    `}
    render={({ allStaticHostsYaml: { nodes: staticHosts } }) => (
      <section
        sx={{
          width: `100%`,
          p: 8,
          pt: 0,
        }}
      >
        <div
          className="Diagram"
          sx={{
            flex: `1 1 100%`,
            fontFamily: `heading`,
            py: 6,
            textAlign: `center`,
            [mediaQueries.sm]: {
              px: 6,
            },
          }}
        >
          <h1
            sx={{
              fontWeight: `heading`,
              mb: 6,
            }}
          >
            How Gatsby works
          </h1>
          <div sx={{ maxWidth: `30rem`, mt: 0, mx: `auto`, mb: 9 }}>
            <FuturaParagraph>
              Pull data from <em>anywhere</em>
            </FuturaParagraph>
          </div>

          <Segment className="Source">
            <SegmentTitle>Data Sources</SegmentTitle>
            <SourceItems>
              <SourceItem>
                <ItemTitle>CMSs</ItemTitle>
                <ItemDescription>
                  Contentful, Drupal, WordPress, etc.
                </ItemDescription>
              </SourceItem>
              <SourceItem>
                <ItemTitle>Markdown</ItemTitle>
                <ItemDescription>Documentation, Posts, etc.</ItemDescription>
              </SourceItem>
              <SourceItem>
                <ItemTitle>Data</ItemTitle>
                <ItemDescription>
                  APIs, Databases, YAML, JSON, CSV, etc.
                </ItemDescription>
              </SourceItem>
            </SourceItems>
          </Segment>

          <Segment className="Build">
            <VerticalLine />
            <SegmentTitle>Build</SegmentTitle>
            <div
              sx={{
                ...box,
                backgroundColor: `purple.70`,
                backgroundSize: t => `${t.sizes[10]} ${t.sizes[10]}`,
                backgroundImage: t =>
                  `linear-gradient(45deg, ${t.colors.purple[80]} 25%, transparent 25%, transparent 50%, ${t.colors.purple[80]} 50%, ${t.colors.purple[80]} 75%, transparent 75%, transparent)`,
                py: 0,
              }}
            >
              <VerticalLine />
              <Gatsby />
              <VerticalLine />
              <div
                sx={{
                  ...borderAndBoxShadow,
                  ...boxPadding,
                  bg: `white`,
                  display: `inline-block`,
                  py: 3,
                  width: `auto`,
                }}
              >
                <ItemDescription color="grey.50">
                  HTML &middot; CSS &middot;
                  {` `}
                  <TechWithIcon icon={ReactJSIcon} height="1.1em">
                    React
                  </TechWithIcon>
                </ItemDescription>
              </div>
              <VerticalLine />
            </div>
          </Segment>

          <Segment className="Deploy">
            <VerticalLine />
            <SegmentTitle>Deploy</SegmentTitle>
            <div
              sx={{
                ...box,
                pb: 5,
              }}
            >
              <ItemTitle>Web Hosting</ItemTitle>
              <ItemDescription>
                {staticHosts.map((staticHost, index) => (
                  <Fragment key={staticHost.url}>
                    {index > 0 && `, `}
                    <ItemDescriptionLink to={staticHost.url}>
                      {staticHost.title}
                    </ItemDescriptionLink>
                  </Fragment>
                ))}
                {` `}& many more
              </ItemDescription>
            </div>
          </Segment>
        </div>
      </section>
    )}
  />
)

export default Diagram
