import typography, { options, rhythm, scale } from "../../utils/typography"
import presets, { colors } from "../../utils/presets"
import hex2rgba from "hex2rgba"

const { curveDefault, speedDefault } = presets.animation

const styles = {
  featuredSitesCard: {
    display: `flex`,
    flexDirection: `column`,
    flexGrow: 0,
    flexShrink: 0,
    width: 320,
    marginBottom: rhythm(options.blockMarginBottom * 2),
    marginRight: rhythm(3 / 4),
    [presets.Hd]: {
      width: 360,
      marginRight: rhythm(6 / 4),
    },
    [presets.VHd]: {
      width: 400,
    },
  },
  showcaseList: {
    display: `flex`,
    flexWrap: `wrap`,
    padding: rhythm(3 / 4),
    justifyContent: `space-evenly`,
  },
  showcaseItem: {
    display: `flex`,
    flexDirection: `column`,
    margin: rhythm(3 / 4),
    minWidth: 259, //shows 3 items/row on windows > 1200px wide
    maxWidth: 350,
    flex: `1 0 0`,
    position: `relative`,
  },
  featuredItem: {
    display: `none`,
    transition: `background .3s cubic-bezier(.4,0,.2,1), transform .3s cubic-bezier(.4,0,.2,1)`,
    [presets.Desktop]: {
      alignItems: `center`,
      background: colors.accent,
      border: `none`,
      borderTopRightRadius: presets.radius,
      borderBottomLeftRadius: presets.radius,
      boxShadow: `none`,
      cursor: `pointer`,
      display: `flex`,
      height: 24,
      margin: 0,
      padding: 0,
      position: `absolute`,
      top: 0,
      right: 0,
      width: 24,
      "&:hover": {
        background: colors.gatsby,
      },
    },
  },
  featuredIcon: {
    margin: `0 auto`,
    display: `block`,
  },
  withTitleHover: {
    "& .title": {
      transition: `box-shadow .3s cubic-bezier(.4,0,.2,1), transform .3s cubic-bezier(.4,0,.2,1)`,
      boxShadow: `inset 0 0px 0px 0px ${colors.ui.whisper}`,
    },
    "&:hover .title": {
      boxShadow: `inset 0 -3px 0px 0px ${colors.ui.bright}`,
    },
  },
  loadMoreButton: {
    alignItems: `center`,
    display: `flex`,
    flexFlow: `row wrap`,
    margin: `0 auto ${rhythm(3)}`,
    [presets.Desktop]: {
      margin: `0 auto ${rhythm(2 / 2)}`,
    },
  },
  sticky: {
    position: `sticky`,
    // We need the -1px here to work around a weird issue on Chrome
    // where the sticky element is consistently positioned 1px too far down,
    // leaving a nasty gap that the page content peeks through.
    // FWIW the problem is only present on the "Site Showcase" index page,
    // not the "Starter Showcase" index page; if the "Featured Sites" block
    // is removed, the problem goes away. I tried removing elements in the
    // "Featured Sites" content block, but no success—only removing the entire block
    // resolves the issue.
    top: `calc(${presets.bannerHeight} - 1px)`,
    [presets.Desktop]: {
      top: `calc(${presets.headerHeight} + ${presets.bannerHeight} - 1px)`,
    },
  },
  scrollbar: {
    WebkitOverflowScrolling: `touch`,
    "&::-webkit-scrollbar": {
      width: `6px`,
      height: `6px`,
    },
    "&::-webkit-scrollbar-thumb": {
      background: colors.ui.bright,
    },
    "&::-webkit-scrollbar-track": {
      background: colors.ui.whisper,
    },
  },
  screenshot: {
    borderRadius: presets.radius,
    boxShadow: `0 4px 10px ${hex2rgba(colors.gatsby, 0.1)}`,
    marginBottom: rhythm(options.blockMarginBottom / 2),
    transition: `all ${presets.animation.speedDefault} ${
      presets.animation.curveDefault
    }`,
  },
  screenshotHover: {
    background: `transparent`,
    color: colors.gatsby,
    "& .gatsby-image-wrapper": {
      transform: `translateY(-3px)`,
      boxShadow: `0 8px 20px ${hex2rgba(colors.lilac, 0.5)}`,
    },
  },
  shortcutIcon: {
    paddingLeft: rhythm(1 / 8),
    "&&": {
      color: colors.gray.bright,
      fontWeight: `normal`,
      borderBottom: `none`,
      boxShadow: `none`,
      "&:hover": {
        background: `none`,
        color: colors.gatsby,
      },
    },
  },
  meta: {
    ...scale(-1 / 4),
    alignItems: `baseline`,
    "&&": {
      color: colors.gray.bright,
    },
  },
  searchInput: {
    appearance: `none`,
    backgroundColor: `transparent`,
    border: 0,
    borderRadius: presets.radiusLg,
    color: colors.gatsby,
    paddingTop: rhythm(1 / 8),
    paddingRight: rhythm(1 / 4),
    paddingBottom: rhythm(1 / 8),
    paddingLeft: rhythm(1),
    overflow: `hidden`,
    fontFamily: typography.options.headerFontFamily.join(`,`),
    transition: `width ${speedDefault} ${curveDefault}, background-color ${speedDefault} ${curveDefault}`,
    width: `6.8rem`,
    "&::placeholder": {
      color: colors.lilac,
    },
    "&:focus": {
      outline: `none`,
      width: `9rem`,
      background: colors.ui.light,
    },
  },
  filterButton: {
    ...scale(-2 / 10),
    [presets.Tablet]: {
      ...scale(-4 / 10),
    },
    margin: 0,
    alignItems: `flex-start`,
    background: `none`,
    border: `none`,
    color: colors.gray.text,
    cursor: `pointer`,
    display: `flex`,
    fontFamily: options.systemFontFamily.join(`,`),
    justifyContent: `space-between`,
    outline: `none`,
    padding: 0,
    paddingRight: rhythm(1),
    paddingBottom: rhythm(options.blockMarginBottom / 8),
    paddingTop: rhythm(options.blockMarginBottom / 8),
    width: `100%`,
    textAlign: `left`,
    ":hover": {
      color: colors.gatsby,
    },
  },
  filterCount: {
    color: colors.gray.bright,
  },
  sidebarHeader: {
    margin: 0,
    [presets.Desktop]: {
      ...scale(1 / 8),
      // display: `flex`,
      display: `none`,
      borderBottom: `1px solid ${colors.ui.light}`,
      color: colors.gray.calm,
      fontWeight: `normal`,
      flexShrink: 0,
      lineHeight: 1,
      height: presets.headerHeight,
      margin: 0,
      paddingLeft: rhythm(3 / 4),
      paddingRight: rhythm(3 / 4),
      paddingTop: rhythm(options.blockMarginBottom),
      paddingBottom: rhythm(options.blockMarginBottom),
    },
  },
  sidebarBody: {
    paddingLeft: rhythm(3 / 4),
    height: `calc(100vh - ((${presets.headerHeight}) + ${
      presets.bannerHeight
    }))`,
    display: `flex`,
    flexDirection: `column`,
  },
  sidebarContainer: {
    display: `none`,
    [presets.Desktop]: {
      // background: colors.ui.whisper,
      display: `block`,
      flexBasis: `15rem`,
      minWidth: `15rem`,
      paddingTop: 0,
      borderRight: `1px solid ${colors.ui.light}`,
      height: `calc(100vh - (${presets.headerHeight} + ${
        presets.bannerHeight
      }))`,
    },
  },
  contentHeader: {
    alignItems: `center`,
    background: `rgba(255,255,255,0.98)`,
    // background: colors.ui.whisper,
    borderBottom: `1px solid ${colors.ui.light}`,
    display: `flex`,
    flexDirection: `row`,
    flexWrap: `wrap`,
    height: presets.headerHeight,
    justifyContent: `space-between`,
    paddingLeft: `${rhythm(3 / 4)}`,
    paddingRight: `${rhythm(3 / 4)}`,
    zIndex: 1,
  },
  contentTitle: {
    color: colors.gatsby,
    margin: 0,
    ...scale(1 / 5),
    lineHeight: 1,
  },
  resultCount: {
    color: colors.lilac,
    fontWeight: `normal`,
  },
  gutter: rhythm(3 / 4),
  gutterDesktop: rhythm(6 / 4),
}

export default styles
