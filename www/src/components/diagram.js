import { css } from "glamor"

import { rhythm, scale, options } from "../utils/typography"
import presets from "../utils/presets"
import logo from "../gatsby-negative.svg"
import { StaticWebHostIcon, GraphQLIcon, ReactJSIcon } from "../assets/logos"

const vP = rhythm(presets.vPR)
const vPHd = rhythm(presets.vPHdR)
const vPVHd = rhythm(presets.vPVHdR)
const vPVVHd = rhythm(presets.vPVVHdR)

const labelColor = presets.accent
const labelBorderColor = presets.lightPurple
const labelBorderWidth = `1px`
const labelBorderStyle = `dotted`

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
      background: labelColor,
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
  <div
    css={{
      width: labelBorderWidth,
      borderLeft: `${labelBorderWidth} ${labelBorderStyle} ${labelBorderColor}`,
      borderTop: `1px solid transparent`,
      borderBottom: `1px solid transparent`,
      height: rhythm(1),
      margin: `0 auto`,
    }}
  />

const box = {
  border: `${labelBorderWidth} ${labelBorderStyle} ${labelBorderColor}`,
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
      justifyContent: `space-around`,
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
      flex: `1 1 33%`,
    }}
  >
    <div
      css={{
        ...borderAndBoxShadow,
        padding: `.5rem .8rem`,
        lineHeight: 1.2,
        color: presets.heroMid,
        textAlign: `left`,
      }}
    >
      {children}
    </div>
  </div>

const dataSourceItemHeadline = {
  color: presets.brand,
  margin: 0,
  fontStyle: `normal`,
  ...scale(0),
}

const deploy = {
  ...borderAndBoxShadow,
  borderRadius: `100%`,
  height: `60px`,
  width: `60px`,
  margin: `0 auto`,
  display: `flex`,
  justifyContent: `center`,
  alignItems: `center`,
}

const Diagram = ({ containerCSS }) =>
  <section
    className="Diagram"
    css={{
      borderRadius: presets.radiusLg,
      fontFamily: options.headerFontFamily.join(`,`),
      padding: vP,
      textAlign: `center`,
      ...containerCSS,
    }}
  >
    <h1 css={{ marginBottom: `1em`, ...scale(0.9) }}>How Gatsby works</h1>
    <p css={{ maxWidth: `480px`, margin: `0 auto 3rem` }}>
      Some supporting text here how anything is possible with Gatsby – maybe
      mention (source) plugins somehow?
    </p>

    <Segment className="Source">
      <SegmentTitle>Data Sources</SegmentTitle>
      <SourceItems>
        <SourceItem>
          <h3 css={dataSourceItemHeadline}>Markdown</h3>
          <small css={{ lineHeight: 1.2, display: `block` }}>
            Documentation, Posts, etc.
          </small>
        </SourceItem>
        <SourceItem>
          <h3 css={dataSourceItemHeadline}>APIs</h3>
          <small css={{ lineHeight: 1.2, display: `block` }}>
            Contentful, Drupal, Wordpress & more
          </small>
        </SourceItem>
        <SourceItem>
          <h3 css={dataSourceItemHeadline}>YAML/JSON</h3>
          <small css={{ lineHeight: 1.2, display: `block` }}>
            Any Data you can think of…
          </small>
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
        <div
          css={{
            ...borderAndBoxShadow,
            padding: `1rem`,
            margin: `0 auto`,
            width: `6.5rem`,
            height: `6.5rem`,
          }}
        >
          <img
            src={logo}
            css={{
              display: `inline-block`,
              height: rhythm(1.6),
              width: rhythm(1.6),
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
            <span css={{ color: presets.heroMid }}>powered by</span>
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
        <VerticalLine />
        <small
          css={{
            ...borderAndBoxShadow,
            width: `auto`,
            padding: `1rem`,
            lineHeight: 1,
            display: `inline-block`,
            color: presets.heroMid,
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
          paddingTop: 0,
          paddingBottom: rhythm(1),
        }}
      >
        <VerticalLine />
        <div css={deploy}>
          <img
            src={StaticWebHostIcon}
            css={{
              height: `60%`,
              width: `auto`,
              margin: 0,
            }}
          />
        </div>
        <h3
          css={{
            fontStyle: `normal`,
            ...scale(0),
            marginTop: rhythm(1 / 3),
            marginBottom: 0,
            color: presets.brand,
          }}
        >
          Static Web Host
        </h3>
        <small
          css={{
            color: presets.heroMid,
            lineHeight: 1.2,
            display: `block`,
          }}
        >
          Self-hosted or Amazon S3, Netlify, Github Pages, Surge.sh, Aerobatic…
        </small>
      </div>
    </Segment>
  </section>

export default Diagram
