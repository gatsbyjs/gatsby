/** @jsx jsx */
import { jsx, Flex } from "strict-ui"
import { Text, BaseAnchor } from "gatsby-interface"
import { useQuery } from "urql"
import useDevelopRestart from "../hooks/use-develop-restart"

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

  const [state, restartDevelopProcess] = useDevelopRestart()

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
      <Flex alignItems="center" gap={5}>
        {state === `needs-restart` && (
          <Text sx={{ color: `white` }} onClick={restartDevelopProcess}>
            restart develop process
          </Text>
        )}
        {state === `is-restarting` && (
          <Text sx={{ color: `white` }}>restarting develop process...</Text>
        )}
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
