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
          --gatsbyLight: #9158ca;
          --dimmedWhite: rgba(255, 255, 255, 0.8);
          --white: #ffffff;
          --black: #000000;
          --color-ansi-selection: rgba(95, 126, 151, 0.48);
          --color-ansi-bg: #fafafa;
          --color-ansi-fg: #545454;
          --color-ansi-white: #969896;
          --color-ansi-black: #141414;
          --color-ansi-blue: #183691;
          --color-ansi-cyan: #007faa;
          --color-ansi-green: #008000;
          --color-ansi-magenta: #795da3;
          --color-ansi-red: #d91e18;
          --color-ansi-yellow: #aa5d00;
          --color-ansi-bright-white: #ffffff;
          --color-ansi-bright-black: #545454;
          --color-ansi-bright-blue: #183691;
          --color-ansi-bright-cyan: #007faa;
          --color-ansi-bright-green: #008000;
          --color-ansi-bright-magenta: #795da3;
          --color-ansi-bright-red: #d91e18;
          --color-ansi-bright-yellow: #aa5d00;
          --radii: 5px;
          --z-index-normal: 5;
          --z-index-elevated: 10;
          --space: 1.5em;
          --space-sm: 1em;
          --space-lg: 2.5em;
        }

        [data-gatsby-overlay="backdrop"] {
          background: rgba(72, 67, 79, 0.5);
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          height: 100%;
          width: 100%;
          z-index: var(--z-index-normal);
          backdrop-filter: blur(10px);
        }

        [data-gatsby-overlay="root"] {
          font: 18px/1.5 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
            Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji",
            "Segoe UI Symbol" !important;
          background: var(--color-ansi-bright-white);
          position: fixed;
          max-width: 75%;
          min-width: 600px;
          max-height: 90%;
          top: 50%;
          left: 50%;
          transform: translateX(-50%) translateY(-50%);
          box-shadow: rgba(46, 41, 51, 0.08) 0px 7px 19px 11px,
            rgba(71, 63, 79, 0.08) 0px 2px 4px;
          border-radius: var(--radii);
          display: inline-flex;
          flex-direction: column;
          z-index: var(--z-index-elevated);
        }

        [data-gatsby-overlay="header"] {
          display: flex;
          align-items: center;
          color: var(--dimmedWhite);
          background: var(--gatsby);
          padding: var(--space);
          border-top-left-radius: var(--radii);
          border-top-right-radius: var(--radii);
        }

        [data-gatsby-overlay="body"] {
          padding: var(--space);
          overflow: auto;
        }

        [data-gatsby-overlay="body"] pre {
          margin: 0;
          color: var(--color-ansi-fg);
          background: var(--color-ansi-bg);
          padding: var(--space-sm);
          border-radius: var(--radii);
        }

        [data-gatsby-overlay="header__cause-file"] {
          flex: 1;
        }

        [data-gatsby-overlay="header__cause-file"] p {
          margin-top: 0;
          margin-bottom: 0;
        }

        [data-gatsby-overlay="header__cause-file"] span {
          font-size: 1.25em;
          color: var(--white);
        }

        [data-gatsby-overlay="header__open-in-editor"] {
          align-items: center;
          border-radius: var(--radii);
          justify-content: center;
          line-height: 1;
          cursor: pointer;
          color: var(--white);
          border: 1px solid var(--gatsby);
          background: var(--gatsbyLight);
          font-size: 1em;
          height: 2em;
          min-width: 2em;
          padding: 0.25em 0.75em;
          margin-left: var(--space-lg);
        }

        [data-gatsby-overlay="header__close-button"] {
          cursor: pointer;
          border: 0;
          padding: 0;
          background-color: var(--gatsbyLight);
          color: var(--white);
          appearance: none;
          height: 36px;
          width: 36px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--radii);
          margin-left: 1rem;
        }

        [data-gatsby-overlay="body__error-message-header"] {
          margin-top: 0;
          font-size: 1.2em;
          color: var(--black);
          margin-bottom: 0.25em;
        }

        [data-gatsby-overlay="body__error-message"] {
          margin-top: 0;
          margin-bottom: 2em;
        }

        [data-font-weight="bold"] {
          font-weight: 600;
        }
      `,
    }}
  />
)

export default Style
