import * as React from "react"

function css(strings, ...keys) {
  const lastIndex = strings.length - 1
  return (
    strings.slice(0, lastIndex).reduce((p, s, i) => p + s + keys[i], ``) +
    strings[lastIndex]
  )
}

export const Style = () => (
  <style
    dangerouslySetInnerHTML={{
      __html: css`
        :host {
          --gatsby: #663399;
          --gatsbyLight: #9158ca;
          --dimmedWhite: rgba(255, 255, 255, 0.8);
          --codeFrame-bg: #eeeeee;
          --codeFrame-color: #414141;
          --codeFrame-button-bg: white;
          --white: #ffffff;
          --black: #000000;
          --color-ansi-selection: rgba(95, 126, 151, 0.48);
          --color-ansi-bg: #fafafa;
          --color-ansi-bg-darker: #eeeeee;
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
          --z-index-elevated: 1000;
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
          backdrop-filter: blur(10px);
          cursor: not-allowed;
        }

        [data-gatsby-overlay="root"] {
          font: 18px/1.5 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
            Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji",
            "Segoe UI Symbol" !important;
          background: var(--color-ansi-bright-white);
          position: fixed;
          width: 100%;
          max-width: 60%;
          min-width: 320px;
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
          display: grid;
          grid-gap: var(--space-sm);
          grid-template-columns: 1fr;
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

        [data-gatsby-overlay="body__describedby"] {
          margin-top: 0;
          margin-bottom: var(--space);
        }

        [data-gatsby-overlay="body"] h2 {
          margin-top: 0;
          font-weight: 500;
          font-size: 1.25em;
        }

        [data-gatsby-overlay="pre"] {
          margin: 0;
          color: var(--color-ansi-fg);
          background: var(--color-ansi-bg);
          padding: var(--space-sm);
          border-radius: var(--radii);
          overflow: auto;
        }

        [data-gatsby-overlay="header__top"] {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
        }

        [data-gatsby-overlay="header__open-close"] {
          display: flex;
          align-items: flex-start;
          justify-content: flex-end;
        }

        [data-gatsby-overlay="header__cause-file"] {
          word-break: break-word;
        }

        [data-gatsby-overlay="header__cause-file"] h1,
        [data-gatsby-overlay="header__top"] h1 {
          margin-top: 0;
          margin-bottom: 0;
          font-size: 1.25em;
          font-weight: 400;
        }

        header[data-gatsby-error-type="runtime-error"]
          [data-gatsby-overlay="header__cause-file"]
          h1 {
          color: var(--white);
        }

        [data-gatsby-overlay="header__cause-file"] span {
          font-size: 1.25em;
          color: var(--white);
          font-weight: 500;
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
          font-size: 0.9em;
          height: 32px;
          min-width: 2em;
          padding: 0.25em 0.75em;
          appearance: none;
        }

        [data-gatsby-overlay="codeframe__top"] {
          display: flex;
          justify-content: space-between;
          background: var(--codeFrame-bg);
          padding: 0.5em var(--space-sm);
          color: var(--codeFrame-color);
        }

        [data-gatsby-overlay="body__open-in-editor"] {
          align-items: center;
          border-radius: var(--radii);
          justify-content: center;
          cursor: pointer;
          color: var(--codeFrame-color);
          border: none;
          background: var(--codeFrame-button-bg);
          font-size: 0.9em;
          min-width: 2em;
          padding: 0.25em 0.75em;
          appearance: none;
        }

        [data-gatsby-overlay="header__close-button"] {
          cursor: pointer;
          border: 0;
          padding: 0;
          background-color: var(--gatsbyLight);
          color: var(--white);
          appearance: none;
          height: 32px;
          width: 32px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--radii);
          margin-left: var(--space-sm);
        }

        [data-gatsby-overlay="body__graphql-error-message"] {
          margin-top: var(--space);
        }

        [data-gatsby-overlay="codeframe__bottom"] {
          margin-top: var(--space);
        }

        [data-gatsby-overlay="body__error-message-header"] {
          font-size: 1.2em;
          color: var(--black);
          margin-bottom: 1em;
        }

        [data-font-weight="bold"] {
          font-weight: 600;
        }

        [data-gatsby-overlay="footer"] {
          padding: 0 var(--space) var(--space) var(--space);
        }

        [data-gatsby-overlay="accordion"] {
          width: 100%;
          list-style: none;
          margin: 0;
          padding: 0;
          border: 0;
        }

        [data-gatsby-overlay="accordion__item"] {
          overflow: visible;
          box-sizing: border-box;
          border-top: 1px solid #e0e0e0;
          transition: all 110ms cubic-bezier(0.2, 0, 0.38, 0.9);
          margin: 0;
          padding: 0;
          vertical-align: baseline;
          font-size: 100%;
        }

        [data-gatsby-overlay="accordion__item__heading"] {
          background: none;
          border: 0;
          position: relative;
          display: flex;
          flex-direction: row-reverse;
          align-items: flex-start;
          justify-content: flex-start;
          width: 100%;
          min-height: 2.5em;
          margin: 0;
          padding: 1em 0;
          cursor: pointer;
          appearance: none;
        }

        [data-gatsby-overlay="accordion__item__heading"] svg {
          flex: 0 0 1em;
          width: 1em;
          height: 1em;
          margin: 2px 1em 0 0;
        }

        [data-gatsby-overlay="accordion__item__title"] {
          width: 100%;
          text-align: left;
          font-size: 18px;
          color: var(--black);
        }

        [data-gatsby-overlay="accordion__item__content"] {
          display: none;
          padding-top: 0;
          padding-bottom: 0;
          transition: padding 0.11s cubic-bezier(0.2, 0, 0.38, 0.9);
        }

        [data-accordion-active="true"]
          [data-gatsby-overlay="accordion__item__content"] {
          display: block;
          padding-bottom: var(--space);
          transition: padding 0.11s cubic-bezier(0.2, 0, 0.38, 0.9);
        }

        [data-accordion-active="false"]
          [data-gatsby-overlay="accordion__item__content"] {
          display: none;
        }

        [data-gatsby-overlay="chevron-icon"] {
          transform: rotate(90deg);
          transition: all 0.11s cubic-bezier(0.2, 0, 0.38, 0.9);
        }

        [data-accordion-active="false"] [data-gatsby-overlay="chevron-icon"] {
          transform: rotate(90deg);
        }

        [data-accordion-active="true"] [data-gatsby-overlay="chevron-icon"] {
          transform: rotate(-90deg);
        }

        @media (min-width: 768px) {
          [data-gatsby-overlay="header"] {
            grid-template-columns: 1fr auto;
          }
        }
      `,
    }}
  />
)
