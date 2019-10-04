import React from "react"
import { Link } from "gatsby"
import {
  BlogIcon,
  DocsIcon,
  TutorialIcon,
  PluginsIcon,
  ShowcaseIcon,
  SvgDefs,
} from "../assets/icons"
import {
  colors,
  transition,
  radii,
  space,
  mediaQueries,
  sizes,
  fontSizes,
  lineHeights,
  fonts,
  zIndices,
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
        zIndex: zIndices.navigation,
        borderTop: `1px solid ${colors.ui.border.subtle}`,
        background: colors.white,
        height: sizes.headerHeight,
        fontFamily: fonts.header,
        paddingBottom: `env(safe-area-inset-bottom)`,
        [mediaQueries.md]: {
          display: `none`,
        },
      }}
    >
      <MobileNavItem linkTo="/docs/" label="Docs" icon={DocsIcon} />
      <MobileNavItem
        linkTo="/tutorial/"
        label="Tutorials"
        icon={TutorialIcon}
      />
      <MobileNavItem linkTo="/plugins/" label="Plugins" icon={PluginsIcon} />
      <MobileNavItem linkTo="/blog/" label="Blog" icon={BlogIcon} />
      <MobileNavItem linkTo="/showcase/" label="Showcase" icon={ShowcaseIcon} />
    </div>
  </>
)

export default MobileNavigation

const styles = {
  svg: {
    default: {
      ...svgStyles.stroke,
      ...svgStyles.default,
      "&:hover": { ...svgStyles.active },
    },
    active: svgStyles.active,
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
