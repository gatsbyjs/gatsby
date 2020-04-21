import React, { useEffect, useRef } from "react"

function ScriptLoader({ async = true, children, src }) {
  const ref = useRef(null)
  /*
   * On initial render, add the script tag
   * as a child of the wrapper div
   */
  useEffect(() => {
    if (
      ref.current.lastChild &&
      ref.current.lastChild.getAttribute("src") === src
    ) {
      return
    }
    const script = document.createElement("script")
    script.setAttribute("async", async)
    script.setAttribute("src", src)

    ref.current.appendChild(script)
  }, [])

  return <div ref={ref}>{children}</div>
}

export default ScriptLoader
