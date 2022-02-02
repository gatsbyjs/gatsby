import { createVar, style } from '@vanilla-extract/css';
import { rootColors } from '../styles/global.css';

const initial = createVar()
const dark = createVar()

export const root = style({
  outline: `none`,
  borderWidth: `1px`,
  borderStyle: `solid`,
  borderColor: dark,
  borderRadius: `0.25rem`,
  background: `transparent`,
  padding: `0.15rem 0.5rem`,
  transition: `all 0.3s ease-in-out`,
  color: dark,
  ':hover': {
    background: dark,
    color: initial,
    cursor: `pointer`
  },
  vars: {
    [initial]: rootColors.light.bg,
    [dark]: rootColors.dark.bg,
  },
  selectors: {
    [`.dark &`]: {
      vars: {
        [initial]: rootColors.dark.bg,
        [dark]: rootColors.light.bg,
      }
    }
  }
})