import * as React from "react"

export default function HeadFunctionExportBasic() {
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
      <link
        id="icon"
        rel="icon"
        href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='0.9em' font-size='90'>👤</text></svg>"
      />
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
      <link
        id="icon"
        rel="icon"
        href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='0.9em' font-size='90'>🔥</text></svg>"
      />
      <link rel="alternate" hrefLang="de-DE" href="/de/" />
    </SEO>
  )
}
