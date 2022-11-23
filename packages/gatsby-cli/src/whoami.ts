import fetch from "node-fetch"
import reporter from "./reporter"
import { getToken } from "./util/manage-token"

const getUsername = async (token: string): Promise<string> => {
  let currentUsername
  const query = `query {
    currentUser {
      name
    }
  }`
  try {
    const usernameResponse = await fetch(`https://api.gatsbyjs.com/graphql`, {
      method: `post`,
      body: JSON.stringify({ query }),
      headers: {
        Authorization: `Bearer ${token}`,
        "content-type": `application/json`,
      },
    })
    const resJson = await usernameResponse.json()
    currentUsername = resJson.data.currentUser.name
  } catch (e) {
    reporter.error(e)
  }

  return currentUsername
}

/**
 * Reports the username of the logged in user if they are logged in.
 */
export async function whoami(): Promise<void> {
  const tokenFromStore = await getToken()

  if (!tokenFromStore) {
    reporter.info(`You are not currently logged in!`)
    return
  }

  const username = await getUsername(tokenFromStore)
  reporter.info(username)
}
