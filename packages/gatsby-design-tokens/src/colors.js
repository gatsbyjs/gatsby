import preval from "preval.macro"

// we need to wrap this file inside preval to retain tree-shaking.
// using syntaxes like const x = { ...var } adds side-effects to the export
// preval precompiles it so we just return a single object.

export default preval`
  const palette = {
    purple: {
      90: '#362066',
      80: '#452475',
      70: '#542c85',
      60: '#663399',
      50: '#8a4baf',
      40: '#b17acc',
      30: '#d9bae8',
      20: '#f1defa',
      10: '#f6edfa',
      5: '#fcfaff',
    },
    orange: {
      90: '#db3a00',
      80: '#e65800',
      70: '#f67300',
      60: '#fb8400',
      50: '#ffb238',
      40: '#ffd280',
      30: '#ffe4a1',
      20: '#ffedbf',
      10: '#fff4db',
      5: '#fffcf7',
    },
    yellow: {
      90: '#8a6534',
      80: '#bf9141',
      70: '#e3a617',
      60: '#fec21e',
      50: '#fed038',
      40: '#ffdf37',
      30: '#ffeb99',
      20: '#fff2a8',
      10: '#fff5bf',
      5: '#fffdf7',
    },
    red: {
      90: '#b80000',
      80: '#ce0009',
      70: '#da0013',
      60: '#ec1818',
      50: '#fa2915',
      40: '#ff5a54',
      30: '#ff8885',
      20: '#ffbab8',
      10: '#fde7e7',
      5: '#fffafa',
    },
    magenta: {
      90: '#690147',
      80: '#7d0e59',
      70: '#940159',
      60: '#a6026a',
      50: '#bc027f',
      40: '#d459ab',
      30: '#e899ce',
      20: '#f2c4e3',
      10: '#ffe6f6',
      5: '#fffafd',
    },
    blue: {
      90: '#004ca3',
      80: '#006ac1',
      70: '#047bd3',
      60: '#0e8de6',
      50: '#0d96f2',
      40: '#3fa9f5',
      30: '#63b8f6',
      20: '#90cdf9',
      10: '#dbf0ff',
      5: '#f5fcff',
    },
    teal: {
      90: '#008577',
      80: '#10a39e',
      70: '#00bdb6',
      60: '#2de3da',
      50: '#05f7f4',
      40: '#73fff7',
      30: '#a6fffa',
      20: '#ccfffc',
      10: '#dcfffd',
      5: '#f7ffff',
    },
    green: {
      90: '#006500',
      80: '#088413',
      70: '#1d9520',
      60: '#2ca72c',
      50: '#37b635',
      40: '#59c156',
      30: '#79cd75',
      20: '#a1da9e',
      10: '#def5dc',
      5: '#f7fdf7',
    },
    grey: {
      90: '#232129',
      80: '#36313d',
      70: '#48434f',
      60: '#635e69',
      50: '#78757a',
      40: '#b7b5bd',
      30: '#d9d7e0',
      20: '#f0f0f2',
      10: '#f5f5f5',
      5: '#fbfbfb',
    },
    white: '#ffffff',
    black: '#000000',
  }

  const blackRGB = '35, 33, 41' // grey.90
  const whiteRGB = '255, 255, 255'

  module.exports = {
    ...palette,
    gatsby: palette.purple[60],
    // legacy shortcuts
    // most of these should be refactored to role-based tokens as we flesh those out
    lilac: palette.purple[50],
    lavender: palette.purple[20],
    accent: palette.orange[50],
    warning: palette.red[70],
    // semi-transparent colors
    blackFade: {
      80: 'rgba(' + blackRGB + ', 0.85)',
      70: 'rgba(' + blackRGB + ', 0.7)',
      60: 'rgba(' + blackRGB + ', 0.6)',
      50: 'rgba(' + blackRGB + ', 0.5)',
      30: 'rgba(' + blackRGB + ', 0.3)',
      10: 'rgba(' + blackRGB + ', 0.1)',
    },
    whiteFade: {
      80: 'rgba(' + whiteRGB + ', 0.85)',
      70: 'rgba(' + whiteRGB + ', 0.7)',
      60: 'rgba(' + whiteRGB + ', 0.6)',
      50: 'rgba(' + whiteRGB + ', 0.5)',
      30: 'rgba(' + whiteRGB + ', 0.3)',
      10: 'rgba(' + whiteRGB + ', 0.1)',
    },
    // role-based tokens
    // this is merely a humble start, lots to do here
    ui: {
      background: palette.grey[5],
      hover: palette.purple[5],
      border: {
        subtle: palette.grey[20],
      },
    },
    link: {
      color: palette.purple[50],
      border: palette.purple[30],
      hoverBorder: palette.purple[50],
    },
    text: {
      header: palette.black,
      primary: palette.grey[80],
      secondary: palette.grey[50],
      placeholder: palette.grey[40],
    },
    input: {
      border: palette.grey[30],
      focusBorder: palette.orange[40],
      focusBoxShadow: palette.orange[20],
    },
    code: {
      bgInline: "#fbf2e9",
      bg: "#fdfaf6",
      border: "#faede5",
      text: "#866c5b",
      remove: "#e45c5c",
      add: "#4a9c59",
      selector: "#b3568b",
      tag: "#4084a1",
      keyword: "#538eb6",
      comment: "#6f8f39",
      punctuation: "#53450e",
      regex: "#d88489",
      cssString: "#a2466c",
      invisibles: "#e0d7d1",
      scrollbarThumb: "#f4d1c6",
      lineHighlightBorder: "#f1beb6",
    },
  }
`
