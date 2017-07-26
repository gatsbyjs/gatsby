import React from "react"
import { css } from "glamor"

import { rhythm, scale, options } from "../utils/typography"
import presets from "../utils/presets"
import logo from "../gatsby-negative.svg"
import { GraphQLIcon, ReactJSIcon } from "../assets/logos"
import { vP, vPHd, vPVHd, vPVVHd } from "../components/gutters"

const stripeColor = `249, 245, 255, 1`
const stripeSize = 15
const stripeAnimation = css.keyframes({
  "0%": {
    backgroundPosition: `${rhythm(stripeSize)} ${rhythm(stripeSize * 2)}`,
  },
  "100%": { backgroundPosition: `0 0` },
})
const stripeBg = {
  backgroundColor: presets.sidebar,
  backgroundSize: `${rhythm(stripeSize)} ${rhythm(stripeSize)}`,
  backgroundImage: `linear-gradient(45deg, rgba(${stripeColor}) 25%, transparent 25%, transparent 50%, rgba(${stripeColor}) 50%, rgba(${stripeColor}) 75%, transparent 75%, transparent)`,
  animation: `${stripeAnimation} 14s linear infinite`,
}
const lineAnimation = css.keyframes({
  to: {
    strokeDashoffset: 1000,
  },
})

const Segment = ({ className, children }) =>
  <div
    className={`Segment ${className}`}
    css={{
      maxWidth: rhythm(30),
      margin: `0 auto`,
      textAlign: `center`,
    }}
  >
    {children}
  </div>

const SegmentTitle = ({ children }) =>
  <h2
    className="Segment-title"
    css={{
      display: `inline`,
      background: presets.accent,
      color: `#fff`,
      borderRadius: presets.radius,
      margin: `0 auto`,
      position: `relative`,
      bottom: `-.5rem`,
      padding: `.35rem .6rem`,
      fontWeight: `normal`,
      letterSpacing: `.5px`,
      ...scale(-2 / 5),
      lineHeight: 1,
      textTransform: `uppercase`,
    }}
  >
    {children}
  </h2>

const VerticalLine = () =>
  <svg
    width="20"
    height="30"
    viewBox="0 0 20 30"
    css={{ margin: `0 auto`, display: `block` }}
  >
    <line
      className="path"
      x1="10"
      x2="10"
      y1="110"
      y2="-10"
      stroke={presets.brandLight}
      strokeWidth="3"
      strokeLinecap="round"
      strokeDasharray="0.5, 10"
      css={{ animation: `${lineAnimation} 40s linear infinite` }}
    />
  </svg>

const box = {
  border: `1px solid #eee2fd`,
  borderRadius: presets.radiusLg,
  padding: `${rhythm(1)} ${rhythm(1)} 0`,
  background: presets.sidebar,
}

const borderAndBoxShadow = {
  border: `1px solid ${presets.veryLightPurple}`,
  background: `#fff`,
  width: `100%`,
  boxShadow: `0 5px 15px rgba(0,0,0,0.035)`,
  borderRadius: presets.radius,
}

const SourceItems = ({ children }) =>
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

const SourceItem = ({ children }) =>
  <div
    css={{
      boxSizing: `border-box`,
      padding: `0 .8rem ${rhythm(1)}`,
      display: `flex`,
      [presets.Mobile]: {
        flex: `1 1 50%`,
      },
      [presets.Phablet]: {
        flex: `1 1 33%`,
      },
    }}
  >
    <div
      css={{
        ...borderAndBoxShadow,
        padding: `.5rem .8rem`,
        lineHeight: 1.2,
        textAlign: `left`,
      }}
    >
      {children}
    </div>
  </div>

const SourceTitle = ({ children }) =>
  <h3
    css={{
      color: presets.brand,
      margin: 0,
      fontStyle: `normal`,
      ...scale(0),
    }}
  >
    {children}
  </h3>

