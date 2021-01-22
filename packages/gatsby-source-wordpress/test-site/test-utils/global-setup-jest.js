// global-setup.js
import { spawn } from "child_process"
import on from "wait-on"
import path from "path"

import { mutateSchema, resetSchema } from "./increment-remote-data"

// require .env.development or .env.production
require(`dotenv`).config({
  path: path.resolve(process.cwd(), `test-site/.env.test`),
})

require(`dotenv`).config({
  path: path.resolve(process.cwd(), `test-site/.env.WORDPRESS_BASIC_AUTH`),
})

module.exports = async function globalSetup() {
  if (!process.env.START_SERVER) {
    return
  }

  if (!process.env.WORDPRESS_BASIC_AUTH) {
    console.log(
      `Please add the env var WORDPRESS_BASIC_AUTH. It should be a string in the following pattern: base64Encode(\`\${username}:\${password}\`)`
    )

    await new Promise((resolve) => setTimeout(resolve, 100))
    process.exit(1)
  }

  if (process.env.WPGQL_INCREMENT) {
    const response = await mutateSchema()
    console.log(response)
  } else {
    const response = await resetSchema()
    console.log(response)
  }

  console.log(`\nstarting Gatsby`)

  const gatsbyProcess = spawn(`yarn`, [`develop-test-runtime`], {
    detached: true,
    env: {
      ...process.env,
      NODE_ENV: `development`,
    },
  })

  global.__GATSBY_PROCESS = gatsbyProcess

  gatsbyProcess.stdout.pipe(process.stdout)

  await on({ resources: [`http://localhost:8000`] })
}
