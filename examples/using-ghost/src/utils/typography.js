import Typography from "typography"
import fairygates from "typography-theme-fairy-gates"

fairygates.headerLineHeight = 1.1
fairygates.overrideThemeStyles = () => {
  return {
    a: {
      textShadow: `none`,
    },
    img: {
      maxWidth: `100%`,
      height: `auto`,
    },
    video: {
      maxWidth: `100%`,
      height: `auto`,
    },
  }
}

const typography = new Typography(fairygates)

export const { rhythm, scale } = typography
export default typography
