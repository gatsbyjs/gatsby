import React from "react"

function css(strings, ...keys) {
  const lastIndex = strings.length - 1
  return (
    strings.slice(0, lastIndex).reduce((p, s, i) => p + s + keys[i], ``) +
    strings[lastIndex]
  )
}

const Style = () => (
  <style
    dangerouslySetInnerHTML={{
      __html: css`
        :host {
          --gatsby: #663399;
          --gatsbyLight: #b17acc;
          --dimmedWhite: rgba(255, 255, 255, 0.8);
          --white: #ffffff;
          --black: #000000;
          --grey-90: #232129;
          --radii: 4px;
          --z-index-normal: 5;
          --z-index-elevated: 10;
          --shadow: 0px 2px 4px rgba(46, 41, 51, 0.08),
            0px 4px 8px rgba(71, 63, 79, 0.16);
        }

        [data-gatsby-loading-indicator="root"] {
          font: 14px/1.5 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
            Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji",
            "Segoe UI Symbol" !important;
          background: var(--white);
          color: var(--grey-90);
          position: fixed;
          bottom: 1.5em;
          left: 1.5em;
          box-shadow: var(--shadow);
          border-radius: var(--radii);
          z-index: var(--z-index-elevated);
          border-left: 0.25em solid var(--gatsbyLight);
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: nowrap;
          padding: 0.75em 1em;
        }

        [data-gatsby-loading-indicator="spinner"] {
          width: 20px;
          height: 20px;
          margin: 0 auto;
          background-color: var(--gatsbyLight);

          border-radius: 100%;
          animation: scaleout 1s infinite ease-in-out;
        }

        [data-gatsby-loading-indicator="text"] {
          margin-left: 1em;
        }

        @keyframes scaleout {
          0% {
            -webkit-transform: scale(0);
            transform: scale(0);
          }
          100% {
            -webkit-transform: scale(1);
            transform: scale(1);
            opacity: 0;
          }
        }
      `,
    }}
  />
)

export default Style
