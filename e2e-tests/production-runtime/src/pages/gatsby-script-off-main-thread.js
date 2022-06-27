import * as React from "react"
import { Script } from "gatsby"
import { scripts } from "../../gatsby-script-scripts"

function OffMainThreadScripts() {
  return (
    <main style={{ margin: `1em` }}>
      <h1>Script component e2e test</h1>

      <br />
      <h2>Scripts with sources</h2>

      <Script
        src={scripts.three}
        strategy="off-main-thread"
        forward={[`THREE`]}
      />

      <Script id="inline-script-template-literal" strategy="off-main-thread">
        {createScript(`inline-script-template-literal`)}
      </Script>

      <Script
        id="inline-script-dangerously-set"
        strategy="off-main-thread"
        dangerouslySetInnerHTML={{
          __html: createScript(`inline-script-dangerously-set`),
        }}
      />
    </main>
  )
}

function createScript(id) {
  return `
     const main = document.querySelector('main');
     const elem = document.createElement('div');
     elem.id = '${id}-mutation';
     elem.textContent = '${id}-mutation: success';
     main.appendChild(elem);
   `
}

export default OffMainThreadScripts
