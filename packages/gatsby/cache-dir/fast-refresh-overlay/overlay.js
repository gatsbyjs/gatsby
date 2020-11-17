import React from "react"

const styles = {
  background: {
    background: `#48434f`,
    opacity: 0.5,
    position: `fixed`,
    top: 0,
    left: 0,
    height: `100%`,
    width: `100%`,
  },
  overlay: {
    fontFamily: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"`,
    border: `5px`,
    background: `#ffffff`,
    position: `fixed`,
    width: `90%`,
    maxHeight: `90%`,
    top: 0,
    left: `5%`,
    boxShadow: `rgba(46, 41, 51, 0.08) 0px 1px 2px, rgba(71, 63, 79, 0.08) 0px 2px 4px`,
    borderRadius: `5px`,
  },
  header: {
    display: `flex`,
    alignItems: `flex-end`,
    width: `100%`,
    color: `rgba(255,255,255,0.8)`,
    background: `#663399`,
    padding: `1.5rem`,
    borderTopLeftRadius: `5px`,
    borderTopRightRadius: `5px`,
  },
  errorInformation: {
    padding: `1.5rem`,
    overflow: `auto`,
  },
  dismiss: {
    position: `absolute`,
    right: `1.5rem`,
    top: `1.5rem`,

    cursor: `pointer`,
    border: 0,
    padding: 0,
    backgroundColor: `transparent`,
    appearance: `none`,
  },
}

export default function Overlay({ header, body, dismiss }) {
  return (
    <>
      <div style={styles.background} />
      <section style={styles.overlay}>
        <div style={styles.header}>
          {header}
          <button style={styles.dismiss} onClick={dismiss}>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M18 6L6 18"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M6 6L18 18"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
        <div style={styles.errorInformation}>{body}</div>
      </section>
    </>
  )
}
