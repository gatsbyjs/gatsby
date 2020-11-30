import fetch from "node-fetch"
import opn from "better-opn"
import reporter from "./reporter"
import { getToken, setToken } from "./util/manage-token"

interface ITicket {
  verified: boolean
  token?: string | null
  expiration?: string | null
}

const createTicket = async (): Promise<string> => {
  let ticketId
  try {
    const ticketResponse = await fetch(
      `https://auth.gatsbyjs.com/auth/tickets/create`,
      {
        method: `post`,
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

const getTicket = async (ticketId: string): Promise<ITicket> => {
  let ticket: ITicket = {
    verified: false,
  }
  try {
    const ticketResponse = await fetch(
      `https://auth.gatsbyjs.com/auth/tickets/${ticketId}`
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
  console.log(``)
  reporter.info(`Opening Gatsby Cloud for you to login from, copy this`)
  reporter.info(`url into your browser if it doesn't open automatically:`)
  console.log(``)
  console.log(url)
  opn(url)
}

/**
 * Main function that logs in to Gatsby Cloud using Gatsby Cloud's authentication service.
 */
export async function login(): Promise<void> {
  const tokenFromStore = await getToken()

  if (tokenFromStore) {
    reporter.info(`You are already logged in!`)
    return
  }

  const webUrl = `https://gatsbyjs.com`
  reporter.info(`Logging into your Gatsby Cloud account...`)

  // Create "ticket" for auth (like an expiring session)
  const ticketId = await createTicket()

  // Open browser for authentication
  const authUrl = `${webUrl}/dashboard/login?authType=EXTERNAL_AUTH&ticketId=${ticketId}&noredirect=1`

  await handleOpenBrowser(authUrl)

  // Poll until the ticket has been verified, and should have the token attached
  function pollForTicket(): Promise<ITicket> {
    return new Promise(function (resolve): void {
      // eslint-disable-next-line consistent-return
      async function verify(): Promise<void> {
        const ticket = await getTicket(ticketId)
        const timeoutId = setTimeout(verify, 3000)
        if (ticket.verified) {
          clearTimeout(timeoutId)
          return resolve(ticket)
        }
      }

      verify()
    })
  }

  console.log(``)
  reporter.info(`Waiting for login from Gatsby Cloud...`)

  const ticket = await pollForTicket()

  if (ticket?.token && ticket?.expiration) {
    await setToken(ticket.token, ticket.expiration)
  }
  reporter.info(`You have been logged in!`)
}
