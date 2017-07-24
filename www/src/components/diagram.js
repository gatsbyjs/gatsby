import { rhythm, scale, options } from "../utils/typography"
import presets from "../utils/presets"
import { StaticWebHostIcon, GraphQLIcon, ReactJSIcon } from "../assets/logos"
import logo from "../gatsby-negative.svg"
import { css, after } from "glamor"

const bgAnim = css.keyframes({
  "0%": { backgroundPosition: `0 0` },
  "100%": { backgroundPosition: `240px 480px` },
})
const stripeColor = `249, 245, 255, 0.75`

const vP = rhythm(presets.vPR)
const vPHd = rhythm(presets.vPHdR)
const vPVHd = rhythm(presets.vPVHdR)
const vPVVHd = rhythm(presets.vPVVHdR)

const labelColor = presets.accent
const labelBorderColor = presets.lightPurple
const labelBorderWidth = `1px`
const labelBorderStyle = `dotted`

const con = { maxWidth: rhythm(30), margin: `0 auto` }

const label = {
  display: `inline`,
  background: labelColor,
  color: `white`,
  borderRadius: presets.radius,
  textAlign: `left`,
  margin: `0 auto`,
  position: `relative`,
  bottom: `-.5rem`,
  padding: `.35rem .6rem`,
  fontWeight: `normal`,
  letterSpacing: `.5px`,
  ...scale(-2 / 5),
  lineHeight: 1,
  textTransform: `uppercase`,
}

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

const stepContainer = {
  border: `${labelBorderWidth} ${labelBorderStyle} ${labelBorderColor}`,
  borderRadius: presets.radiusLg,
  padding: `${rhythm(1)} ${rhythm(1)} 0`,
  //background: presets.heroBright,
}

const borderAndBoxShadow = {
  border: `1px solid ${presets.veryLightPurple}`,
  background: `white`,
  width: `100%`,
  boxShadow: `0 5px 15px rgba(0,0,0,0.035)`,
  borderRadius: presets.radius,
}

const dataSourceItems = {
  display: `flex`,
  flexWrap: `wrap`,
  justifyContent: `space-around`,
  ...stepContainer,
}

const dataSourceItemContainer = {
  boxSizing: `border-box`,
  padding: `0 .8rem ${rhythm(1)}`,
  display: `flex`,
  flex: `1 1 33%`,
}

const dataSourceItemContainerBig = {
  // flexBasis: `50%`,
  // maxWidth: `320px`,
}

const dataSourceItem = {
  ...borderAndBoxShadow,
  padding: `.5rem .8rem`,
  lineHeight: 1.2,
  color: presets.heroMid,
  textAlign: `left`,
}

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
  <div
    css={{
      background: presets.sidebar,
      borderRadius: presets.radiusLg,
      padding: vP,
      textAlign: `center`,
      fontFamily: options.headerFontFamily.join(`,`),
      ...containerCSS,
    }}
  >
    <h1
      css={{
        marginBottom: `1em`,
        color: presets.brand,
      }}
    >
      How Gatsby works
    </h1>
    <p css={{ maxWidth: `480px`, margin: `0 auto` }}>
      Some supporting text here how anything is possible with Gatsby – maybe
      mention (source) plugins somehow?
    </p>
    <div css={con}>
      <div css={{ marginTop: `3rem` }}>
        <h2 css={label}>Data Sources</h2>
      </div>
      <div css={dataSourceItems}>
        <div css={dataSourceItemContainer}>
          <div css={dataSourceItem}>
            <h3 css={dataSourceItemHeadline}>Markdown</h3>
            <small css={{ lineHeight: 1.2, display: `block` }}>
              Documentation, Posts, etc.
            </small>
          </div>
        </div>
        <div
          css={{ ...dataSourceItemContainer, ...dataSourceItemContainerBig }}
        >
          <div css={dataSourceItem}>
            <h3 css={dataSourceItemHeadline}>APIs</h3>
            <small css={{ lineHeight: 1.2, display: `block` }}>
              Contentful, Drupal, Wordpress & more
            </small>
          </div>
        </div>
        <div css={dataSourceItemContainer}>
          <div css={dataSourceItem}>
            <h3 css={dataSourceItemHeadline}>YAML/JSON</h3>
            <small css={{ lineHeight: 1.2, display: `block` }}>
              Any Data you can think of…
            </small>
          </div>
        </div>
      </div>
    </div>
    <VerticalLine />
    <div css={{ ...con, textAlign: `center` }}>
      <h2 css={label}>Build</h2>
      <div
        css={{
          ...stepContainer,
          paddingTop: 0,
          paddingBottom: 0,
          backgroundColor: presets.sidebar,
          backgroundSize: `240px 240px`,
          backgroundImage: `linear-gradient(45deg, rgba(${stripeColor}) 25%, transparent 25%, transparent 50%, rgba(${stripeColor}) 50%, rgba(${stripeColor}) 75%, transparent 75%, transparent)`,
          color: `white`,
          animation: `${bgAnim} 20s linear infinite`,
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
    </div>
    <div
      css={{
        ...con,
      }}
    >
      <VerticalLine />
      <h2 css={label}>Deploy</h2>
      <div
        css={{
          ...stepContainer,
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
    </div>
  </div>

export default Diagram
