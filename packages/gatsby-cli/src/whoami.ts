import fetch from "node-fetch"
import reporter from "./reporter"
import { getToken } from "./util/manage-token"

const getUsername = async (token: string): Promise<string> => {
  let currentUser
  const query = `query {
    currentUser {
      id
      name
    }
  }`
  try {
    const usernameResponse = await fetch(
      // `https://api.gatsbyjs.com/graphql`,
      `http://localhost:8083/graphql`,
      {
        method: "post",
        body: JSON.stringify({ query }),
        headers: {
          Authorization: `Bearer ${token}`,
          "content-type": `application/json`,
        },
      }
    )
    const resJson = await usernameResponse.json()
    currentUser = resJson.data.currentUser
  } catch (e) {
    reporter.error(e)
  }

  return currentUser.name
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
