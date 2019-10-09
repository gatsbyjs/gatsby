import React from "react"

import styled from "@emotion/styled"
import { css } from "@emotion/core"
import { graphql } from "gatsby"

import { SubHeader } from "./utils"

const Wrapper = styled(`span`)`
  font-family: ${p => p.theme.fonts.heading};
  font-weight: 400;

  :before,
  :after {
    color: #969584;
  }

  :before {
    content: "{ ";
  }
  :after {
    content: " }";
  }

  ${props =>
    props.block &&
    css`
      display: block;
      margin-top: ${props.theme.space[2]};
    `};
`

const TypeComponent = ({ children }) => (
  <span className="token builtin">{children}</span>
)

const Punctuation = ({ children }) => (
  <span className="token punctuation">{children}</span>
)

const Operator = ({ children }) => (
  <span className="token operator">{children}</span>
)

const ReactJoin = (arrayOfElements, joiner) =>
  arrayOfElements.reduce((acc, current, index) => {
    if (index > 0) {
      acc.push(
        React.cloneElement(joiner, {
          key: `joiner ${index}`,
        })
      )
    }
    acc.push(current)

    return acc
  }, [])

const TypeExpression = ({ type }) => {
  if (type.type === `NameExpression`) {
    return <TypeComponent>{type.name}</TypeComponent>
  } else if (type.type === `NullLiteral`) {
    return <TypeComponent>null</TypeComponent>
  } else if (type.type === `UndefinedLiteral`) {
    return <TypeComponent>undefined</TypeComponent>
  } else if (type.type === `UnionType`) {
    return (
      <React.Fragment>
        {ReactJoin(
          type.elements.map((element, index) => (
            <TypeExpression key={`union element ${index}`} type={element} />
          )),
          <Operator> | </Operator>
        )}
      </React.Fragment>
    )
  } else if (type.type === `TypeApplication` && type.expression) {
    if (type.expression.name === `Array`) {
      return (
        <React.Fragment>
          <TypeExpression type={type.applications[0]} />
          <Operator>[]</Operator>
        </React.Fragment>
      )
    } else {
      return (
        <React.Fragment>
          <TypeExpression type={type.expression} />
          {`<`}
          <TypeExpression type={type.applications[0]} />
          {`>`}
        </React.Fragment>
      )
    }
  }
  return null
}

const FunctionSignature = ({ definition, block, ignoreParams }) => {
  const params = definition.params
    ? definition.params
        .filter(param => !ignoreParams.includes(param.name))
        .map((param, index) => (
          <React.Fragment key={param.name}>
            {index > 0 && <Punctuation>, </Punctuation>}
            {param.name === `$0` ? `apiCallbackContext` : param.name}
            {param.type && (
              <React.Fragment>
                <Punctuation>{param.optional && `?`}:</Punctuation>
                {` `}
                <TypeExpression type={param.type} />
              </React.Fragment>
            )}
          </React.Fragment>
        ))
    : null

  return (
    <Wrapper block={block}>
      <Punctuation>{`(`}</Punctuation>
      {params}
      <Punctuation>{`)`}</Punctuation> <Operator>=&gt;</Operator>
      {` `}
      {definition.returns && definition.returns.length ? (
        <TypeExpression type={definition.returns[0].type} />
      ) : (
        <TypeComponent>undefined</TypeComponent>
      )}
    </Wrapper>
  )
}

const isFunctionDef = (definition, recursive = true) =>
  (definition.params && definition.params.length > 0) ||
  (definition.returns && definition.returns.length > 0) ||
  (recursive &&
    definition.type &&
    definition.type.typeDef &&
    isFunctionDef(definition.type.typeDef, false))

const SignatureElement = ({
  definition,
  ignoreParams,
  fallbackToName = false,
  block = false,
}) => {
  if (isFunctionDef(definition, false)) {
    return (
      <FunctionSignature
        definition={definition}
        block={block}
        ignoreParams={ignoreParams}
      />
    )
  }

  if (definition.type && definition.type.typeDef) {
    return (
      <SignatureElement
        definition={definition.type.typeDef}
        fallbackToName={true}
        ignoreParams={ignoreParams}
        block={block}
      />
    )
  }

  if (definition.type) {
    return (
      <Wrapper block={block}>
        <TypeExpression type={definition.type} />
      </Wrapper>
    )
  }

  if (fallbackToName && definition.name) {
    return (
      <Wrapper block={block}>
        <TypeComponent>{definition.name}</TypeComponent>
      </Wrapper>
    )
  }

  return null
}

const SignatureBlock = ({ definition, level = 0 }) => (
  <React.Fragment>
    <SubHeader level={level}>Signature</SubHeader>
    <SignatureElement definition={definition} />
  </React.Fragment>
)

export {
  isFunctionDef,
  SignatureElement,
  SignatureBlock,
  TypeComponent,
  Wrapper as SignatureWrapper,
}

export const fragment = graphql`
  fragment DocumentationTypeFragment on DocumentationJs {
    optional
    type {
      name
      type
      elements
      expression
      applications
    }
  }
`
