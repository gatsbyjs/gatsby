import { style } from "@vanilla-extract/css"
import { vars } from "../var.css"

export const wrapperStyle = style({
  font: `14px/1.5 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol" !important`,
  background: vars.color.white,
  boxSizing: `border-box`,
  position: `fixed`,
  top: `50%`,
  transform: `translateY(-50%)`,
  left: `16px`,
  boxShadow: `0px 2px 4px rgba(46, 41, 51, 0.08), 0px 4px 8px rgba(71, 63, 79, 0.16)`,
  borderRadius: `6px`,
  zIndex: 999999,
  display: `flex`,
  flexDirection: `column`,
  padding: `8px`,
  width: `48px`,
})
