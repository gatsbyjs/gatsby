import * as React from "react"

export function CodeFrame({ decoded }) {
  return (
    <pre data-gatsby-overlay="pre">
      <code data-gatsby-overlay="pre__code">
        {decoded
          ? decoded.map((entry, index) => {
              // Check if content is "Enter" and render other element that collapses
              // Otherwise an empty line would be printed
              if (
                index === 0 &&
                entry.content ===
                  `
`
              ) {
                return (
                  <span
                    key={`frame-${index}`}
                    data-gatsby-overlay="pre__code__span__empty"
                  />
                )
              }

              return (
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
              )
            })
          : null}
      </code>
    </pre>
  )
}
