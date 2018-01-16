const setup = require(`./starter-kit/setup`)

const crypto = require(`crypto`)
const fs = require(`fs`)

const tmp = require(`tmp`)
const AWS = require(`aws-sdk`)
const s3 = new AWS.S3({
  apiVersion: `2006-03-01`,
})

exports.handler = async (event, context, callback) => {
  // For keeping the browser launch
  context.callbackWaitsForEmptyEventLoop = false

  const url = event.url

  if (!url) {
    callback(`no url provided`)
    return
  }

  const width = event.width || 1024
  const height = event.height || 768

  const browser = await setup.getBrowser()
  exports
    .run(browser, url, width, height)
    .then(result => {
      callback(null, result)
    })
    .catch(err => {
      callback(err)
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

  const temp = await tmpFile({ postfix: `.png` })
  await page.screenshot({ path: temp.path })
  const up = await s3FileUpload(temp.path, key)
  await tmpCleanup(temp)

  await page.close()

  let expires

  if (up && up.Expiration) {
    expires = getDateFromExpiration(up.Expiration)
  }

  return { url: screenshotUrl, expires }
}

const tmpFile = options =>
  new Promise((resolve, reject) => {
    tmp.file(options || {}, (err, path, fd, cleanupCallback) => {
      if (err) reject(err)
      else resolve({ path, fd, cleanupCallback })
    })
  })

const tmpCleanup = temp =>
  new Promise((resolve, reject) => {
    temp.cleanupCallback(resolve)
  })

const s3FileUpload = (path, key) => {
  const params = {
    ACL: `public-read`,
    Bucket: process.env.S3_BUCKET,
    Key: key,
    Body: fs.createReadStream(path, { autoClose: true }),
  }

  return new Promise((resolve, reject) => {
    s3.upload(params, (err, data) => {
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
