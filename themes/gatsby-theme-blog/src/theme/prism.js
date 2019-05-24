// todo: swap for theme colors
export default {
  ".attr-name": {
    color: `rgb(173, 219, 103)`,
    fontStyle: `italic`,
  },
  ".comment": {
    color: `rgb(128, 147, 147)`,
  },
  [[`.string`, `.url`]]: {
    color: `rgb(173, 219, 103)`,
  },
  ".variable": {
    color: `rgb(214, 222, 235)`,
  },
  ".number": {
    color: `rgb(247, 140, 108)`,
  },
  [[`.builtin`, `.char`, `.constant`, `.function`]]: {
    color: `rgb(130, 170, 255)`,
  },
  ".punctuation": {
    color: `rgb(199, 146, 234)`,
  },
  [[`.selector`, `.doctype`]]: {
    color: `rgb(199, 146, 234)`,
  },
  ".class-name": {
    color: `rgb(255, 2013, 139)`,
  },
  [[`.tag`, `.operator`, `.keyword`]]: {
    color: `#ffa7c4`,
  },
  ".boolean": {
    color: `rgb(255, 88, 116)`,
  },
  ".property": {
    color: `rgb(128, 203, 196)`,
  },
  ".namespace": {
    color: `rgb(178, 204, 214)`,
  },
  ".gatsby-highlight-code-line": {
    backgroundColor: `hsla(207, 95%, 15%, 1)`,
    display: `block`,
    marginRight: `-1.3125rem`,
    marginLeft: `-1.3125rem`,
    paddingRight: `1em`,
    paddingLeft: `1.25em`,
    borderLeft: `0.25em solid #ffa7c4`,
  },
}
