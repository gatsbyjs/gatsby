import * as React from "react"

export default function HeadFunctionDeduplication() {
  return (
    <>
      <h1>
        I deduplicated Head elements by their <code>id</code>
      </h1>
    </>
  )
}

function SEO({ children }) {
  return (
    <>
      <link rel="deduplication" id="deduplication-test" href="/foo" />
      <link
        rel="alternate"
        type="application/atom+xml"
        title="RSS Feed"
        href="/blog/news/atom"
      />
      {children}
    </>
  )
}

export function Head() {
  return (
    <SEO>
      <link rel="deduplication" id="deduplication-test" href="/bar" />
      <link rel="alternate" hrefLang="de-DE" href="/de/" />
    </SEO>
  )
}
