import React from "react"
import styled from "@emotion/styled"
import { css } from "@emotion/core"
import { MDXRenderer } from "gatsby-plugin-mdx"

import ExamplesBlock from "./examples"
import ParamsBlock from "./params"
import {
  SignatureWrapper,
  TypeComponent,
  SignatureElement,
  isFunctionDef,
} from "./signature"
import ReturnBlock from "./returns"
import { Header, LinkBox } from "./utils"
import { scale } from "../../utils/typography"
import { fonts, space, colors } from "../../utils/presets"
import { linkStyles } from "../../utils/styles"
import GithubIcon from "react-icons/lib/go/mark-github"

const Optional = styled(`span`)`
  :before {
    content: " (optional)";
    color: #4084a1;
    font-weight: 400;
  }
`

const Deprecated = ({ definition }) => {
  if (definition.deprecated && definition.deprecated.childMdx) {
    return (
      <div
        css={css`
          p:before {
            color: #e8bd36;
            content: "(deprecated) ";
            font-family: ${fonts.header};
          }
        `}
      >
        <MDXRenderer>{definition.deprecated.childMdx.body}</MDXRenderer>
      </div>
    )
  }

  return null
}

const APILink = ({ definition, relativeFilePath }) => {
  if (definition.codeLocation && relativeFilePath) {
    return (
      <a
        css={{
          ...linkStyles,
          display: `inline-flex !important`,
        }}
        href={`https://github.com/gatsbyjs/gatsby/blob/${process.env.COMMIT_SHA}/packages/${relativeFilePath}#L${definition.codeLocation.start.line}-L${definition.codeLocation.end.line}`}
        aria-label="View source on GitHub"
      >
        <GithubIcon focusable="false" style={{ marginRight: space[2] }} />
        <span>Source</span>
      </a>
    )
  }

  if (
    definition.codeLocation &&
    !relativeFilePath &&
    !Array.isArray(definition.codeLocation)
  ) {
    return (
      <a
        css={{
          ...linkStyles,
          display: `inline-flex !important`,
        }}
        href={`https://github.com/gatsbyjs/gatsby/blob/${process.env.COMMIT_SHA}/packages/${definition.codeLocation.file}#L${definition.codeLocation.start.line}-L${definition.codeLocation.end.line}`}
        aria-label="View source on GitHub"
      >
        <GithubIcon focusable="false" style={{ marginRight: space[2] }} />
        <span>Source</span>
      </a>
    )
  }

  if (
    definition.codeLocation &&
    !relativeFilePath &&
    Array.isArray(definition.codeLocation)
  ) {
    return (
      <div
        css={{
          ...linkStyles,
          "&&:hover": {
            color: colors.text.secondary,
          },
          display: `inline-flex !important`,
          alignItems: `center`,
        }}
      >
        <GithubIcon focusable="false" style={{ marginRight: space[2] }} />
        <span>Source</span>
        <div css={{ marginLeft: space[2] }}>
          {definition.codeLocation.map((loc, index) => (
            <LinkBox
              key={`${loc.file}${loc.start.line}-${loc.end.line}`}
              href={`https://github.com/gatsbyjs/gatsby/blob/${process.env.COMMIT_SHA}/packages/${loc.file}#L${loc.start.line}-L${loc.end.line}`}
              aria-label={`View source #${index + 1} on GitHub`}
            >
              {index + 1}
            </LinkBox>
          ))}
        </div>
      </div>
    )
  }

  return null
}

const AvailableIn = ({ definition }) => {
  if (definition.availableIn && definition.availableIn.length) {
    return (
      <div>
        <span>Only available in:</span>
        {definition.availableIn.map(api => (
          <a
            key={api}
            href={`/docs/node-apis/#${api}`}
            css={linkStyles}
            style={{
              display: `inline-block`,
              marginLeft: space[2],
            }}
          >
            {api}
          </a>
        ))}
      </div>
    )
  }

  return null
}

const Description = ({ definition }) => {
  if (definition.description) {
    return (
      <div
        css={css`
          margin-top: 0.5em;
        `}
      >
        <MDXRenderer>{definition.description.childMdx.body}</MDXRenderer>
      </div>
    )
  }

  if (definition.type && definition.type.typeDef) {
    return <Description definition={definition.type.typeDef} />
  }

  return null
}

const DocBlock = ({
  definition,
  relativeFilePath = null,
  level = 0,
  linkableTitle = false,
  title = null,
  showSignature = true,
  ignoreParams = [],
}) => {
  let titleElement = title || definition.name

  if (titleElement === `$0`) {
    titleElement = `destructured object`
    showSignature = false
  } else if (titleElement) {
    titleElement = <code>{titleElement}</code>
  }

  if (linkableTitle) {
    titleElement = <a href={`#${definition.name}`}>{titleElement}</a>
  }

  const isFunction = isFunctionDef(definition)
  const showSignatureNextToTitle = !isFunction || level > 0
  const signatureElement = (
    <SignatureElement
      definition={definition}
      level={level}
      ignoreParams={ignoreParams}
      block={!showSignatureNextToTitle}
    />
  )

  return (
    <div
      css={{
        ...scale(-(level || 0) / 5),
      }}
    >
      <Header level={level}>
        <div css={{ marginRight: space[3], display: `inline-block` }}>
          {titleElement}
          {showSignature && (
            <React.Fragment>
              {` `}
              {showSignatureNextToTitle ? (
                signatureElement
              ) : (
                <SignatureWrapper>
                  <TypeComponent>Function</TypeComponent>
                </SignatureWrapper>
              )}
            </React.Fragment>
          )}
        </div>
        {level === 0 && (
          <APILink
            relativeFilePath={relativeFilePath}
            definition={definition}
          />
        )}
        {definition.optional && <Optional />}
      </Header>
      {showSignature && !showSignatureNextToTitle && signatureElement}
      <AvailableIn definition={definition} />
      <Description definition={definition} />
      <Deprecated definition={definition} />
      <ParamsBlock
        definition={definition}
        level={level}
        ignoreParams={ignoreParams}
      />
      <ReturnBlock definition={definition} level={level} />
      <ExamplesBlock definition={definition} level={level} />
    </div>
  )
}

export default DocBlock
