// everything in here is supposed to be used with `sx` from `theme-ui`
// so use those design tokens and shorthand syntax

export const showcaseList = {
  display: `flex`,
  flexWrap: `wrap`,
  justifyContent: `space-evenly`,
  p: 6,
}

export const showcaseItem = {
  display: `flex`,
  flex: `1 0 0`,
  flexDirection: `column`,
  m: 6,
  maxWidth: 350,
  minWidth: 259, // shows 3 items/row on windows > 1200px wide
  position: `relative`,
}

export const withTitleHover = {
  "& .title": {
    transition: t =>
      `box-shadow ${t.transition.speed.slow} ${
        t.transition.curve.default
      }, transform ${t.transition.speed.slow} ${t.transition.curve.default}`,
  },
  "&:hover .title": {
    boxShadow: t => `inset 0 -1px 0px 0px ${t.colors.lavender}`,
  },
}

export const loadMoreButton = {
  alignItems: `center`,
  display: `flex`,
  flexFlow: `row wrap`,
  mt: 0,
  mx: `auto`,
  mb: 9,
}

export const screenshot = {
  borderRadius: 1,
  boxShadow: `raised`,
  mb: 3,
  transition: t =>
    `all ${t.transition.speed.default} ${t.transition.curve.default}`,
}

export const screenshotHover = {
  bg: `transparent`,
  color: `gatsby`,
  "& .gatsby-image-wrapper": {
    transform: t => `translateY(-${t.space[1]})`,
    boxShadow: `overlay`,
  },
}

export const shortcutIcon = {
  pl: 1,
  "&&": {
    borderBottom: `none`,
    color: `text.secondary`,
    "&:hover": {
      color: `gatsby`,
    },
  },
}

export const meta = {
  alignItems: `baseline`,
  fontSize: 1,
  "&&": {
    color: `text.secondary`,
  },
}

export const filterButton = {
  alignItems: `flex-start`,
  background: `none`,
  border: `none`,
  color: `text.primary`,
  cursor: `pointer`,
  display: `flex`,
  fontSize: 1,
  justifyContent: `space-between`,
  margin: 0,
  outline: `none`,
  p: 0,
  pr: 5,
  py: 1,
  textAlign: `left`,
  width: `100%`,
  ":hover": {
    color: `gatsby`,
  },
}

export const filterCheckbox = {
  fontSize: 2,
  mr: 2,
}

export const filterCount = {
  color: `text.secondary`,
}
