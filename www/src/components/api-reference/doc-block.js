import React from "react"
import styled from "@emotion/styled"
import { css } from "@emotion/core"

import ExamplesBlock from "./examples"
import ParamsBlock from "./params"
import {
  SignatureWrapper,
  TypeComponent,
  SignatureElement,
  isFunctionDef,
} from "./signature"
import ReturnBlock from "./returns"
import { Header } from "./utils"
import { scale } from "../../utils/typography"
import { fonts } from "../../utils/presets"

const Optional = styled.span`
  :before {
    content: " (optional)";
    color: #4084a1;
    font-weight: 400;
  }
`

const Deprecated = ({ definition }) => {
  if (definition.deprecated && definition.deprecated.childMarkdownRemark) {
    return (
      <div
        css={css`
          p:before {
            color: #e8bd36;
            content: "(deprecated) ";
            font-family: ${fonts.header};
          }
        `}
        dangerouslySetInnerHTML={{
          __html: definition.deprecated.childMarkdownRemark.html,
        }}
      />
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
        dangerouslySetInnerHTML={{
          __html: definition.description.childMarkdownRemark.html,
        }}
      />
    )
  }

  if (definition.type && definition.type.typeDef) {
    return <Description definition={definition.type.typeDef} />
  }

  return null
}

const DocBlock = ({
  definition,
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
        {definition.optional && <Optional />}
      </Header>
      {showSignature && !showSignatureNextToTitle && signatureElement}
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
