import React, { Fragment } from "react"
import { keyframes } from "@emotion/core"
import { Link, StaticQuery, graphql } from "gatsby"

import { rhythm } from "../utils/typography"
import {
  colors,
  space,
  radii,
  shadows,
  mediaQueries,
  letterSpacings,
  lineHeights,
  fontSizes,
  fonts,
  fontWeights,
} from "../utils/presets"
import logo from "../assets/monogram.svg"
import { GraphQLIcon, ReactJSIcon } from "../assets/tech-logos"
import FuturaParagraph from "../components/futura-paragraph"
import TechWithIcon from "../components/tech-with-icon"

const stripeColor = colors.purple[70]
const stripeSize = 15
const stripeBg = {
  backgroundColor: colors.purple[80],
  backgroundSize: `${rhythm(stripeSize)} ${rhythm(stripeSize)}`,
  backgroundImage: `linear-gradient(45deg, ${stripeColor} 25%, transparent 25%, transparent 50%, ${stripeColor} 50%, ${stripeColor} 75%, transparent 75%, transparent)`,
}
const lineAnimation = keyframes({
  to: { strokeDashoffset: 10 },
})

const Segment = ({ className, children }) => (
  <div
    className={`Segment ${className}`}
    css={{
      maxWidth: rhythm(32),
      margin: `0 auto`,
      textAlign: `center`,
    }}
  >
    {children}
  </div>
)

const SegmentTitle = ({ children }) => (
  <h2
    className="Segment-title"
    css={{
      display: `inline`,
      background: colors.accent,
      borderRadius: radii[1],
      margin: `0 auto`,
      position: `relative`,
      bottom: `-${space[2]}`,
      padding: `${space[2]} ${space[3]}`,
      fontWeight: `normal`,
      letterSpacing: letterSpacings.tracked,
      fontSize: fontSizes[1],
      lineHeight: lineHeights.solid,
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
      css={{
        stroke: colors.lilac,
        strokeWidth: `3`,
        strokeLinecap: `round`,
        strokeDasharray: `0.5 10`,
        animation: `${lineAnimation} 400ms linear infinite`,
      }}
    />
  </svg>
)

const box = {
  border: `1px solid ${colors.purple[10]}`,
  borderRadius: radii[2],
  padding: `${space[5]} ${space[7]} 0`,
}

const borderAndBoxShadow = {
  background: colors.white,
  border: 0,
  borderRadius: radii[1],
  boxShadow: shadows.raised,
  transform: `translateZ(0)`,
  width: `100%`,
}

const SourceItems = ({ children }) => (
  <div
    css={{
      display: `flex`,
      flexWrap: `wrap`,
      justifyContent: `center`,
      ...box,
    }}
  >
    {children}
  </div>
)

const boxPadding = { padding: `${space[3]} ${space[4]}` }

const SourceItem = ({ children }) => (
  <div
    css={{
      boxSizing: `border-box`,
      padding: `0 ${space[4]} ${space[5]}`,
      display: `flex`,
      [mediaQueries.xs]: {
        flex: `1 1 50%`,
      },
      [mediaQueries.sm]: {
        flex: `1 1 33%`,
        maxWidth: `33%`,
      },
    }}
  >
    <div
      css={{
        ...borderAndBoxShadow,
        ...boxPadding,
        lineHeight: lineHeights.dense,
        textAlign: `left`,
      }}
    >
      {children}
    </div>
  </div>
)

const ItemTitle = ({ children }) => (
  <h3
    css={{
      fontSize: fontSizes[2],
      margin: 0,
    }}
  >
    {children}
  </h3>
)

const ItemDescription = ({ children }) => (
  <small
    css={{
      lineHeight: lineHeights.dense,
      display: `block`,
      color: colors.text.secondary,
      fontSize: fontSizes[1],
      fontFamily: fonts.system,
    }}
  >
    {children}
  </small>
)

const ItemDescriptionLink = ({ to, children }) => (
  <Link
    css={{
      "&&": {
        color: colors.purple[80],
      },
    }}
    to={to}
  >
    {children}
  </Link>
)

const Gatsby = () => (
  <div
    css={{
      ...borderAndBoxShadow,
      padding: space[5],
      margin: `0 auto`,
      width: rhythm(5.5),
      height: rhythm(5.5),
      [mediaQueries.lg]: {
        width: rhythm(6),
        height: rhythm(6),
      },
    }}
  >
    <img
      src={logo}
      css={{
        display: `inline-block`,
        height: space[8],
        margin: 0,
        verticalAlign: `middle`,
        width: `auto`,
        [mediaQueries.lg]: {
          height: space[9],
        },
      }}
      alt="Gatsby"
    />
    <ItemDescription>
      <small
        css={{
          marginTop: space[1],
          display: `block`,
        }}
      >
        powered by
      </small>
      <span css={{ color: colors.gatsby }}>
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
          edges {
            node {
              title
              url
            }
          }
        }
      }
    `}
    render={({ allStaticHostsYaml: { edges: staticHosts } }) => (
      <section
        className="Diagram"
        css={{
          fontFamily: fonts.header,
          padding: space[6],
          textAlign: `center`,
          flex: `1 1 100%`,
        }}
      >
        <h1
          css={{
            fontWeight: fontWeights[1],
            marginTop: 0,
            marginBottom: space[6],
            [mediaQueries.md]: {
              marginTop: space[6],
            },
          }}
        >
          How Gatsby works
        </h1>
        <div css={{ maxWidth: rhythm(20), margin: `0 auto ${space[9]}` }}>
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
            css={{
              ...box,
              ...stripeBg,
              paddingTop: 0,
              paddingBottom: 0,
            }}
          >
            <VerticalLine />
            <Gatsby />
            <VerticalLine />
            <div
              css={{
                ...borderAndBoxShadow,
                ...boxPadding,
                paddingTop: space[3],
                paddingBottom: space[3],
                width: `auto`,
                display: `inline-block`,
              }}
            >
              <ItemDescription>
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
            css={{
              ...box,
              paddingBottom: space[5],
            }}
          >
            <ItemTitle>Static Web Host</ItemTitle>
            <ItemDescription>
              {staticHosts.map(({ node: staticHost }, index) => (
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
      </section>
    )}
  />
)

export default Diagram
