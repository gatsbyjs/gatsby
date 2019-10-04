import {
  colors,
  space,
  radii,
  transition,
  shadows,
  fontSizes,
  fonts,
} from "../../utils/presets"

const styles = {
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
    minWidth: 259, // shows 3 items/row on windows > 1200px wide
    maxWidth: 350,
    flex: `1 0 0`,
    position: `relative`,
  },
  withTitleHover: {
    "& .title": {
      transition: `box-shadow ${transition.speed.slow} ${transition.curve.default}, transform ${transition.speed.slow} ${transition.curve.default}`,
    },
    "&:hover .title": {
      boxShadow: `inset 0 -1px 0px 0px ${colors.lavender}`,
    },
  },
  loadMoreButton: {
    alignItems: `center`,
    display: `flex`,
    flexFlow: `row wrap`,
    margin: `0 auto ${space[9]}`,
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
      color: colors.text.secondary,
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
      color: colors.text.secondary,
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
    transition: `width ${transition.speed.default} ${transition.curve.default}, background-color ${transition.speed.default} ${transition.curve.default}`,
    width: `6.8rem`,
    "&::placeholder": {
      color: colors.lilac,
    },
    "&:focus": {
      outline: `none`,
      width: `9rem`,
      background: colors.purple[10],
    },
  },
  filterButton: {
    fontSize: fontSizes[1],
    margin: 0,
    alignItems: `flex-start`,
    background: `none`,
    border: `none`,
    color: colors.text.primary,
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
    color: colors.text.secondary,
  },
}

export default styles
