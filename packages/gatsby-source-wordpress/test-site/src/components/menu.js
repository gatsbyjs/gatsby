import React from "react"
import { Link, useStaticQuery, graphql } from "gatsby"
import { getUrlPath } from "../utils/get-url-path"
import { Menu, Button, Grid, Box } from "@chakra-ui/core"

export default () => {
  const { wpMenu } = useStaticQuery(graphql`
    {
      wpMenu(slug: { eq: "main-menu" }) {
        name
        menuItems {
          nodes {
            label
            url
          }
        }
      }
    }
  `)

  return !!wpMenu && !!wpMenu.menuItems && !!wpMenu.menuItems.nodes ? (
    <Box mb={10}>
      <Menu>
        <Grid autoFlow="column">
          {wpMenu.menuItems.nodes.map((menuItem, i) => (
            <Link
              key={`menu-${i}`}
              style={{ display: `block` }}
              to={getUrlPath(menuItem.url)}
            >
              <Button w="100%" key={i + menuItem.url} as={Button}>
                {menuItem.label}
              </Button>
            </Link>
          ))}
        </Grid>
      </Menu>
    </Box>
  ) : null
}
