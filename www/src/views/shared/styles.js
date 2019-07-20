export const showcaseList = {
  display: `flex`,
  flexWrap: `wrap`,
  p: 6,
  justifyContent: `space-evenly`,
}

export const showcaseItem = {
  display: `flex`,
  flexDirection: `column`,
  m: 6,
  minWidth: 259, // shows 3 items/row on windows > 1200px wide
  maxWidth: 350,
  flex: `1 0 0`,
  position: `relative`,
}

const styles = {
  withTitleHover: {
    "& .title": {
      transition: t =>
        `box-shadow ${t.transition.speed.slow} ${
          t.transition.curve.default
        }, transform ${t.transition.speed.slow} ${t.transition.curve.default}`,
    },
    "&:hover .title": {
      boxShadow: t => `inset 0 -1px 0px 0px ${t.colors.lavender}`,
    },
  },
  loadMoreButton: {
    alignItems: `center`,
    display: `flex`,
    flexFlow: `row wrap`,
    mt: 0,
    mx: `auto`,
    mb: 9,
  },
  screenshot: {
    borderRadius: 1,
    boxShadow: `raised`,
    mb: 3,
    transition: t =>
      `all ${t.transition.speed.default} ${t.transition.curve.default}`,
  },
  screenshotHover: {
    bg: `transparent`,
    color: `gatsby`,
    "& .gatsby-image-wrapper": {
      transform: t => `translateY(-${t.space[1]})`,
      boxShadow: `overlay`,
    },
  },
  shortcutIcon: {
    pl: 1,
    "&&": {
      color: `text.secondary`,
      borderBottom: `none`,
      "&:hover": {
        color: `gatsby`,
      },
    },
  },
  meta: {
    fontSize: 1,
    alignItems: `baseline`,
    "&&": {
      color: `text.secondary`,
    },
  },
  searchInput: {
    appearance: `none`,
    border: 0,
    borderRadius: 2,
    color: `gatsby`,
    padding: 1,
    pr: 3,
    pl: 6,
    overflow: `hidden`,
    fontFamily: `header`,
    transition: t =>
      `width ${t.transition.speed.default} ${
        t.transition.curve.default
      }, background-color ${t.transition.speed.default} ${
        t.transition.curve.default
      }`,
    width: `6.8rem`,
    "&::placeholder": {
      color: `lilac`,
    },
    "&:focus": {
      outline: `none`,
      width: `9rem`,
      background: `purple.10`,
    },
  },
  filterButton: {
    fontSize: 1,
    margin: 0,
    alignItems: `flex-start`,
    background: `none`,
    border: `none`,
    color: `text.primary`,
    cursor: `pointer`,
    display: `flex`,
    justifyContent: `space-between`,
    outline: `none`,
    padding: 0,
    pr: 5,
    py: 1,
    width: `100%`,
    textAlign: `left`,
    ":hover": {
      color: `gatsby`,
    },
  },
  filterCheckbox: {
    mr: 2,
    fontSize: 2,
  },
  filterCount: {
    color: `text.secondary`,
  },
}

export default styles
