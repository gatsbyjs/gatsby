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
    shortEnglish,
    longEnglish,
    shortGerman,
    longGerman,
  } = data
  return (
    <Layout>
      <h2>Short:</h2>
      <div data-cy-id="short">
        <p data-cy-value>{short.short}</p>
      </div>
      <h2>Short List:</h2>
      <div data-cy-id="short-list">
        <ul>
          {shortList.shortList.map((text, i) => (
            <li key={i} data-cy-value>
              {text}
            </li>
          ))}
        </ul>
      </div>
      <h2>Long (Plain):</h2>
      <div data-cy-id="long-plain">
        <p data-cy-value>{longPlain.longPlain.raw}</p>
      </div>
      <h2>Markdown (Simple):</h2>
      <div
        data-cy-id="long-markdown-simple"
        dangerouslySetInnerHTML={{
          __html: longMarkdownSimple.longMarkdown.childMarkdownRemark.html,
        }}
      />
      <h2>Markdown (Complex):</h2>
      <div
        data-cy-id="long-markdown-complex"
        dangerouslySetInnerHTML={{
          __html: longMarkdownComplex.longMarkdown.childMarkdownRemark.html,
        }}
      />

      <h1>English Locale</h1>
      <h2>Short:</h2>
      <div data-cy-id="english-short">
        <p data-cy-value>{shortEnglish.shortLocalized}</p>
      </div>
      <h2>Long (Plain):</h2>
      <div data-cy-id="english-long">
        <p data-cy-value>{longEnglish.longLocalized.raw}</p>
      </div>

      <h1>German Locale</h1>
      <h2>Short:</h2>
      <div data-cy-id="german-short">
        <p data-cy-value>{shortGerman.shortLocalized}</p>
      </div>
      <h2>Long (Plain):</h2>
      <div data-cy-id="german-long">
        <p data-cy-value>{longGerman.longLocalized.raw}</p>
      </div>
    </Layout>
  )
}

export default TextPage

export const pageQuery = graphql`
  query TextQuery {
    short: contentfulContentTypeText(
      sys: { id: { eq: "5ZtcN1o7KpN7J7xgiTyaXo" }, locale: { eq: "en-US" } }
    ) {
      short
    }
    shortList: contentfulContentTypeText(
      sys: { id: { eq: "7b5U927WTFcQXO2Gewwa2k" }, locale: { eq: "en-US" } }
    ) {
      shortList
    }
    longPlain: contentfulContentTypeText(
      sys: { id: { eq: "6ru8cSC9hZi3Ekvtw7P77S" }, locale: { eq: "en-US" } }
    ) {
      longPlain {
        raw
      }
    }
    longMarkdownSimple: contentfulContentTypeText(
      sys: { id: { eq: "NyPJw0mcSuCwY2gV0zYny" }, locale: { eq: "en-US" } }
    ) {
      longMarkdown {
        childMarkdownRemark {
          html
        }
      }
    }
    longMarkdownComplex: contentfulContentTypeText(
      sys: { id: { eq: "3pwKS9UWsYmOguo4UdE1EB" }, locale: { eq: "en-US" } }
    ) {
      longMarkdown {
        childMarkdownRemark {
          html
        }
      }
    }
    shortEnglish: contentfulContentTypeText(
      sys: { id: { eq: "2sQRyOLUexvWZj9nkzS3nN" }, locale: { eq: "en-US" } }
    ) {
      shortLocalized
    }
    shortGerman: contentfulContentTypeText(
      sys: { id: { eq: "2sQRyOLUexvWZj9nkzS3nN" }, locale: { eq: "de-DE" } }
    ) {
      shortLocalized
    }
    longEnglish: contentfulContentTypeText(
      sys: { id: { eq: "5csovkwdDBqTKwSblAOHvd" }, locale: { eq: "en-US" } }
    ) {
      longLocalized {
        raw
      }
    }
    longGerman: contentfulContentTypeText(
      sys: { id: { eq: "5csovkwdDBqTKwSblAOHvd" }, locale: { eq: "de-DE" } }
    ) {
      longLocalized {
        raw
      }
    }
  }
`
