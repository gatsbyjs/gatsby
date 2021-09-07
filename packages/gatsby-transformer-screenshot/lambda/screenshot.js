const fs = require(`fs`)
const fsPromises = require(`fs`).promises
const path = require(`path`)
const { createContentDigest } = require(`gatsby-core-utils`)
const AWS = require(`aws-sdk`)
const s3 = new AWS.S3({
  apiVersion: `2006-03-01`,
})

class Screenshot {
  constructor(opts) {
    this.contentDigest = createContentDigest(opts)
    this.key = `${this.contentDigest}.png`
    this.width = opts.width
    this.height = opts.height
    this.url = opts.url
    this.fullPage = opts.fullPage
  }
  async getFile() {}
  async putFile() {}
}

/**
 * put / get a screenshot to the local filesystem
 */
class FSScreenshot extends Screenshot {
  constructor(opts) {
    super(opts)
    const dir = path.join(__dirname, `screenshots`)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir)
    this.fileUrl = path.join(dir, this.key)
  }

  async getFile() {
    // check if file exists
    try {
      let expires
      await fsPromises.access(this.fileUrl)
      return { url: this.fileUrl, expires }
    } catch (error) {
      return false
    }
  }

  async putFile(fileBuffer) {
    await fsPromises.writeFile(this.fileUrl, fileBuffer)
    this.expires = undefined
    return { url: this.fileUrl, expires: this.expires }
  }
}

/**
 * put / get a screenshot to S3
 */
class S3Screenshot extends Screenshot {
  constructor(opts) {
    super(opts)
    // async jiggery pokery
    return (async () => {
      const region = await s3GetBucketLocation(process.env.S3_BUCKET)
      if (!region) throw new Error(`invalid bucket ${process.env.S3_BUCKET}`)
      this.fileUrl = `https://s3-${region}.amazonaws.com/${process.env.S3_BUCKET}/${this.key}`
      return this // when done
    })()
  }

  async getFile() {
    const meta = await s3HeadObject(this.key)
    if (meta && meta.Expiration) {
      this.expires = getDateFromExpiration(meta.Expiration)
      const now = new Date()
      if (now < this.expires) {
        return { url: this.fileUrl, expires: this.expires }
      }
    }
    return false
  }

  async putFile(fileBuffer) {
    const params = {
      ACL: `public-read`,
      Bucket: process.env.S3_BUCKET,
      Key: this.key,
      Body: fileBuffer,
      ContentType: `image/png`,
    }

    let up

    try {
      up = await s3.putObject(params).promise()
      if (up && up.Expiration) {
        this.expires = getDateFromExpiration(up.Expiration)
      }
    } catch (error) {
      console.log(error)
      throw error
    }

    return { url: this.fileUrl, expires: this.expires }
  }
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

const getDateFromExpiration = expiration =>
  new Date(/expiry-date="([^"]*)"/.exec(expiration)[1])

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

module.exports = opts => {
  if (process.env.S3_BUCKET) {
    return new S3Screenshot(opts)
  }

  if (process.env.TEST_WITH_LOCAL_FS) {
    return new FSScreenshot(opts)
  }

  throw new Error(
    `A required environment variable is missing. Set S3_BUCKET or TEST_WITH_LOCAL_FS and try again.`
  )
}
