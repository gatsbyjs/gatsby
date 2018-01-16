const aws = require(`aws-sdk`)
const s3 = new aws.S3({ apiVersion: `2006-03-01` })
const fs = require(`fs`)
const tar = require(`tar`)
const puppeteer = require(`puppeteer`)
const config = require(`./config`)

exports.getBrowser = (() => {
  let browser
  return async () => {
    if (typeof browser === `undefined` || !await isBrowserAvailable(browser)) {
      await setupChrome()
      browser = await puppeteer.launch({
        headless: true,
        executablePath: config.executablePath,
        args: config.launchOptionForLambda,
        dumpio: !!exports.DEBUG,
        ignoreHTTPSErrors: true,
      })
      const version = await browser.version()
      debugLog(async b => `launch done: ${version}`)
    }
    return browser
  }
})()

const isBrowserAvailable = async browser => {
  try {
    await browser.version()
  } catch (e) {
    debugLog(e) // not opened etc.
    return false
  }
  return true
}

const setupChrome = async () => {
  if (!await existsExecutableChrome()) {
    if (await existsLocalChrome()) {
      debugLog(`setup local chrome`)
      await setupLocalChrome()
    } else {
      debugLog(`setup s3 chrome`)
      await setupS3Chrome()
    }
    debugLog(`setup done`)
  }
}

const existsLocalChrome = () =>
  new Promise((resolve, reject) => {
    fs.exists(config.localChromePath, exists => {
      resolve(exists)
    })
  })

const existsExecutableChrome = () =>
  new Promise((resolve, reject) => {
    fs.exists(config.executablePath, exists => {
      resolve(exists)
    })
  })

const setupLocalChrome = () =>
  new Promise((resolve, reject) => {
    fs
      .createReadStream(config.localChromePath)
      .on(`error`, err => reject(err))
      .pipe(
        tar.x({
          C: config.setupChromePath,
        })
      )
      .on(`error`, err => reject(err))
      .on(`end`, () => resolve())
  })

const setupS3Chrome = () =>
  new Promise((resolve, reject) => {
    const params = {
      Bucket: config.remoteChromeS3Bucket,
      Key: config.remoteChromeS3Key,
    }
    s3
      .getObject(params)
      .createReadStream()
      .on(`error`, err => reject(err))
      .pipe(
        tar.x({
          C: config.setupChromePath,
        })
      )
      .on(`error`, err => reject(err))
      .on(`end`, () => resolve())
  })

const debugLog = log => {
  if (config.DEBUG) {
    let message = log
    if (typeof log === `function`) message = log()
    Promise.resolve(message).then(message => console.log(message))
  }
}
