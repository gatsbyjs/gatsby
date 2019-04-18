import {
  colors,
  space,
  radii,
  transition,
  shadows,
  breakpoints,
  sizes,
  fontSizes,
  lineHeights,
  fonts,
} from "../../utils/presets"

const styles = {
  featuredSitesCard: {
    display: `flex`,
    flexDirection: `column`,
    flexGrow: 0,
    flexShrink: 0,
    width: 320,
    marginBottom: space[9],
    marginRight: space[6],
    [breakpoints.xl]: {
      width: 360,
      marginRight: space[8],
    },
    [breakpoints.xxl]: {
      width: 400,
    },
  },
  showcaseList: {
    display: `flex`,
    flexWrap: `wrap`,
    padding: space[6],
    justifyContent: `space-evenly`,
  },
  showcaseItem: {
    display: `flex`,
    flexDirection: `column`,
    margin: space[6],
    minWidth: 259, //shows 3 items/row on windows > 1200px wide
    maxWidth: 350,
    flex: `1 0 0`,
    position: `relative`,
  },
  featuredItem: {
    display: `none`,
    transition: `background ${transition.speed.slow} ${
      transition.curve.default
    }, transform ${transition.speed.slow} ${transition.curve.default}`,
    [breakpoints.lg]: {
      alignItems: `center`,
      background: colors.accent,
      border: `none`,
      borderTopRightRadius: radii[1],
      borderBottomLeftRadius: radii[1],
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
      transition: `box-shadow ${transition.speed.slow} ${
        transition.curve.default
      }, transform ${transition.speed.slow} ${transition.curve.default}`,
    },
    "&:hover .title": {
      boxShadow: `inset 0 -1px 0px 0px ${colors.ui.bright}`,
    },
  },
  loadMoreButton: {
    alignItems: `center`,
    display: `flex`,
    flexFlow: `row wrap`,
    margin: `0 auto ${space[9]}`,
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
    top: `calc(${sizes.bannerHeight} - 1px)`,
    [breakpoints.lg]: {
      top: `calc(${sizes.headerHeight} + ${sizes.bannerHeight} - 1px)`,
    },
  },
  scrollbar: {
    WebkitOverflowScrolling: `touch`,
    "&::-webkit-scrollbar": {
      width: space[2],
      height: space[2],
    },
    "&::-webkit-scrollbar-thumb": {
      background: colors.ui.bright,
    },
    "&::-webkit-scrollbar-track": {
      background: colors.ui.whisper,
    },
  },
  screenshot: {
    borderRadius: radii[1],
    boxShadow: shadows.raised,
    marginBottom: space[3],
    transition: `all ${transition.speed.default} ${transition.curve.default}`,
  },
  screenshotHover: {
    background: `transparent`,
    color: colors.gatsby,
    "& .gatsby-image-wrapper": {
      transform: `translateY(-${space[1]})`,
      boxShadow: shadows.overlay,
    },
  },
  shortcutIcon: {
    paddingLeft: space[1],
    "&&": {
      color: colors.gray.bright,
      borderBottom: `none`,
      "&:hover": {
        color: colors.gatsby,
      },
    },
  },
  meta: {
    fontSize: fontSizes[1],
    alignItems: `baseline`,
    "&&": {
      color: colors.gray.bright,
    },
  },
  searchInput: {
    appearance: `none`,
    border: 0,
    borderRadius: radii[2],
    color: colors.gatsby,
    padding: space[1],
    paddingRight: space[3],
    paddingLeft: space[6],
    overflow: `hidden`,
    fontFamily: fonts.header,
    transition: `width ${transition.speed.default} ${
      transition.curve.default
    }, background-color ${transition.speed.default} ${
      transition.curve.default
    }`,
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
    fontSize: fontSizes[1],
    margin: 0,
    alignItems: `flex-start`,
    background: `none`,
    border: `none`,
    color: colors.gray.text,
    cursor: `pointer`,
    display: `flex`,
    justifyContent: `space-between`,
    outline: `none`,
    padding: 0,
    paddingRight: space[5],
    paddingBottom: space[1],
    paddingTop: space[1],
    width: `100%`,
    textAlign: `left`,
    ":hover": {
      color: colors.gatsby,
    },
  },
  filterCheckbox: {
    marginRight: space[2],
    fontSize: fontSizes[2],
  },
  filterCount: {
    color: colors.gray.bright,
  },
  sidebarHeader: {
    margin: 0,
    [breakpoints.lg]: {
      fontSize: fontSizes[3],
      display: `none`,
      borderBottom: `1px solid ${colors.ui.light}`,
      color: colors.gray.calm,
      fontWeight: `normal`,
      flexShrink: 0,
      lineHeight: lineHeights.solid,
      height: sizes.headerHeight,
      margin: 0,
      paddingLeft: space[6],
      paddingRight: space[6],
      paddingTop: space[6],
      paddingBottom: space[6],
    },
  },
  sidebarBody: {
    paddingLeft: space[6],
    height: `calc(100vh - ((${sizes.headerHeight}) + ${sizes.bannerHeight}))`,
    display: `flex`,
    flexDirection: `column`,
  },
  sidebarContainer: {
    display: `none`,
    [breakpoints.lg]: {
      display: `block`,
      flexBasis: `15rem`,
      minWidth: `15rem`,
      paddingTop: 0,
      borderRight: `1px solid ${colors.ui.light}`,
      height: `calc(100vh - (${sizes.headerHeight} + ${sizes.bannerHeight}))`,
    },
  },
  contentHeader: {
    alignItems: `center`,
    background: `rgba(255,255,255,0.98)`,
    borderBottom: `1px solid ${colors.ui.light}`,
    display: `flex`,
    flexDirection: `row`,
    flexWrap: `wrap`,
    height: sizes.headerHeight,
    justifyContent: `space-between`,
    paddingLeft: space[6],
    paddingRight: space[6],
    zIndex: 1,
  },
  contentTitle: {
    color: colors.gatsby,
    margin: 0,
    fontSize: fontSizes[3],
    lineHeight: lineHeights.solid,
  },
  resultCount: {
    color: colors.lilac,
    fontWeight: `normal`,
  },
}

export default styles
