import { graphql } from "gatsby"
import * as React from "react"

import Layout from "../components/layout"

const TextPage = ({ data }) => {
  const {
    short,
    shortList,
    longPlain,
    longMarkdownSimple,
    longMarkdownComplex,
  } = data
  return (
    <Layout>
      <h1>Short:</h1>
      <div data-cy-id="short">
        <p data-cy-value>{short.short}</p>
      </div>
      <h1>Short List:</h1>
      <div data-cy-id="short-list">
        <ul>
          {shortList.shortList.map((text, i) => (
            <li key={i} data-cy-value>
              {text}
            </li>
          ))}
        </ul>
      </div>
      <h1>Long (Plain):</h1>
      <div data-cy-id="long-plain">
        <p data-cy-value>{longPlain.longPlain.raw}</p>
      </div>
      <h1>Markdown (Simple):</h1>
      <div
        data-cy-id="long-markdown-simple"
        dangerouslySetInnerHTML={{
          __html: longMarkdownSimple.longMarkdown.childMarkdownRemark.html,
        }}
      />
      <h1>Markdown (Complex):</h1>
      <div
        data-cy-id="long-markdown-complex"
        dangerouslySetInnerHTML={{
          __html: longMarkdownComplex.longMarkdown.childMarkdownRemark.html,
        }}
      />
    </Layout>
  )
}

export default TextPage

export const pageQuery = graphql`
  query TextQuery {
    short: contentfulText(sys: { id: { eq: "5ZtcN1o7KpN7J7xgiTyaXo" } }) {
      short
    }
    shortList: contentfulText(sys: { id: { eq: "7b5U927WTFcQXO2Gewwa2k" } }) {
      shortList
    }
    longPlain: contentfulText(sys: { id: { eq: "6ru8cSC9hZi3Ekvtw7P77S" } }) {
      longPlain {
        raw
      }
    }
    longMarkdownSimple: contentfulText(
      sys: { id: { eq: "NyPJw0mcSuCwY2gV0zYny" } }
    ) {
      longMarkdown {
        childMarkdownRemark {
          html
        }
      }
    }
    longMarkdownComplex: contentfulText(
      sys: { id: { eq: "3pwKS9UWsYmOguo4UdE1EB" } }
    ) {
      longMarkdown {
        childMarkdownRemark {
          html
        }
      }
    }
  }
`
