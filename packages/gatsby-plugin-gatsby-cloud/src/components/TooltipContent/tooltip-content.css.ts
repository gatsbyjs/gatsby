import { globalStyle, style } from "@vanilla-extract/css";
import { vars } from "../theme.css";

export const linkWrapperStyle = style({
  background: `none`,
  border: `none`,
  padding: 0,
  display: `flex`,
  alignItems: `center`,
});

globalStyle(`${linkWrapperStyle} > svg`, {
  display: `inline`,
  marginLeft: `5px`,
});

export const linkTextStyle = style({
  color: vars.color.africanViolet,
  fontWeight: `bold`,
  marginBottom: 0,
  marginLeft: `5px`,
  lineHeight: `12px`,
  fontSize: `0.8rem`,
  display: `inline`,
  cursor: `pointer`,
  textDecoration: `none`,
  ":hover": {
    textDecoration: `underline`,
  },
});
