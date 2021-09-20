import { createClient } from "contentful-management"

let client

if (process.env.CONTENTFUL_ACCESS_TOKEN) {
  client = createClient({
    accessToken: process.env.CONTENTFUL_ACCESS_TOKEN,
  })
}

export default client
