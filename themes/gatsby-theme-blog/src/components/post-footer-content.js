import React, { Fragment } from "react"
import { Link } from "gatsby"
import { Styled, Flex } from "theme-ui"

import Bio from "../components/bio"

/**
 * Shadow me to add your own footer content
 */

export default ({ previous, next }) => (
  <Fragment>
    <Styled.hr />
    <Bio />
    {(previous || next) && (
      <Flex
        as="ul"
        css={{
          flexWrap: `wrap`,
          justifyContent: `space-between`,
          listStyle: `none`,
          padding: 0,
        }}
      >
        <li>
          {previous && (
            <Styled.a as={Link} to={previous.node.slug} rel="prev">
              ← {previous.node.title}
            </Styled.a>
          )}
        </li>
        <li>
          {next && (
            <Styled.a as={Link} to={next.node.slug} rel="next">
              {next.node.title} →
            </Styled.a>
          )}
        </li>
      </Flex>
    )}
  </Fragment>
)
