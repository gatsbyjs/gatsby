/** @jsx jsx */
import { jsx, Flex } from "strict-ui"
import { Text, BaseAnchor } from "gatsby-interface"
import { useQuery } from "urql"

function Navbar(): JSX.Element {
  const [{ data }] = useQuery({
    query: `
      {
        npmPackageJson(id: "name") {
          value
        }
      }
    `,
  })

  return (
    <Flex
      as="nav"
      justifyContent="space-between"
      alignItems="center"
      sx={{
        borderBottom: `default`,
        paddingY: 5,
      }}
    >
      <Flex gap={5} alignItems="center">
        <Text>Gatsby Admin</Text>
        {data && data.npmPackageJson && (
          <div
            sx={{
              width: `1px`,
              height: `16px`,
              backgroundColor: `blackFade.50`,
            }}
          />
        )}
        {data && data.npmPackageJson && (
          <Text sx={{ fontWeight: `bold`, color: `text.primary` }}>
            {data.npmPackageJson.value.replace(/^"|"$/g, ``)}
          </Text>
        )}
      </Flex>
      <Flex alignItems="center">
        <BaseAnchor
          href={`/`}
          target="_blank"
          sx={{ color: `grey.60`, textDecoration: `none` }}
        >
          Visit site
        </BaseAnchor>
      </Flex>
    </Flex>
  )
}

export default Navbar
