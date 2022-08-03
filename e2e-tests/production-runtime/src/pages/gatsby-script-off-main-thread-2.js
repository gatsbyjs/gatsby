import * as React from "react"
import { Script } from "gatsby"

function OffMainThreadScriptsTwo() {
  return (
    <main style={{ margin: `1em` }}>
      <h1>Script component e2e test</h1>

      <Script
        src="http://localhost:9000/used-by-off-main-thread-2.js"
        strategy="off-main-thread"
        forward={[`some-other-forward`]}
      />

      <Script id="inline-script-template-literal" strategy="off-main-thread">
        {createScript(`inline-script-template-literal-2`)}
      </Script>

      <Script
        id="inline-script-dangerously-set"
        strategy="off-main-thread"
        dangerouslySetInnerHTML={{
          __html: createScript(`inline-script-dangerously-set-2`),
        }}
      />
    </main>
  )
}

function createScript(id) {
  return `
    {
      const main = document.querySelector('main');
      const elem = document.createElement('div');
      elem.id = 'mutation-${id}';
      elem.textContent = 'mutation-${id}: success';
      main.appendChild(elem);
    }
  `
}

export default OffMainThreadScriptsTwo
