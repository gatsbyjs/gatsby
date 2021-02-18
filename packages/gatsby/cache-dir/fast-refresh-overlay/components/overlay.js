import * as React from "react"

function Backdrop() {
  return <div data-gatsby-overlay="backdrop" />
}

export function Overlay({ children }) {
  return (
    <>
      <Backdrop />
      <div
        tabIndex="-1"
        data-gatsby-overlay="root"
        role="dialog"
        aria-labelledby="overlay-labelledby"
        aria-describedby="overlay-describedby"
        aria-modal="true"
      >
        {children}
      </div>
    </>
  )
}

export function Header({ open = undefined, dismiss, children }) {
  return (
    <header data-gatsby-overlay="header">
      <div data-gatsby-overlay="header__open-close">
        {open && (
          <button onClick={open} data-gatsby-overlay="header__open-in-editor">
            Open in editor
          </button>
        )}
        <button
          data-gatsby-overlay="header__close-button"
          aria-label="Close error overlay"
          onClick={dismiss}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M18 6L6 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M6 6L18 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
      {children}
    </header>
  )
}

export function Body({ children }) {
  return <div data-gatsby-overlay="body">{children}</div>
}

export function Footer({ children }) {
  return <footer data-gatsby-overlay="footer">{children}</footer>
}
