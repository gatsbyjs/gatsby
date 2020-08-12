/** @jsx jsx */
import { jsx, Flex } from "strict-ui"
import { Text, Button, AnchorButton } from "gatsby-interface"
import { useQuery } from "urql"
import { FeedbackForm } from "feedback-fish"
import externalLinkIcon from "../external-link.svg"
import graphqlIcon from "../graphql.svg"

function SendFeedbackButton(props): JSX.Element {
  return (
    <Button variant="GHOST" size="S" {...props}>
      Send feedback
    </Button>
  )
}

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
      <Flex gap={5} alignItems="baseline">
        <Text sx={{ textTransform: `uppercase`, fontSize: 0 }}>
          Gatsby Admin
        </Text>
        {data && data.npmPackageJson && (
          <Text sx={{ fontWeight: `bold`, color: `text.primary`, fontSize: 3 }}>
            {data.npmPackageJson.value.replace(/^"|"$/g, ``)}
          </Text>
        )}
      </Flex>
      <Flex alignItems="baseline" gap={3}>
        <FeedbackForm
          projectId="9502a819990b03"
          triggerComponent={SendFeedbackButton}
        />
        <AnchorButton
          size="S"
          href="/___graphql"
          target="_blank"
          variant="SECONDARY"
        >
          GraphiQL&nbsp;
          <img src={graphqlIcon} />
        </AnchorButton>
        <AnchorButton size="S" href="/" target="_blank">
          View localhost&nbsp;
          <img src={externalLinkIcon} />
        </AnchorButton>
      </Flex>
    </Flex>
  )
}

export default Navbar
