import React from "react"
import styled, { injectGlobal, extend } from "styled-components"
import Link from "gatsby-link"
import * as PR from "./propReceivers"
import theme from "./theme"
import { fontFaceHelper } from "../../utils/fontFaceHelper"
export { Page, Row, Column } from "./layout"

const { ftz, color } = theme

/* Global Styles */
injectGlobal`
  ${fontFaceHelper(`butler`, `butler_black-webfont`)}
  ${fontFaceHelper(`butler`, `butler_black_stencil-webfont`, `normal`)}
  ${fontFaceHelper(`butler`, `butler_regular-webfont`)}
  body {
    font-family: 'butler', sans-serif;
    margin: 0;
    background-color: ${color.lightGray};
  }
`

/* Global Tags */
export const H1 = styled.h1`
  ${props => PR.ftzProps(props, ftz.h1)} ${props =>
      PR.colorProps(props)} ${PR.marginProps};
`
export const H2 = styled.h2`
  ${props => PR.ftzProps(props, ftz.h2)} ${props =>
      PR.colorProps(props)} ${PR.marginProps};
`
export const H3 = styled.h3`
  ${props => PR.ftzProps(props, ftz.h3)} ${props =>
      PR.colorProps(props)} ${PR.marginProps};
`
export const H4 = styled.h4`
  ${props => PR.ftzProps(props, ftz.h4)} ${props =>
      PR.colorProps(props)} ${PR.marginProps};
`
export const H5 = styled.h5`
  ${props => PR.ftzProps(props, ftz.h5)} ${props =>
      PR.colorProps(props)} ${PR.marginProps};
`
export const H6 = styled.h6`
  ${props => PR.ftzProps(props, ftz.h6)} ${props =>
      PR.colorProps(props)} ${PR.marginProps};
`
export const H7 = styled.h6`
  ${props => PR.ftzProps(props, ftz.h6)} ${props =>
      PR.colorProps(props)} ${PR.marginProps};
`
export const P1 = styled.p`
  ${props => PR.ftzProps(props, ftz.p1)} ${props =>
      PR.colorProps(props)} ${PR.marginProps};
`
export const P2 = styled.p`
  ${props => PR.ftzProps(props, ftz.p2)} ${props =>
      PR.colorProps(props)} ${PR.marginProps};
`
export const P3 = styled.p`
  ${props => PR.ftzProps(props, ftz.p3)} ${props =>
      PR.colorProps(props)} ${PR.marginProps};
`
export const P4 = styled.p`
  ${props => PR.ftzProps(props, ftz.p4)} ${props =>
      PR.colorProps(props)} ${PR.marginProps};
`
export const P5 = styled.p`
  ${props => PR.ftzProps(props, ftz.p5)} ${props =>
      PR.colorProps(props)} ${PR.marginProps};
`

/* Links */
export const DefaultLink = styled(
  ({
    h1,
    h2,
    h3,
    h4,
    h5,
    h6,
    h7,
    p1,
    p2,
    p3,
    p4,
    p5,
    ftz,
    marginBottom,
    marginTop,
    marginLeft,
    marginRight,
    margin,
    marginVertical,
    marginHorizontal,
    paddingBottom,
    paddingTop,
    paddingLeft,
    paddingRight,
    padding,
    paddingVertical,
    paddingHorizontal,
    color,
    colorHover,
    underline,
    block,
    ...rest
  }) => <Link {...rest} />
)`
  ${props => PR.ftzProps(props)} ${props =>
      PR.colorProps(props, color.link)} text-decoration: ${props =>
      props.underline ? `underline` : `none`};
  &:hover {
    ${props => PR.colorHoverProps(props, `blue`)} ${props =>
        props.block &&
        typeof props.block === `boolean` &&
        `background-color: ${color.white}`};
  }
`

export const StyledLink = DefaultLink.extend`${PR.marginProps};`

export const BlockLink = DefaultLink.extend`
  ${PR.paddingProps} display: block;
  &:hover {
    background-color: ${color.white};
  }
`

export const Div = styled.footer`
  ${PR.backgroundProps};
  ${PR.heightProps};
`
