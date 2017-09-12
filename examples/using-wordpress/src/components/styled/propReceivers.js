import { css } from "styled-components"
import theme from "./theme"
const { ftz, color, goldenRatio } = theme

// FONT SIZES
const ftzMap = p => {
  if (p.h1) {
    return css`
      font-size: ${ftz.h1};
    `
  }
  if (p.h2) {
    return css`
      font-size: ${ftz.h2};
    `
  }
  if (p.h3) {
    return css`
      font-size: ${ftz.h3};
    `
  }
  if (p.h4) {
    return css`
      font-size: ${ftz.h4};
    `
  }
  if (p.h5) {
    return css`
      font-size: ${ftz.h5};
    `
  }
  if (p.h6) {
    return css`
      font-size: ${ftz.h6};
    `
  }
  if (p.h7) {
    return css`
      font-size: ${ftz.h7};
    `
  }
  if (p.p1) {
    return css`
      font-size: ${ftz.p1};
    `
  }
  if (p.p2) {
    return css`
      font-size: ${ftz.p2};
    `
  }
  if (p.p3) {
    return css`
      font-size: ${ftz.p3};
    `
  }
  if (p.p4) {
    return css`
      font-size: ${ftz.p4};
    `
  }
  if (p.p5) {
    return css`
      font-size: ${ftz.p5};
    `
  }
}
export const ftzPropsVar = {
  h1: `h1`,
  h2: `h2`,
  h3: `h3`,
  h4: `h4`,
  h5: `h5`,
  h6: `h6`,
  h7: `h7`,
  p1: `p1`,
  p2: `p2`,
  p3: `p3`,
  p4: `p4`,
  p5: `p5`,
  ftz: `ftz`,
}
export const ftzProps = (props, def = `inherit`) => {
  if (
    props.h1 ||
    props.h2 ||
    props.h3 ||
    props.h4 ||
    props.h5 ||
    props.h6 ||
    props.h7 ||
    props.p1 ||
    props.p2 ||
    props.p3 ||
    props.p4 ||
    props.p5
  ) {
    return ftzMap(props)
  } else if (props.ftz) {
    return css`
      font-size: ${props.ftz};
    `
  } else {
    return css`
      font-size: ${def};
    `
  }
}

// COLOR
export const colorProps = (props, def = `inherit`) => css`
  color: ${props.color && typeof (props.color === `string`)
    ? props.color
    : def};
`
export const colorHoverProps = (props, def = `inherit`) => css`
  color: ${props.colorHover && typeof (props.colorHover === `string`)
    ? props.colorHover
    : def};
`

// MARGIN
export const marginPropsVar = {
  marginBottom: `marginBottom`,
  marginTop: `marginTop`,
  marginLeft: `marginLeft`,
  marginRight: `marginRight`,
  margin: `margin`,
  marginVertical: `marginVertical`,
  marginHorizontal: `marginHorizontal`,
}
export const marginProps = props => css`
  ${props.marginBottom &&
    `margin-bottom: ${typeof props.marginBottom === `string`
      ? props.marginBottom
      : `${props.marginBottom * goldenRatio}px` || `1em`}`};
  ${props.marginTop &&
    `margin-top: ${typeof props.marginTop === `string`
      ? props.marginTop
      : `${props.marginTop * goldenRatio}px` || `1em`}`};
  ${props.marginLeft &&
    `margin-left: ${typeof props.marginLeft === `string`
      ? props.marginLeft
      : `${props.marginLeft * goldenRatio}px` || `1em`}`};
  ${props.marginRight &&
    `margin-right: ${typeof props.marginRight === `string`
      ? props.marginRight
      : `${props.marginRight * goldenRatio}px` || `1em`}`};
  ${props.margin &&
    `margin: ${typeof props.margin === `string`
      ? props.margin
      : `${props.margin * goldenRatio}px` || `1em`}`};
  ${props.marginVertical &&
    `
    margin-top: ${typeof props.marginVertical === `string`
      ? props.marginVertical
      : `${props.marginVertical * goldenRatio}px` || `1em`};
    margin-bottom: ${typeof props.marginVertical === `string`
      ? props.marginVertical
      : `${props.marginVertical * goldenRatio}px` || `1em`};
  `};
  ${props.marginHorizontal &&
    `
    margin-left: ${typeof props.marginHorizontal === `string`
      ? props.marginHorizontal
      : `${props.marginHorizontal * goldenRatio}px` || `1em`};
    margin-right: ${typeof props.marginHorizontal === `string`
      ? props.marginHorizontal
      : `${props.marginHorizontal * goldenRatio}px` || `1em`};
  `};
`

