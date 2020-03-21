import merge from "deepmerge"
import defaultTheme from "gatsby-theme-blog/src/gatsby-plugin-theme-ui/index"

export default merge(defaultTheme, {
  colors: {
    text: "green",
    primary: "salmon",
    heading: "pink",
    modes: {
      dark: {
        background: "blue",
        primary: "teal",
        highlight: "red",
      },
    },
  },
})
