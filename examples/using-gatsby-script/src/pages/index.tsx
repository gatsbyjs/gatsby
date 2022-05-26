import React, { useState } from "react"
import { Script } from "gatsby"
import "../styles/common.css"

const scripts = {
  three: `https://unpkg.com/three@0.139.1/build/three.js`,
  jQuery: `https://code.jquery.com/jquery-3.4.1.min.js`,
  marked: `https://cdn.jsdelivr.net/npm/marked/marked.min.js`,
  popper: `https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js`,
  myLocalScript: `/my-local-script.js`,
  myLocalScript2: `/my-local-script-2.js`,
}

const IndexPage = () => {
  const [loaded, setLoaded] = useState<boolean>(false)

  return (
    <main className="index-main">
      <title>Using Gatsby Script</title>
      <h1>Using Gatsby Script</h1>
      <p>
        This site shows how we can use the
        {` `}
        <a href="https://gatsby.dev/gatsby-script">Gatsby Script component</a>.
      </p>
      <p>
        There's nothing of note rendered to page since this example is about
        script loading.
      </p>
      <p>
        Check out the network panel in your browser's devtools or view the{` `}
        <a href="https://github.com/gatsbyjs/gatsby/tree/master/examples/using-gatsby-script">
          source on GitHub
        </a>
        .
      </p>

      {/* Scripts with sources */}
      <Script
        strategy="post-hydrate" // Can also use the `ScriptStrategy` enum to declare strategies
        src={scripts.three}
        onLoad={() => console.log(`success loading ${scripts.three}`)}
        onError={() => console.log(`failure loading ${scripts.three}`)}
      />
      <Script
        strategy="idle"
        src={scripts.jQuery}
        onLoad={() => console.log(`success loading ${scripts.jQuery}`)}
        onError={() => console.log(`failure loading ${scripts.jQuery}`)}
      />
      <Script
        strategy="off-main-thread"
        src={scripts.marked}
        forward={[`marked.parse`]}
      />

      {/* Dependent script loading, here my-local-script-2 loads after my-local-script loads */}
      <Script
        src={scripts.myLocalScript}
        onLoad={() => {
          console.log(`success loading ${scripts.myLocalScript}`)
          setLoaded(true)
        }}
        onError={() => console.log(`failure loading ${scripts.myLocalScript}`)}
      />
      {loaded && (
        <Script
          src={scripts.myLocalScript2}
          onLoad={() =>
            console.log(`success loading ${scripts.myLocalScript2}`)
          }
          onError={() =>
            console.log(`failure loading ${scripts.myLocalScript2}`)
          }
        />
      )}

      {/* Inline scripts via template literals */}
      <Script id="inline-script-1" strategy="post-hydrate">
        {`console.log('success loading inline script 1')`}
      </Script>
      <Script id="inline-script-2" strategy="idle">
        {`console.log('success loading inline script 2')`}
      </Script>
      <Script id="inline-script-3" strategy="off-main-thread">
        {`console.log('success loading inline script 3')`}
      </Script>

      {/* Inline scripts via dangerouslySetInnerHTML */}
      <Script
        id="inline-script-4"
        strategy="post-hydrate"
        dangerouslySetInnerHTML={{
          __html: `console.log('success loading inline script 4')`,
        }}
      />
      <Script
        id="inline-script-5"
        strategy="idle"
        dangerouslySetInnerHTML={{
          __html: `console.log('success loading inline script 5')`,
        }}
      />
      <Script
        id="inline-script-6"
        strategy="off-main-thread"
        dangerouslySetInnerHTML={{
          __html: `console.log('success loading inline script 6')`,
        }}
      />
    </main>
  )
}

export default IndexPage
