import { capitalize } from "lodash-es"

import { colorable } from "../../utils/guidelines/color"
import { colors } from "../../gatsby-plugin-theme-ui"

// Palette meta information
const meta = {
  purple: {
    base: 60,
    meta: {
      60: {
        name: `Gatsby`,
        pms: {
          value: `2077 C`,
          href: `https://www.pantone.com/color-finder/2077-C`,
        },
        cmyk: {
          value: `76 85 0 0`,
        },
      },
      50: { name: `Lilac` },
      20: { name: `Lavender` },
    },
  },
  orange: {
    base: 50,
    meta: {
      50: { name: `Accent` },
    },
  },
  magenta: { base: 50 },
  red: {
    base: 50,
    meta: {
      70: { name: `Warning` },
    },
  },
  green: {
    base: 50,
  },
  yellow: {
    base: 40,
  },
  blue: {
    base: 50,
  },
  black: {
    meta: {
      name: `Black`,
      cmyk: {
        value: `0 0 0 100`,
      },
    },
  },
  white: {
    meta: {
      name: `White`,
      cmyk: {
        value: `0 0 0 0`,
      },
    },
  },
  grey: {
    base: 40,
  },
  teal: {
    base: 50,
  },
}

// Merge info from `meta` and `colors`
// and add contrast and accessibility information
let palette = []

for (var color in colors) {
  let m = meta[color]
  let c = {}

  if (m && typeof colors[color] === `object` && color !== `ui`) {
    Object.keys(colors[color])
      .sort((a, b) => a - b)
      .forEach(shade => {
        c[shade] = {
          hex: colors[color][shade],
          ...colorable(colors[color][shade]),
          ...(m.base && m.base === shade && { base: true }),
          ...(m.meta &&
            m.meta[shade] && {
              name: m.meta[shade].name,
              pms: m.meta[shade].pms,
              cmyk: m.meta[shade].cmyk,
            }),
        }
      })

    palette[color] = {
      name: capitalize(color), // Color group name
      ...(m.base && m.base ? { base: m.base } : {}), // Base color index
      colors: c,
    }
  } else if (typeof colors[color] === `string`) {
    palette[color] = {
      name: capitalize(color), // Color group name
      color: {
        hex: colors[color],
        ...colorable(colors[color]),
        ...(m &&
          m.meta && {
            name: m.meta.name,
            pms: m.meta.pms,
            cmyk: m.meta.cmyk,
          }),
      },
    }
  }
}

export default palette
