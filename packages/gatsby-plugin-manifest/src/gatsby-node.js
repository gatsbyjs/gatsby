const fs = require(`fs`)
const path = require(`path`)
const Promise = require(`bluebird`)
const sharp = require(`sharp`)
const {
  defaultIcons,
  doesIconExist,
  addDigestToPath,
  createContentDigest,
} = require(`./common.js`)

sharp.simd(true)

try {
  // Handle Sharp's concurrency based on the Gatsby CPU count
  // See: http://sharp.pixelplumbing.com/en/stable/api-utility/#concurrency
  // See: https://www.gatsbyjs.org/docs/multi-core-builds/
  const cpuCoreCount = require(`gatsby/dist/utils/cpu-core-count`)
  sharp.concurrency(cpuCoreCount())
} catch {
  // if above throws error this probably means that used Gatsby version
  // doesn't support cpu-core-count utility.
}

function generateIcons(icons, srcIcon) {
  return Promise.map(icons, icon => {
    const size = parseInt(icon.sizes.substring(0, icon.sizes.lastIndexOf(`x`)))
    const imgPath = path.join(`public`, icon.src)

    // For vector graphics, instruct sharp to use a pixel density
    // suitable for the resolution we're rasterizing to.
    // For pixel graphics sources this has no effect.
    // Sharp accept density from 1 to 2400
    const density = Math.min(2400, Math.max(1, size))
    return sharp(srcIcon, { density })
      .resize({
        width: size,
        height: size,
        fit: `contain`,
        background: { r: 255, g: 255, b: 255, alpha: 0 },
      })
      .toFile(imgPath)
  })
}

exports.onPostBootstrap = async ({ reporter }, pluginOptions) => {
  const { icon, ...manifest } = pluginOptions

  // Delete options we won't pass to the manifest.webmanifest.
  delete manifest.plugins
  delete manifest.legacy
  delete manifest.theme_color_in_head
  delete manifest.cache_busting_mode
  delete manifest.crossOrigin

  // If icons are not manually defined, use the default icon set.
  if (!manifest.icons) {
    manifest.icons = defaultIcons
  }

  // Specify extra options for each icon (if requested).
  manifest.icons.forEach(icon => {
    Object.assign(icon, pluginOptions.icon_options)
  })

  // Determine destination path for icons.
  const iconPath = path.join(`public`, path.dirname(manifest.icons[0].src))

  //create destination directory if it doesn't exist
  if (!fs.existsSync(iconPath)) {
    fs.mkdirSync(iconPath)
  }

  // Only auto-generate icons if a src icon is defined.
  if (icon !== undefined) {
    // Check if the icon exists
    if (!doesIconExist(icon)) {
      throw `icon (${icon}) does not exist as defined in gatsby-config.js. Make sure the file exists relative to the root of the site.`
    }

    let sharpIcon = sharp(icon)

    let metadata = await sharpIcon.metadata()

    if (metadata.width !== metadata.height) {
      reporter.warn(
        `The icon(${icon}) you provided to 'gatsby-plugin-manifest' is not square.\n` +
          `The icons we generate will be square and for the best results we recommend you provide a square icon.\n`
      )
    }

    //add cache busting
    const cacheMode =
      typeof pluginOptions.cache_busting_mode !== `undefined`
        ? pluginOptions.cache_busting_mode
        : `query`

    //if cacheBusting is being done via url query icons must be generated before cache busting runs
    if (cacheMode === `query`) {
      await generateIcons(manifest.icons, icon)
    }

    if (cacheMode !== `none`) {
      const iconDigest = createContentDigest(fs.readFileSync(icon))

      manifest.icons.forEach(icon => {
        icon.src = addDigestToPath(icon.src, iconDigest, cacheMode)
      })
    }

    //if file names are being modified by cacheBusting icons must be generated after cache busting runs
    if (cacheMode !== `query`) {
      await generateIcons(manifest.icons, icon)
    }
  }

  //Write manifest
  fs.writeFileSync(
    path.join(`public`, `manifest.webmanifest`),
    JSON.stringify(manifest)
  )
}
