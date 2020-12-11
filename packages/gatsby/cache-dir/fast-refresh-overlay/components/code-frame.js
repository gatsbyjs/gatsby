import React from "react"

const CodeFrame = ({ decoded }) => (
  <pre data-gatsby-overlay="pre">
    <code data-gatsby-overlay="pre__code">
      {decoded
        ? decoded.map((entry, index) => (
            <span
              key={`frame-${index}`}
              data-gatsby-overlay="pre__code__span"
              style={{
                color: entry.fg ? `var(--color-${entry.fg})` : undefined,
                ...(entry.decoration === `bold`
                  ? { fontWeight: 800 }
                  : entry.decoration === `italic`
                  ? { fontStyle: `italic` }
                  : undefined),
              }}
            >
              {entry.content}
            </span>
          ))
        : null}
    </code>
  </pre>
)

export default CodeFrame
