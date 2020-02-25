const chromium = require(`chrome-aws-lambda`)
const getIO = require(`./screenshot.js`)

exports.handler = async (event, context) => {
  let browser = null
  let image
  const request = event.body ? JSON.parse(event.body) : {}

  if (!request.url) {
    return proxyError(`no url provided`)
  }

  const screenshot = await getIO({
    url: request.url,
    width: request.width || 1024,
    height: request.height || 768,
    fullPage: request.fullPage || false,
  })

  console.log(
    `Invoked: ${screenshot.url} (${screenshot.width}x${screenshot.height})`
  )

  console.log(`SCREENSHOT`, screenshot)

  // is it cached already?
  const maybeFile = await screenshot.getFile()
  if (maybeFile) {
    console.log(`Cache hit. Returning screenshot from cache`)
    return proxyResponse({
      url: screenshot.fileUrl,
      expires: screenshot.expires,
    })
  }

  try {
    browser = await chromium.puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      // headless: chromium.headless,
      headless: true,
    })

    console.log(`Opening browser`)
    const page = await browser.newPage()
    await page.setViewport({
      width: screenshot.width,
      height: screenshot.height,
      deviceScaleFactor: 2,
    })

    console.log(`Taking screenshot`)
    await page.goto(screenshot.url, { waitUntil: [`networkidle2`] })
    await page.waitFor(1000) // wait for full-size images to fade in
    image = await page.screenshot({ fullPage: screenshot.fullPage })
    await page.close()
    await browser.close()

    console.log(`Writing file`)
    await screenshot.putFile(image)
    return proxyResponse({
      url: screenshot.fileUrl,
      expires: screenshot.expires,
    })
  } catch (error) {
    return proxyError(error)
  } finally {
    if (browser !== null) {
      await browser.close()
    }
  }
}

const proxyResponse = body => {
  body.success = true

  return {
    statusCode: 200,
    body: JSON.stringify(body),
  }
}

const proxyError = err => {
  let msg = err

  if (err instanceof Error) {
    msg = err.message
  }

  return {
    statusCode: 400,
    body: JSON.stringify({
      success: false,
      error: msg,
    }),
  }
}
