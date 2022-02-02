import { style, createVar } from "@vanilla-extract/css"

const shadowColor = createVar()

export const wrapper = style({
  height: "100vh",
  width: "100vw",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
})

export const container = style({
  maxWidth: `800px`,
  textAlign: `right`
})

export const spacer = style({
  width: `1px`,
  height: `2rem`,
  display: `block`,
  minHeight: `2rem`,
  minWidth: `1px`
})

export const title = style({
  fontSize: `1.5rem`,
  marginTop: `0.5rem`,
  lineHeight: 1.5,
  color: `rebeccapurple`,
})

export const content = style({
  padding: `4em`,
  background: `#ccfbf1`,
  textAlign: `left`,
  borderRadius: `0.25rem`,
  color: `black`,
  vars: {
    [shadowColor]: `168deg 34% 56%`
  },
  boxShadow: `0px 0.7px 0.8px hsl(${shadowColor} / 0.34),
  0px 4.3px 4.8px -0.4px hsl(${shadowColor} / 0.34),
  0px 8.1px 9.1px -0.7px hsl(${shadowColor} / 0.34),
  0.1px 13.3px 15px -1.1px hsl(${shadowColor} / 0.34),
  0.1px 21.3px 24px -1.4px hsl(${shadowColor} / 0.34),
  0.2px 33.2px 37.4px -1.8px hsl(${shadowColor} / 0.34),
  0.2px 50.5px 56.8px -2.1px hsl(${shadowColor} / 0.34),
  0.4px 74.4px 83.7px -2.5px hsl(${shadowColor} / 0.34)`
})

export const button = style({
  background: `rebeccapurple`,
  textDecoration: `none`,
  color: `white`,
  padding: `0.5rem 0.75rem`,
  border: `none`,
  borderRadius: `0.25rem`,
  fontWeight: `bold`,
  transition: `background 0.3s ease-in-out`,
  ":hover": {
    background: `#8c53c6`
  }
})
