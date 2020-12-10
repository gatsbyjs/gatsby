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
          --purple-60: #663399;
          --gatsby: var(--purple-60);
          --purple-40: #b17acc;
          --purple-20: #f1defa;
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
          border-left: 0.25em solid var(--purple-40);
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: nowrap;
          padding: 0.75em 1.15em;
          min-width: 196px;
        }

        [data-gatsby-loading-indicator-visible="false"] {
          opacity: 0;
          visibility: hidden;
          will-change: opacity, transform;
          transform: translateY(45px);
          transition: all 0.3s ease-in-out;
        }

        [data-gatsby-loading-indicator-visible="true"] {
          opacity: 1;
          visibility: visible;
          transform: translateY(0px);
          transition: all 0.3s ease-in-out;
        }

        [data-gatsby-loading-indicator="spinner"] {
          animation: spin 1s linear infinite;
          height: 18px;
          width: 18px;
          color: var(--gatsby);
        }

        [data-gatsby-loading-indicator="text"] {
          margin-left: 0.75em;
          line-height: 18px;
        }

        @keyframes spin {
          0% {
            transform: rotate(0);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          [data-gatsby-loading-indicator="spinner"] {
            animation: none;
          }
          [data-gatsby-loading-indicator-visible="false"] {
            transition: none;
          }

          [data-gatsby-loading-indicator-visible="true"] {
            transition: none;
          }
        }

        @media (prefers-color-scheme: dark) {
          [data-gatsby-loading-indicator="root"] {
            background: var(--grey-90);
            color: var(--white);
          }
          [data-gatsby-loading-indicator="spinner"] {
            color: var(--purple-20);
          }
        }
      `,
    }}
  />
)

export default Style
