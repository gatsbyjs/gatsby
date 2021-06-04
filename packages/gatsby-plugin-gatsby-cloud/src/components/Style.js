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
          --z-index-preview-indicator: 9000;
          --shadow: 0px 2px 4px rgba(46, 41, 51, 0.08),
            0px 4px 8px rgba(71, 63, 79, 0.16);
        }

        [data-gatsby-preview-indicator="tooltip"] svg {
          display: inline;
        }

        [data-gatsby-preview-indicator="root"] {
          font: 14px/1.5 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
            Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji",
            "Segoe UI Symbol" !important;
          background: white;
          box-sizing: border-box;
          position: fixed;
          top: 50%;
          -ms-transform: translateY(-50%);
          transform: translateY(-50%);
          left: 16px;
          box-shadow: 0px 2px 4px rgba(46, 41, 51, 0.08),
            0px 4px 8px rgba(71, 63, 79, 0.16);
          border-radius: 6px;
          z-index: 999999;
          display: flex;
          flex-direction: column;
          padding: 8px;
          min-width: 48px;
        }

        [data-gatsby-preview-indicator="button"] {
          width: 32px;
          height: 32px;
          padding: 4px;
          border-radius: 4px;
<<<<<<< HEAD
          box-sizing: border-box;
=======
          border: none;
          background: none;
>>>>>>> 0d21105842... feat: use a <button /> for better A11y compatibility
        }

        [data-gatsby-preview-indicator-hoverable="true"]:hover {
          background: #f3f3f3;
        }

        [data-gatsby-preview-indicator-active-button="true"] {
          opacity: 1;
          transition: all 0.3s ease-in-out;
        }

        [data-gatsby-preview-indicator-active-button="false"] {
          opacity: 0.3;
          transition: all 0.3s ease-in-out;
        }

        [data-gatsby-preview-indicator="spinner"] {
          position: absolute;
          top: 10px;
          left: 10px;
          animation: spin 1s linear infinite;
          height: 28px;
        }

        [data-gatsby-preview-indicator-visible="false"] {
          opacity: 0;
          visibility: hidden;
          will-change: opacity;
          transition: all 0.2s ease-in-out;
        }

        [data-gatsby-preview-indicator-visible="true"] {
          opacity: 1;
          visibility: visible;
          will-change: opacity;
          transition: all 0.2s ease-in-out;
        }

        [data-gatsby-preview-indicator="tooltip"] {
          margin-left: 48px;
          line-height: 12px;
          background: black;
          opacity: 1;
          color: white;
          position: fixed;
          display: inline;
          padding: 10px 13px;
          margin-top: -4px;
          border-radius: 4px;
          user-select: none;
          white-space: nowrap;
        }

        [data-gatsby-preview-indicator="tooltip-link"] {
          color: #a97ec7;
          font-weight: bold;
          margin-bottom: 0;
          margin-left: 5px;
          line-height: 12px;
          font-size: 0.8rem;
          display: inline;
          cursor: pointer;
        }

        [data-gatsby-preview-indicator="tooltip-svg"] {
          display: inline;
          margin-left: 5px;
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
          [data-gatsby-preview-indicator="spinner"] {
            animation: none;
          }
          [data-gatsby-preview-indicator-visible="false"] {
            transition: none;
          }

          [data-gatsby-preview-indicator-visible="true"] {
            transition: none;
          }
        }

        @media (prefers-color-scheme: dark) {
          [data-gatsby-preview-indicator="root"] {
            background: white;
            color: var(--white);
          }
          [data-gatsby-preview-indicator="spinner"] {
            color: var(--purple-20);
          }
        }
      `,
    }}
  />
)

export default Style
