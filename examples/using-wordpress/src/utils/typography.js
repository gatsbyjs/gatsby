import Typography from "typography"
import wordpress2013 from "typography-theme-wordpress-2013"

wordpress2013.headerLineHeight = 1.1
wordpress2013.overrideThemeStyles = () => {
  return {
    a: {
      color: `rgb(60,99,243)`,
    },
  }
}

const typography = new Typography(wordpress2013)

export default typography
