import { GatsbyFunctionResponse, GatsbyFunctionRequest } from "gatsby"
import chromium from "chrome-aws-lambda"

export default async function topLevel(
  req: GatsbyFunctionRequest,
  res: GatsbyFunctionResponse
) {
  let options
  if (process.env.NODE_ENV === `production`) {
    options = {
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    }
  } else {
    const executablePath =
      process.platform === "win32"
        ? "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe"
        : process.platform === "linux"
        ? "/usr/bin/google-chrome"
        : "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

    options = {
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath,
      headless: true,
      ignoreHTTPSErrors: true,
    }
  }

  const browser = await chromium.puppeteer.launch(options)
  const page = await browser.newPage()
  await page.goto(req.query.url || `https://gatsbyjs.com`)
  const screenshot = await page.screenshot({ encoding: `binary` })
  await browser.close()

  res.setHeader(`Content-Type`, `image/png`)
  res.send(screenshot)
}
