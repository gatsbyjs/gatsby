/** @jsx jsx */
import { jsx } from "theme-ui"
import { Fragment } from "react"
import { keyframes } from "@emotion/core"
import { Link, StaticQuery, graphql } from "gatsby"

import logo from "../assets/monogram.svg"
import { GraphQLIcon, ReactJSIcon } from "../assets/tech-logos"
import TechWithIcon from "../components/tech-with-icon"

const lineAnimation = keyframes({
  "0%": { transform: `translateX(-8px)` },
  "100%": { transform: `translateX(4px)` },
})

const box = {
  borderColor: `ui.border`,
  borderRadius: 2,
  bg: `ui.background`,
  borderStyle: `solid`,
  borderWidth: `1px`,
  px: 7,
  py: 5,
}

const Segment = ({ className, children, customCSS }) => (
  <div
    className={`Segment ${className}`}
    sx={{
      mx: `auto`,
      maxWidth: `48rem`,
      textAlign: `center`,
      ...box,
      ...customCSS,
    }}
  >
    {children}
  </div>
)

const SegmentTitle = ({ children }) => (
  <h2
    className="Segment-title"
    sx={{
      bg: `background`,
      borderColor: `ui.border`,
      borderRadius: 1,
      borderStyle: `solid`,
      borderWidth: 1,
      bottom: t => `-${t.space[2]}`,
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
      top: t => `-${t.space[7]}`,
    }}
  >
    {children}
  </h2>
)

const dot = {
  animation: `${lineAnimation} .5s linear infinite`,
  backgroundColor: `gatsby`,
  borderRadius: 5,
  display: `inline-block`,
  height: t => t.space[1],
  margin: 1,
  width: t => t.space[1],
}

const DottedLine = () => (
  <div
    sx={{
      lineHeight: 0,
      overflow: `hidden`,
      whiteSpace: `nowrap`,
      width: 44,
      marginLeft: [1, null, null, 0],
      // transformOrigin: `0 0`,
      // transform: [`rotate(90deg)`, null, null, `none`],
    }}
  >
    <div sx={dot}></div>
    <div sx={dot}></div>
    <div sx={dot}></div>
    <div sx={dot}></div>
  </div>
)

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
      maxWidth: [null, null, null],
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
      fontFamily: `system`,
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
      width: `9rem`,
      height: `9rem`,
    }}
  >
    <img
      src={logo}
      sx={{
        display: `inline-block`,
        height: t => t.space[10],
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

const Diagram = ({ customCSS }) => (
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
        sx={{
          py: 12,
          px: [6, null, null, 12],
          mt: [null, null, null, `-120px`],
          mb: 12,
          position: `relative`,
          zIndex: 0,
          ...customCSS,
        }}
      >
        <h1
          sx={{
            mb: 0,
            fontSize: 6,
            fontWeight: `heading`,
            lineHeight: `solid`,
            // background: `#f00`,
          }}
        >
          How Gatsby works
        </h1>
        <div
          sx={{
            fontFamily: `header`,
            fontSize: 5,
            mt: 0,
            mb: 9,
          }}
        >
          Pull data from <em>anywhere</em>
        </div>

        <div
          sx={{
            display: `grid`,
            width: `100%`,
            gridGap: 6,
            gridTemplateColumns: [
              `repeat(1,1fr)`,
              null,
              null,
              null,
              `repeat(auto-fit,minmax(26%,1fr))`,
            ],
            pt: 8,
            // background: `#ff0`,
          }}
        >
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

          <Segment
            className="Build"
            customCSS={{
              ...box,
              backgroundColor: `purple.70`,
              backgroundSize: t => `${t.sizes[10]} ${t.sizes[10]}`,
              backgroundImage: t =>
                `linear-gradient(45deg, ${
                  t.colors.purple[80]
                } 25%, transparent 25%, transparent 50%, ${
                  t.colors.purple[80]
                } 50%, ${
                  t.colors.purple[80]
                } 75%, transparent 75%, transparent)`,
              py: 0,
            }}
          >
            <DottedLine />
            <SegmentTitle>Build</SegmentTitle>
            <DottedLine />
            <Gatsby />
            <DottedLine />
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
            <DottedLine />
          </Segment>

          <Segment className="Deploy">
            <DottedLine />
            <SegmentTitle>Deploy</SegmentTitle>
            <div sx={{ pb: 5 }}>
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
        </div>
      </section>
    )}
  />
)

export default Diagram
