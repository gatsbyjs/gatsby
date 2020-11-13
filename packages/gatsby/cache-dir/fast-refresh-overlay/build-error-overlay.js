import React, { useContext } from "react"
import Overlay from "./components/overlay"
import { ErrorContext } from "./"
import ansiHTML from "ansi-html"

const styles = {
  button: {
    alignItems: `center`,
    borderRadius: `4px`,
    justifyContent: `center`,
    lineHeight: 1,
    cursor: `pointer`,
    color: `#fff`,
    border: `1px solid rgb(102, 51, 153)`,
    background: `#9158ca`,
    fontWeight: 600,
    fontSize: `0.875rem`,
    height: `2rem`,
    minWidth: `2rem`,
    padding: `0.25rem 0.75rem`,
  },
}

function prettifyStack(errorInformation) {
  return ansiHTML(errorInformation.join(`\n`))
}

const infoMessage = `<small style="display: block; color: #ec1818; margin-bottom: 1rem; margin-top: -1.5rem;">
This error occurred during the build process and can only be
dismissed by fixing the error.
</small>`

export default function BuildErrorOverlay() {
  const context = useContext(ErrorContext)
  const problem = context.problems[context.currentIndex]
  if (!problem || problem.type !== `BUILD_ERROR`) return null

  const [file, cause, ...errorInformation] = problem.error.split(`\n`)

  const open = () => {
    window.fetch(
      `/__open-stack-frame-in-editor?fileName=` +
        window.encodeURIComponent(file) +
        `&lineNumber=` +
        window.encodeURIComponent(1) // TODO
    )
  }

  return (
    <Overlay
      header={
        <>
          <div style={{ flex: 1 }}>
            <p style={{ marginBottom: 0 }}>{cause}</p>
            <a style={{ fontSize: `22px` }}>{file}</a>
          </div>
          <button onClick={open} style={styles.button}>
            OPEN IN EDITOR
          </button>
        </>
      }
      body={
        <div
          ref={node => {
            if (!node) return
            // For some reason these can be spans and we need
            // them to be on their own line.
            Array.from(node.children).forEach(node => {
              node.style.display = `block`
              node.style.minHeight = `1rem`
            })
          }}
          dangerouslySetInnerHTML={{
            __html: infoMessage + prettifyStack(errorInformation),
          }}
        />
      }
    />
  )
}
