import React from "react"
import { Link } from "gatsby"
import SvgDefs from "../assets/svg-defs"
import {
  BlogIcon,
  DocsIcon,
  TutorialIcon,
  PluginsIcon,
  ShowcaseIcon,
} from "../assets/mobile-nav-icons"
import {
  colors,
  transition,
  radii,
  space,
  breakpoints,
  sizes,
  fontSizes,
  lineHeights,
  fonts,
} from "../utils/presets"
import { svgStyles } from "../utils/styles"

const getProps = ({ isPartiallyCurrent }) => {
  return {
    ...(isPartiallyCurrent
      ? {
          "data-active": true,
        }
      : {}),
  }
}

const MobileNavItem = ({ linkTo, label, icon }) => (
  <Link
    css={{
      ...styles.link.default,
      ...styles.svg.default,
      "&[data-active]": {
        ...styles.link.active,
        ...styles.svg.active,
      },
    }}
    getProps={getProps}
    to={linkTo}
  >
    <span dangerouslySetInnerHTML={{ __html: icon }} />
    <div>{label}</div>
  </Link>
)

const MobileNavigation = () => (
  <>
    <span
      css={{
        position: `absolute`,
        width: 1,
        height: 1,
        padding: 0,
        overflow: `hidden`,
        clip: `rect(0,0,0,0)`,
        whiteSpace: `nowrap`,
        border: 0,
      }}
    >
      <SvgDefs />
    </span>
    <div
      css={{
        position: `fixed`,
        display: `flex`,
        justifyContent: `space-around`,
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1,
        borderTop: `1px solid ${colors.ui.light}`,
        background: colors.white,
        height: sizes.headerHeight,
        fontFamily: fonts.header,
        paddingBottom: `env(safe-area-inset-bottom)`,
        [breakpoints.md]: {
          display: `none`,
        },
      }}
    >
      <MobileNavItem linkTo="/docs/" label="Docs" icon={DocsIcon} />
      <MobileNavItem linkTo="/tutorial/" label="Tutorial" icon={TutorialIcon} />
      <MobileNavItem linkTo="/plugins/" label="Plugins" icon={PluginsIcon} />
      <MobileNavItem linkTo="/blog/" label="Blog" icon={BlogIcon} />
      <MobileNavItem linkTo="/showcase/" label="Showcase" icon={ShowcaseIcon} />
    </div>
  </>
)

export default MobileNavigation

const svgActive = {
  ...svgStyles.active,
}

const styles = {
  svg: {
    default: {
      "& .svg-stroke": {
        strokeMiterlimit: 10,
        strokeWidth: 1.4173,
      },
      "& .svg-stroke-accent": { stroke: colors.lavender },
      "& .svg-stroke-lilac": { stroke: colors.lavender },
      "& .svg-fill-lilac": { fill: colors.lavender },
      "& .svg-fill-gatsby": { fill: colors.lavender },
      "& .svg-fill-brightest": { fill: colors.white },
      "& .svg-fill-accent": { fill: colors.lavender },
      "& .svg-stroke-gatsby": { stroke: colors.lavender },
      "& .svg-fill-gradient-accent-white-top": { fill: `transparent` },
      "& .svg-fill-gradient-accent-white-45deg": { fill: `transparent` },
      "& .svg-fill-gradient-accent-white-bottom": { fill: colors.white },
      "& .svg-fill-gradient-purple": { fill: colors.lavender },
      "& .svg-stroke-gradient-purple": { stroke: colors.lavender },
      "& .svg-fill-wisteria": { fill: `transparent` },
      "&:hover": { ...svgActive },
    },
    active: svgActive,
  },
  link: {
    default: {
      color: colors.lilac,
      borderRadius: radii[1],
      fontSize: fontSizes[0],
      flexShrink: 0,
      lineHeight: lineHeights.solid,
      width: 64,
      padding: space[1],
      textDecoration: `none`,
      textAlign: `center`,
      WebkitFontSmoothing: `antialiased`,
      "& svg": {
        display: `block`,
        height: 32,
        margin: `0 auto`,
        "& path, & line, & polygon": {
          transition: `all ${transition.speed.default} ${
            transition.curve.default
          }`,
        },
      },
    },
    active: {
      color: colors.gatsby,
      fontWeight: `bold`,
    },
  },
}
