import { capitalize } from "lodash-es"
import Color from "color"

import { colorable } from "../../utils/guidelines/color"
import theme from "../../utils/guidelines/theme"

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
    },
  },
  orange: {
    base: 50,
    meta: {
      50: { name: `Mustard` },
    },
  },
  magenta: { base: 50 },
  red: {
    base: 50,
    meta: {
      40: { name: `Warning` },
    },
  },
  green: {
    base: 50,
    meta: {
      50: { name: `Success` },
    },
  },
  yellow: {
    base: 40,
    meta: {
      40: { name: `Lemon` },
    },
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

// Merge info from `meta` and `theme.colors`
// and add contrast and accessibility information
let palette = []

for (var color in theme.colors) {
  let m = meta[color]
  let c = {}

  if (m && typeof theme.colors[color] === `object` && color !== `ui`) {
    Object.keys(theme.colors[color])
      .sort((a, b) => a - b)
      .forEach(foo => {
        c[foo] = {
          hex: theme.colors[color][foo],
          ...colorable(theme.colors[color][foo]),
          ...(m.base && m.base === foo && { base: true }),
          ...(m.meta &&
            m.meta[foo] && {
              name: m.meta[foo].name,
              pms: m.meta[foo].pms,
              cmyk: m.meta[foo].cmyk,
            }),
          rgb: Color(theme.colors[color][foo])
            .rgb()
            .object(),
        }
      })

    palette[color] = {
      name: capitalize(color), // Color group name
      ...(m.base && m.base ? { base: m.base } : {}), // Base color index
      colors: c,
    }
  } else if (typeof theme.colors[color] === `string`) {
    palette[color] = {
      name: capitalize(color), // Color group name
      color: {
        hex: theme.colors[color],
        ...colorable(theme.colors[color]),
        ...(m &&
          m.meta && {
            name: m.meta.name,
            pms: m.meta.pms,
            cmyk: m.meta.cmyk,
          }),
        rgb: Color(theme.colors[color])
          .rgb()
          .object(),
      },
    }
  }
}

export default palette
