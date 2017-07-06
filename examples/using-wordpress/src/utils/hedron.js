import { divvy, breakpoint } from 'hedron/lib/utils/';

export const compute = name =>
  breakpoint(name, (props, name) =>
    ((divisions, size, shift) => `
     ${size ? `width: ${divvy(divisions, size)}%;` : ''}
     ${shift ? `margin-left: ${divvy(divisions, shift)}%;` : ''}
     `)(props.divisions, props[name], props[`${name}Shift`]));

export const ifDefined = (prop, css = prop) =>
  props => props[prop] ? `${css}: ${props[prop]}` : '';