const ItemDescription = ({ children }) =>
  <small
    css={{
      lineHeight: 1.2,
      display: `block`,
      color: presets.brandLight,
    }}
  >
    {children}
  </small>

const Gatsby = ({ children }) =>
  <div
    css={{
      ...borderAndBoxShadow,
      padding: rhythm(1),
      margin: `0 auto`,
      width: rhythm(5.5),
      height: rhythm(5.5),
      [presets.Desktop]: {
        width: rhythm(6),
        height: rhythm(6),
      },
    }}
  >
    <img
      src={logo}
      css={{
        display: `inline-block`,
        height: rhythm(1.75),
        width: rhythm(1.75),
        [presets.Desktop]: {
          width: rhythm(2.25),
          height: rhythm(2.25),
        },
        margin: 0,
        verticalAlign: `middle`,
      }}
    />
    <small
      css={{
        lineHeight: 1.2,
        color: presets.brand,
        display: `block`,
        marginTop: `.25rem`,
      }}
    >
      <span css={{ color: presets.brandLight }}>powered by</span>
      <br />GraphQL{` `}&nbsp;<img
        src={GraphQLIcon}
        css={{
          height: `1.2em`,
          width: `auto`,
          margin: 0,
          verticalAlign: `sub`,
        }}
      />
    </small>
  </div>

const Diagram = ({ containerCSS }) =>
  <section
    className="Diagram"
    css={{
      borderRadius: presets.radiusLg,
      fontFamily: options.headerFontFamily.join(`,`),
      padding: vP,
      marginTop: rhythm(1),
      textAlign: `center`,
      ...containerCSS,
      [presets.Tablet]: {
        marginTop: 0,
      },
    }}
  >
    <h1 css={{ marginBottom: rhythm(1.5), ...scale(0.9) }}>How Gatsby works</h1>
    <p css={{ maxWidth: `480px`, margin: `0 auto ${rhythm(2)}` }}>
      Gatsby lets you build blazing-fast sites with <em>your data</em>, whatever
      the source. Liberate your sites from legacy CMSs and fly into the future.
    </p>

    <Segment className="Source">
      <SegmentTitle>Data Sources</SegmentTitle>
      <SourceItems>
        <SourceItem>
          <SourceTitle>CMSs</SourceTitle>
          <ItemDescription>
            Contentful, Drupal, WordPress & more
          </ItemDescription>
        </SourceItem>
        <SourceItem>
          <SourceTitle>Markdown</SourceTitle>
          <ItemDescription>Documentation, Posts, etc.</ItemDescription>
        </SourceItem>
        <SourceItem>
          <SourceTitle>Data</SourceTitle>
          <ItemDescription>
            APIs, Databases, YAML, JSON, CSV & more
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
        <small
          css={{
            ...borderAndBoxShadow,
            width: `auto`,
            padding: `1rem`,
            lineHeight: 1,
            display: `inline-block`,
            color: presets.brandLight,
          }}
        >
          HTML &middot; CSS &middot; React&nbsp;<img
            src={ReactJSIcon}
            css={{
              height: `1.1em`,
              width: `auto`,
              margin: 0,
              verticalAlign: `sub`,
            }}
          />
        </small>
        <VerticalLine />
      </div>
    </Segment>

    <Segment className="Deploy">
      <VerticalLine />
      <SegmentTitle>Deploy</SegmentTitle>
      <div
        css={{
          ...box,
          paddingTop: rhythm(1),
          paddingBottom: rhythm(1),
        }}
      >
        <h3
          css={{
            fontStyle: `normal`,
            ...scale(0),
            margin: 0,
            color: presets.brand,
          }}
        >
          Static Web Host
        </h3>
        <ItemDescription>
          Amazon S3, Netlify, Github Pages, Surge.sh, Aerobatic, Now.sh…
        </ItemDescription>
      </div>
    </Segment>
  </section>

export default Diagram
