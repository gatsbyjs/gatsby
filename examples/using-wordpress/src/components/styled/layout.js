import React from 'react';
import styled, { css } from 'styled-components';
import { compute, ifDefined } from '../../utils/hedron';
import * as PR from './propReceivers';
import {
  Page as HedronPage,
  Row as HedronRow,
  Column as HedronColumn
} from 'hedron';
import theme from './theme';
const { sizes, color } = theme;

/*
 * Media Queries
 * xs: < 450
 * sm: < 692
 * md: < 991
 * lg: 992 and beyound 
 */


// const media = {
//   tablet: (...args) => css`
//     @media (min-width: 420px) {
//       ${ css(...args) }
//     }
//   `
// }

// Iterate through the sizes and create a media template
export const media = Object.keys(sizes).reduce((acc, label) => {
	acc[label] = (...args) => css`
		@media (max-width: ${sizes[label] / 16}em) {
			${css(...args)}
		}
	`
	return acc
}, {})

/*
 * Grid
 */
export const Page = styled(HedronPage)`
  ${props =>
    props.fluid
      ? 'width: 100%;'
      : `
    margin: 0 auto;
    max-width: 100%;
    ${props.width
      ? `width: ${props.width};`
      : `width: ${sizes.max};`
    }
    `
  }
`;


export const RowHedron = styled(HedronRow)`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  ${ifDefined('alignContent', 'align-content')}
  ${ifDefined('alignItems', 'align-items')}
  ${ifDefined('alignSelf', 'align-self')}
  ${ifDefined('justifyContent', 'justify-content')}
  ${ifDefined('order')}
`;


export const gutter = props => css`
  padding-right: 40px;
  padding-left: 40px;
  ${media.sm`
    padding-right: 15px;
    padding-left: 15px;
  `}
`;


export const Row = styled(({ 
  gutter, 
  gutterWhite,
  height, 
  borderBottom, borderTop, borderLeft, borderRight,
  outline,
  ...rest 
  }) => <RowHedron {...rest}/> )`

  ${props => props.gutter && gutter };
  ${props => css` background-color: ${props.gutterWhite ? color.white : color.lightGray}`};
  ${PR.heightProps};
  ${PR.borderProps};
  ${PR.outlineProps};
`;


export const Column = styled(({
  outline, ...rest
  }) => <HedronColumn {...rest}/>)`
  display: block;
  ${props => props.debug
    ? `background-color: rgba(50, 50, 255, .1);
  outline: 1px solid #fff;`
    : ''
  }
  box-sizing: border-box;
  padding: 0;
  width: 100%;
  ${compute('xs')}
  ${compute('sm')}
  ${compute('md')}
  ${compute('lg')}
  ${PR.outlineProps}
`;