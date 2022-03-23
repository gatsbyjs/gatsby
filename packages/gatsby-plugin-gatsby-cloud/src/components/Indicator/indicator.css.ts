import { style, styleVariants } from "@vanilla-extract/css"
import { vars } from "../theme.css"

export const wrapperStyleBase = style({
  font: `14px/1.5 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol" !important`,
  background: vars.color.white,
  boxSizing: `border-box`,
  position: `fixed`,
  top: `50%`,
  left: `16px`,
  transform: `translateY(-50%)`,
  boxShadow: `0px 2px 4px rgba(46, 41, 51, 0.08), 0px 4px 8px rgba(71, 63, 79, 0.16)`,
  borderRadius: `6px`,
  zIndex: 999999,
  display: `flex`,
  flexDirection: `column`,
  gap: `0.3rem`,
  padding: `8px`,
  width: `48px`,
  transitionProperty: `transform opacity`,
  transitionDuration: `0.3s`,
  transitionTimingFunction: `cubic-bezier(0.68, -0.55, 0.265, 1.55)`,
  "@media": {
    "(prefers-reduced-motion: reduce)": {
      transition: `none`,
    },
  },
})

export const wrapperStyle = styleVariants({
  default: [
    wrapperStyleBase,
    { transform: `translateX(-100%) translateY(-50%)`, opacity: 0 },
  ],
  loaded: [
    wrapperStyleBase,
    { transform: `translateX(0) translateY(-50%)`, opacity: 1 },
  ],
})
