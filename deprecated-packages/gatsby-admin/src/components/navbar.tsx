/** @jsx jsx */
import { jsx, Flex } from "strict-ui"
import { Text, Button, AnchorButton } from "gatsby-interface"
import { useQuery } from "urql"
import { FeedbackFish } from "@feedback-fish/react"
import externalLinkIcon from "../external-link.svg"
import graphqlIcon from "../graphql.svg"
import { Link } from "gatsby"
import useDevelopState from "../utils/use-develop-logs"
import { useTelemetry } from "gatsby-admin/src/utils/use-telemetry"

function SendFeedbackButton(props): JSX.Element {
  const telemetry = useTelemetry()
  return (
    <Button
      variant="GHOST"
      size="S"
      data-feedback-fish
      {...props}
      onClick={(): void => {
        telemetry.trackEvent(`FEEDBACK_WIDGET_OPEN`)
      }}
    >
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

  const [developState, restartDevelop] = useDevelopState()

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
      <Flex
        as={Link}
        // @ts-ignore
        to="/"
        gap={5}
        alignItems="baseline"
        sx={{ textDecoration: `none` }}
      >
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
        <FeedbackFish
          projectId="9502a819990b03"
          triggerComponent={SendFeedbackButton}
        />
        <SendFeedbackButton />
        <AnchorButton
          size="S"
          href="/___graphql"
          target="_blank"
          variant="SECONDARY"
        >
          GraphiQL&nbsp;
          <img src={graphqlIcon} />
        </AnchorButton>
        {developState === `needs-restart` && (
          <Button size="S" onClick={restartDevelop}>
            Restart develop process
          </Button>
        )}
        {developState === `is-restarting` && (
          <Button
            size="S"
            loading
            loadingLabel="Restarting develop process..."
          />
        )}
        {developState === `idle` && (
          <AnchorButton size="S" href="/" target="_blank">
            View localhost&nbsp;
            <img src={externalLinkIcon} />
          </AnchorButton>
        )}
      </Flex>
    </Flex>
  )
}

export default Navbar
