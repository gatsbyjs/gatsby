import { createClient } from "contentful-management"

const client = createClient({
  accessToken: process.env.CONTENTFUL_ACCESS_TOKEN,
})

export default client
