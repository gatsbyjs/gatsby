import { globalStyle, style, styleVariants } from "@vanilla-extract/css";
import { vars } from "../theme.css";

export const wrapperStyle = style({
  position: `absolute`,
  left: `40px`,
  top: `50%`,
  transform: `translateY(-50%)`,
});

const wrapperInnerBaseStyle = style({
  position: `relative`,
  lineHeight: `12px`,
  background: vars.color.black,
  color: vars.color.white,
  display: `flex`,
  alignItems: `center`,
  padding: `10px 13px`,
  borderRadius: `4px`,
  userSelect: `none`,
  whiteSpace: `nowrap`,
  cursor: `default`,
  willChange: `opacity`,
  transition: `opacity 0.2s ease-in-out`,
  selectors: {
    "&:before": {
      content: ``,
      position: `absolute`,
      top: `50%`,
      left: `-6px`,
      width: 0,
      height: 0,
      transform: `translateY(-50%)`,
      borderStyle: `solid`,
      borderWidth: `10px 10px 10px 0`,
      borderColor: `transparent black transparent transparent`,
    },
  },
});

export const wrapperInnerStyle = styleVariants({
  default: [wrapperInnerBaseStyle, { opacity: 1 }],
  hidden: [wrapperInnerBaseStyle, { opacity: 0 }],
});

export const closeButtonStyle = style({
  display: `flex`,
  justifyContent: `center`,
  alignItems: `center`,
  background: `none`,
  border: `none`,
  padding: 0,
  marginLeft: `0.8rem`,
  cursor: `pointer`,
});

globalStyle(`${closeButtonStyle} > svg`, {
  color: vars.color.white,
  opacity: `0.6`,
  transitionProperty: `color, opacity`,
  transitionDuration: `0.3s`,
  transitionTimingFunction: `ease-in-out`,
});

globalStyle(`${closeButtonStyle}:hover > svg`, {
  opacity: 1,
});
