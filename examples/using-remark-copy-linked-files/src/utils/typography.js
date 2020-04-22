import Typography from "typography"
import Wordpress2016 from "typography-theme-wordpress-2016"

Wordpress2016.overrideThemeStyles = () => {
  return {
    "a.gatsby-resp-image-link": {
      boxShadow: `none`,
    },
    ".caption": {
      maxWidth: `24rem`,
      display: `block`,
      lineHeight: 1.6,
    },
    ".caption code": {
      lineHeight: 1,
      fontStyle: `normal`,
    },
    code: {
      background: `#fdf6e3`,
      color: `rgba(0,0,0,0.75)`,
    },
    ".fail": {
      color: `crimson`,
      fontWeight: `bold`,
      borderBottom: `2px solid crimson`,
    },
    ".win": {
      color: `limegreen`,
      fontWeight: `bold`,
    },
  }
}

const typography = new Typography(Wordpress2016)

// Hot reload typography in development.
if (process.env.NODE_ENV !== `production`) {
  typography.injectStyles()
}

export default typography
