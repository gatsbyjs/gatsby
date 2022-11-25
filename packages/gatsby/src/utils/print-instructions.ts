import chalk from "chalk"

import { IPreparedUrls } from "../utils/prepare-urls"

export function printInstructions(appName: string, urls: IPreparedUrls): void {
  console.log()
  console.log(`You can now view ${chalk.bold(appName)} in the browser.`)
  console.log()

  if (urls.lanUrlForTerminal) {
    console.log(
      `  ${chalk.bold(`Local:`)}            ${urls.localUrlForTerminal}`
    )
    console.log(
      `  ${chalk.bold(`On Your Network:`)}  ${urls.lanUrlForTerminal}`
    )
  } else {
    console.log(`  ${urls.localUrlForTerminal}`)
  }

  console.log()
  console.log(
    `View GraphiQL, an in-browser IDE, to explore your site's data and schema`
  )
  console.log()

  if (urls.lanUrlForTerminal) {
    console.log(
      `  ${chalk.bold(`Local:`)}            ${
        urls.localUrlForTerminal
      }___graphql`
    )
    console.log(
      `  ${chalk.bold(`On Your Network:`)}  ${urls.lanUrlForTerminal}___graphql`
    )
  } else {
    console.log(`  ${urls.localUrlForTerminal}___graphql`)
  }

  if (process.env.GATSBY_EXPERIMENTAL_ENABLE_ADMIN) {
    console.log()
    console.log(
      `View Admin, an in-browser app to manage your site's configuration`
    )
    console.log()

    if (urls.lanUrlForTerminal) {
      console.log(
        `  ${chalk.bold(`Local:`)}            ${
          urls.localUrlForTerminal
        }___admin`
      )
      console.log(
        `  ${chalk.bold(`On Your Network:`)}  ${urls.lanUrlForTerminal}___admin`
      )
    } else {
      console.log(`  ${urls.localUrlForTerminal}___admin`)
    }
  }

  console.log()
  console.log(`Note that the development build is not optimized.`)
  console.log(
    `To create a production build, use ` + `${chalk.cyan(`gatsby build`)}`
  )
  console.log()
}
