import React from "react"
import isPresent from "is-present"
import { Styled, Box } from "theme-ui"
import { Link } from "gatsby"
import { Folder } from "react-feather"

export default ({ directories }) =>
  isPresent(directories) ? (
    <>
      <Box py={3} style={{ display: `flex`, flexWrap: `wrap` }}>
        {Object.entries(directories).map(([key, value]) => (
          <Styled.a
            as={Link}
            key={key}
            to={value[0].pagePath}
            style={{
              display: `flex`,
              alignItems: `center`,
            }}
          >
            <Folder style={{ marginRight: `5px` }} />
            <span style={{ marginRight: `15px` }}>{key}</span>
          </Styled.a>
        ))}
      </Box>
      <hr />
    </>
  ) : null
