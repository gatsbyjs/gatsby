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
        <p data-cy-value>{longPlain.longPlain.longPlain}</p>
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
        <p data-cy-value>{longEnglish.longLocalized.longLocalized}</p>
      </div>

      <h1>German Locale</h1>
      <h2>Short:</h2>
      <div data-cy-id="german-short">
        <p data-cy-value>{shortGerman.shortLocalized}</p>
      </div>
      <h2>Long (Plain):</h2>
      <div data-cy-id="german-long">
        <p data-cy-value>{longGerman.longLocalized.longLocalized}</p>
      </div>
    </Layout>
  )
}

export default TextPage

export const pageQuery = graphql`
  query TextQuery {
    short: contentfulText(
      node_locale: { eq: "en-US" }
      contentful_id: { eq: "5ZtcN1o7KpN7J7xgiTyaXo" }
    ) {
      short
    }
    shortList: contentfulText(
      node_locale: { eq: "en-US" }
      contentful_id: { eq: "7b5U927WTFcQXO2Gewwa2k" }
    ) {
      shortList
    }
    longPlain: contentfulText(
      node_locale: { eq: "en-US" }
      contentful_id: { eq: "6ru8cSC9hZi3Ekvtw7P77S" }
    ) {
      longPlain {
        longPlain
      }
    }
    longMarkdownSimple: contentfulText(
      node_locale: { eq: "en-US" }
      contentful_id: { eq: "NyPJw0mcSuCwY2gV0zYny" }
    ) {
      longMarkdown {
        childMarkdownRemark {
          html
        }
      }
    }
    longMarkdownComplex: contentfulText(
      node_locale: { eq: "en-US" }
      contentful_id: { eq: "3pwKS9UWsYmOguo4UdE1EB" }
    ) {
      longMarkdown {
        childMarkdownRemark {
          html
        }
      }
    }
    shortEnglish: contentfulText(
      node_locale: { eq: "en-US" }
      contentful_id: { eq: "2sQRyOLUexvWZj9nkzS3nN" }
    ) {
      shortLocalized
    }
    shortGerman: contentfulText(
      node_locale: { eq: "de-DE" }
      contentful_id: { eq: "2sQRyOLUexvWZj9nkzS3nN" }
    ) {
      shortLocalized
    }
    longEnglish: contentfulText(
      node_locale: { eq: "en-US" }
      contentful_id: { eq: "5csovkwdDBqTKwSblAOHvd" }
    ) {
      longLocalized {
        longLocalized
      }
    }
    longGerman: contentfulText(
      node_locale: { eq: "de-DE" }
      contentful_id: { eq: "5csovkwdDBqTKwSblAOHvd" }
    ) {
      longLocalized {
        longLocalized
      }
    }
  }
`
