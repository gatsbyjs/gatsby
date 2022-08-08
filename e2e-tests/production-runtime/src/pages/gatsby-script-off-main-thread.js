import * as React from "react"
import { Link, Script } from "gatsby"
import { scripts } from "../../gatsby-script-scripts"

function OffMainThreadScripts() {
  return (
    <main style={{ margin: `1em` }}>
      <h1>Script component e2e test</h1>

      <Link
        to="/gatsby-script-off-main-thread-2/"
        data-testid="off-main-thread-2"
      >
        Go to off-main-thread-2 scripts page
      </Link>

      <Script
        id="three"
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
    {
      const main = document.querySelector('main');
      const elem = document.createElement('div');
      elem.id = 'mutation-${id}';
      elem.textContent = 'mutation-${id}: success';
      main.appendChild(elem);
    }
  `
}

export default OffMainThreadScripts
