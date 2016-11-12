import ReactDOM from 'react-dom/server'
import React from 'react'
import Typography from 'typography'
import { GoogleFont } from 'react-typography'
import CodePlugin from 'typography-plugin-code'

const options = {
  googleFonts: [
    {
      name: 'Playfair Display',
      styles: [
        '700',
      ],
    },
    {
      name: 'Space Mono',
      styles: [
        '400',
        '400i',
        '700',
        '700i',
      ],
    },
  ],
  headerFontFamily: [`Playfair Display`, `sans-serif`],
  bodyFontFamily: [`Futura PT`, `sans-serif`],
  baseFontSize: `18px`,
  baseLineHeight: 1.4,
  headerColor: `hsla(0,0%,0%,0.8)`,
  bodyColor: `hsla(0,0%,0%,0.7)`,
  blockMarginBottom: 0.75,
  scale: 2,
  plugins: [
    new CodePlugin(),
  ],
  overrideStyles: () => ({
    'tt,code': {
      background: `rgba(246, 224, 196, 0.38)`,
      fontFamily: `"Space Mono",Consolas,"Roboto Mono","Droid Sans Mono","Liberation Mono",Menlo,Courier,monospace`,
      fontSize: '80%',
      fontVariant: `none`,
    },
    pre: {
      background: `rgba(246, 224, 196, 0.38)`,
      fontSize: '100%',
    },
    a: {
      color: `#367f8a`,
    },
  }),
}

const typography = new Typography(options)

// Hot reload typography in development.
if (process.env.NODE_ENV !== 'production') {
  typography.injectStyles()
  if (typeof document !== 'undefined') {
    const googleFonts = ReactDOM.renderToStaticMarkup(
      React.createFactory(GoogleFont)({ typography })
    )
    const head = document.getElementsByTagName('head')[0]
    head.insertAdjacentHTML('beforeend', googleFonts)
  }
}

export default typography
