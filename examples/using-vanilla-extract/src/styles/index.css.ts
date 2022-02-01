import { style } from "@vanilla-extract/css"

export const Container = style({
  margin: `0 auto`,
  marginTop: `3rem`,
  padding: `1.5rem`,
  maxWidth: 800,
  color: `red`,
})

export const Title = style({
  fontSize: `1.5em`,
  color: `#a43db3`,
})

export const Wrapper = style({
  padding: `4em`,
  background: `#ccfbf1`,
})

export const Button = style({
  background: `#a43db3`,
  color: `#fff`,
  padding: `.7em`,
  border: `none`,
  borderRadius: `0.5em`,
  fontSize: `1em`,
  fontWeight: `bold`,
})

export const CardBottom = style({
  marginTop: `2.5em`,
})
