import Typography from "typography"
import bootstrapTheme from "typography-theme-bootstrap"
console.log(bootstrapTheme)

bootstrapTheme.googleFonts = [
  {
    name: `Source Code Pro`,
    styles: [`400`, `700`],
  },
]
const typography = new Typography(bootstrapTheme)

export default typography