// PADDING
export const paddingPropsVar = {
  paddingBottom: `paddingBottom`,
  paddingTop: `paddingTop`,
  paddingLeft: `paddingLeft`,
  paddingRight: `paddingRight`,
  padding: `padding`,
  paddingVertical: `paddingVertical`,
  paddingHorizontal: `paddingHorizontal`,
}
export const paddingProps = props => css`
  ${props.paddingBottom &&
    `padding-bottom: ${typeof props.paddingBottom === `string`
      ? props.paddingBottom
      : `${props.paddingBottom * goldenRatio}px` || `1em`}`};
  ${props.paddingTop &&
    `padding-top: ${typeof props.paddingTop === `string`
      ? props.paddingTop
      : `${props.paddingTop * goldenRatio}px` || `1em`}`};
  ${props.paddingLeft &&
    `padding-left: ${typeof props.paddingLeft === `string`
      ? props.paddingLeft
      : `${props.paddingLeft * goldenRatio}px` || `1em`}`};
  ${props.paddingRight &&
    `padding-right: ${typeof props.paddingRight === `string`
      ? props.paddingRight
      : `${props.paddingRight * goldenRatio}px` || `1em`}`};
  ${props.padding &&
    `padding: ${typeof props.padding === `string`
      ? props.padding
      : `${props.padding * goldenRatio}px` || `1em`}`};
  ${props.paddingVertical &&
    `
    padding-top: ${typeof props.paddingVertical === `string`
      ? props.paddingVertical
      : `${props.paddingVertical * goldenRatio}px` || `1em`};
    padding-bottom: ${typeof props.paddingVertical === `string`
      ? props.paddingVertical
      : `${props.paddingVertical * goldenRatio}px` || `1em`};
  `};
  ${props.paddingHorizontal &&
    `
    padding-left: ${typeof props.paddingHorizontal === `string`
      ? props.paddingHorizontal
      : `${props.paddingHorizontal * goldenRatio}px` || `1em`};
    padding-right: ${typeof props.paddingHorizontal === `string`
      ? props.paddingHorizontal
      : `${props.paddingHorizontal * goldenRatio}px` || `1em`};
  `};
`

export const borderProps = props => css`
  ${props.borderBottom &&
    `border-bottom: ${props.borderWidth || `1px`} solid ${color.white}`};
  ${props.borderTop &&
    `border-top: ${props.borderWidth || `1px`} solid ${color.white}`};
  ${props.borderLeft &&
    `border-left: ${props.borderWidth || `1px`} solid ${color.white}`};
  ${props.borderRight &&
    `border-right: ${props.borderWidth || `1px`} solid ${color.white}`};
`

export const backgroundProps = props => css`
  ${props.bgWhite &&
    typeof props.bgWhite === `boolean` &&
    `background-color: ${color.white};`};
  ${props.bgGrey &&
    typeof props.bgGrey === `boolean` &&
    `background-color: ${color.gray};`};
  ${props.bgColor &&
    typeof props.bgColor === `string` &&
    `background-color: ${props.bgColor};`};
`

export const heightProps = props => css`
  ${props.height &&
    typeof props.height === `number` &&
    `height: ${goldenRatio * props.height}px;`};
`

export const outlineProps = props => css`
  ${props.outline &&
    typeof props.outline === `boolean` &&
    `outline: 1px solid white`};
`
