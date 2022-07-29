import type { Page, ConsoleMessage } from "@playwright/test"

export async function waitForRouteChange(
  page: Page,
  path: string
): Promise<ConsoleMessage> {
  return await page.waitForEvent(`console`, {
    predicate: message => {
      const text = message.text()
      return text === `onRouteUpdate: ${path}`
    },
    timeout: 5000,
  })
}
