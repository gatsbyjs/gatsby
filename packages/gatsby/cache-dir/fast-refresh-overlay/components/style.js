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
          --color-ansi-selection: rgba(95, 126, 151, 0.48);
          --color-ansi-bg: #fefefe;
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
          z-index: 5;
          backdrop-filter: blur(10px);
        }

        [data-gatsby-overlay="root"] {
          font: 18px/1.5 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
            Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji",
            "Segoe UI Symbol" !important;
          border: 5px;
          background: #ffffff;
          position: fixed;
          max-width: 75%;
          max-height: 90%;
          top: 50%;
          left: 50%;
          transform: translateX(-50%) translateY(-50%);
          box-shadow: rgba(46, 41, 51, 0.08) 0px 7px 19px 11px,
            rgba(71, 63, 79, 0.08) 0px 2px 4px;
          border-radius: 5px;
          display: inline-flex;
          flex-direction: column;
          z-index: 10;
        }

        [data-gatsby-overlay="header"] {
          display: flex;
          align-items: center;
          color: rgba(255, 255, 255, 0.8);
          background: #663399;
          padding: 1.5em;
          border-top-left-radius: 5px;
          border-top-right-radius: 5px;
        }

        [data-gatsby-overlay="body"] {
          padding: 1.5em;
          overflow: auto;
        }

        [data-gatsby-overlay="body"] pre {
          margin: 0;
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
          color: white;
        }

        [data-gatsby-overlay="header__open-in-editor"] {
          align-items: center;
          border-radius: 4px;
          justify-content: center;
          line-height: 1;
          cursor: pointer;
          color: #fff;
          border: 1px solid rgb(102, 51, 153);
          background: #9158ca;
          font-size: 1em;
          height: 2em;
          min-width: 2em;
          padding: 0.25em 0.75em;
        }

        [data-gatsby-overlay="header__close-button"] {
          cursor: pointer;
          border: 0;
          padding: 0;
          background-color: #9158ca;
          color: white;
          appearance: none;
          height: 36px;
          width: 36px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          margin-left: 1rem;
        }
      `,
    }}
  />
)

export default Style
