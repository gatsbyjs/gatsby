/** @jsx jsx */
import { jsx, Flex } from "strict-ui"
import { Text, BaseAnchor } from "gatsby-interface"
import { useQuery } from "urql"

const Navbar: React.FC<{}> = () => {
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
      justifyContent="space-between"
      alignItems="center"
      sx={{
        backgroundColor: `grey.90`,
        borderBottom: `default`,
        paddingX: 6,
        paddingY: 5,
      }}
    >
      <Flex gap={5} alignItems="center">
        <Text sx={{ color: `white` }}>Gatsby Admin</Text>
        {data && data.npmPackageJson && (
          <div
            sx={{
              width: `1px`,
              height: `16px`,
              backgroundColor: `grey.40`,
            }}
          />
        )}
        {data && data.npmPackageJson && (
          <Text sx={{ color: `teal.50` }}>
            {data.npmPackageJson.value.replace(/^"|"$/g, ``)}
          </Text>
        )}
      </Flex>
      <Flex alignItems="center">
        <BaseAnchor
          href={`/`}
          target="_blank"
          sx={{ color: `whiteFade.60`, textDecoration: `none` }}
        >
          Visit site
        </BaseAnchor>
      </Flex>
    </Flex>
  )
}

export default Navbar
