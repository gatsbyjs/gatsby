import fetch from "node-fetch"
import opn from "better-opn"
import reporter from "./reporter"

const createTicket = async (): Promise<string> => {
  let ticketId
  try {
    const ticketResponse = await fetch(
      // "https://auth.gatsbyjs.com/auth/tickets/create",
      "http://localhost:8083/auth/tickets/create",
      {
        method: "post",
      }
    )
    const ticketJson = await ticketResponse.json()
    ticketId = ticketJson.ticketId
  } catch (e) {
    reporter.panic(
      `We had trouble connecting to Gatsby Cloud to create a login session.
Please try again later, and if it continues to have trouble connecting file an issue.`
    )
  }

  return ticketId
}

const getTicket = async (ticketId: string): Promise<Record<string, any>> => {
  let ticket
  try {
    const ticketResponse = await fetch(
      // `https://auth.gatsbyjs.com/auth/tickets/${ticketId}`,
      `http://localhost:8083/auth/tickets/${ticketId}`
    )
    const ticketJson = await ticketResponse.json()
    ticket = ticketJson
  } catch (e) {
    reporter.error(e)
  }

  return ticket
}

const handleOpenBrowser = (url): void => {
  // TODO: this will break if run from the CLI
  // for ideas see https://github.com/netlify/cli/blob/908f285fb80f04bf2635da73381c94387b9c8b0d/src/utils/open-browser.js
  console.log(process.env.BROWSER)
  opn(url)
}

/**
 * Main function that logs in to Gatsby Cloud using Gatsby Cloud's authentication service.
 */
export async function login(): Promise<void> {
  // TODO: try and get token from CLI store first

  // TODO: if we have token, print that we're already logged in

  // TODO: add telemetry that login attempt is being made

  // const webUrl = process.env.GATSBY_CLOUD_BASE_URL || `https://gatsbyjs.com`
  const webUrl = process.env.GATSBY_CLOUD_BASE_URL || `http://localhost:8000`
  reporter.info(`Logging into your Gatsby Cloud account...`)

  // Create ticket for auth
  const ticketId = await createTicket()

  // Open browser for authentication
  const authUrl = `${webUrl}/dashboard/login?authType=EXTERNAL_AUTH&ticketId=${ticketId}`
  console.log(`http://localhost:8083/auth/tickets/${ticketId}`)

  reporter.info(`Opening ${authUrl}`)
  await handleOpenBrowser(authUrl)

  // Poll until the ticket has been verified, and should have the token attached
  function pollForTicket(): Promise<void> {
    return new Promise(function (resolve): void {
      async function verify(): Promise<void> {
        const ticket = await getTicket(ticketId)
        console.log(ticket)
        if (ticket.verified) return resolve()
        setTimeout(verify, 3000)
      }

      verify()
    })
  }

  const ticket = await pollForTicket()
  console.log(ticket)

  console.log("Congrats, you have been verified!")

  // TODO: store token in CLI store (same way we do it with package manager preferences maybe)
}
