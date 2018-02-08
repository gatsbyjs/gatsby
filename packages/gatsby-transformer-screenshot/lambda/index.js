const setup = require(`./starter-kit/setup`)

const crypto = require(`crypto`)

const AWS = require(`aws-sdk`)
const s3 = new AWS.S3({
  apiVersion: `2006-03-01`,
})

exports.handler = async (event, context, callback) => {
  // For keeping the browser launch
  context.callbackWaitsForEmptyEventLoop = false

  let request = {}
  if (event.body) {
    request = JSON.parse(event.body)
  }

  const url = request.url

  if (!url) {
    callback(null, proxyError(`no url provided`))
    return
  }

  const width = request.width || 1024
  const height = request.height || 768

  const browser = await setup.getBrowser()
  exports
    .run(browser, url, width, height)
    .then(result => {
      callback(null, proxyResponse(result))
    })
    .catch(err => {
      callback(null, proxyError(err))
    })
}

exports.run = async (browser, url, width, height) => {
  console.log(`Invoked: ${url} (${width}x${height})`)

  if (!process.env.S3_BUCKET) {
    throw new Error(
      `Provide the S3 bucket to use by adding an S3_BUCKET` +
        ` environment variable to this Lambda's configuration`
    )
  }

  const region = await s3GetBucketLocation(process.env.S3_BUCKET)

  if (!region) {
    throw new Error(`invalid bucket ${process.env.S3_BUCKET}`)
  }

  const keyBase = `${url}-(${width},${height})`
  const digest = crypto
    .createHash(`md5`)
    .update(keyBase)
    .digest(`hex`)
  const key = `${digest}.png`

  const screenshotUrl = `https://s3-${region}.amazonaws.com/${
    process.env.S3_BUCKET
  }/${key}`

  const metadata = await s3HeadObject(key)

  const now = new Date()
  if (metadata) {
    if (metadata.Expiration) {
      const expires = getDateFromExpiration(metadata.Expiration)
      if (now < expires) {
        console.log(`Returning cached screenshot`)
        return { url: screenshotUrl, expires }
      }
    } else {
      throw new Error(`no expiration date set`)
    }
  }

  console.log(`Taking new screenshot`)

  const page = await browser.newPage()

  await page.setViewport({ width, height })
  await page.goto(url, { waitUntil: [`load`, `networkidle0`] })

  const screenshot = await page.screenshot()
  const up = await s3PutObject(key, screenshot)

  await page.close()

  let expires

  if (up && up.Expiration) {
    expires = getDateFromExpiration(up.Expiration)
  }

  return { url: screenshotUrl, expires }
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

const s3PutObject = async (key, body) => {
  const params = {
    ACL: `public-read`,
    Bucket: process.env.S3_BUCKET,
    Key: key,
    Body: body,
    ContentType: `image/png`,
  }

  return new Promise((resolve, reject) => {
    s3.putObject(params, (err, data) => {
      if (err) reject(err)
      else resolve(data)
    })
  })
}

const s3GetBucketLocation = bucket => {
  const params = {
    Bucket: bucket,
  }

  return new Promise((resolve, reject) => {
    s3.getBucketLocation(params, (err, data) => {
      if (err) resolve(null)
      else resolve(data.LocationConstraint)
    })
  })
}

const s3HeadObject = key => {
  const params = {
    Bucket: process.env.S3_BUCKET,
    Key: key,
  }

  return new Promise((resolve, reject) => {
    s3.headObject(params, (err, data) => {
      if (err) resolve(null)
      else resolve(data)
    })
  })
}

const expiryPattern = /expiry-date="([^"]*)"/
const getDateFromExpiration = expiration =>
  new Date(expiryPattern.exec(expiration)[1])
