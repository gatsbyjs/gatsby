import React from "react"

export default function Overlay({ header, body, dismiss }) {
  return (
    <>
      <div data-gatsby-overlay="backdrop" />
      <div data-gatsby-overlay="root" role="dialog" aria-modal="true">
        <div data-gatsby-overlay="header">
          {header}
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
        <div data-gatsby-overlay="body">{body}</div>
      </div>
    </>
  )
}
