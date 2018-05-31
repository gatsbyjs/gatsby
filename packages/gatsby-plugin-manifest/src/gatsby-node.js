const fs = require(`fs`)
const path = require(`path`)
const Promise = require(`bluebird`)
const sharp = require(`sharp`)
const defaultIcons = require(`./common.js`).defaultIcons

sharp.simd(true)

function generateIcons(icons, srcIcon) {
  return Promise.map(icons, icon => {
    const size = parseInt(icon.sizes.substring(0, icon.sizes.lastIndexOf(`x`)))
    const imgPath = path.join(`public`, icon.src)

    return sharp(srcIcon)
      .resize(size)
      .toFile(imgPath)
      .then(() => {})
  })
}

exports.onPostBuild = (args, pluginOptions) =>
  new Promise(resolve => {
    const { icon } = pluginOptions
    const manifest = { ...pluginOptions }

    // Delete options we won't pass to the manifest.json.
    delete manifest.plugins
    delete manifest.icon

    // If icons are not manually defined, use the default icon set.
    if (!manifest.icons) {
      manifest.icons = defaultIcons
    }

    // Determine destination path for icons.
    const iconPath = path.join(
      `public`,
      manifest.icons[0].src.substring(0, manifest.icons[0].src.lastIndexOf(`/`))
    )

    //create destination directory if it doesn't exist
    if (!fs.existsSync(iconPath)) {
      fs.mkdirSync(iconPath)
    }

    fs.writeFileSync(
      path.join(`public`, `manifest.webmanifest`),
      JSON.stringify(manifest)
    )

    // Only auto-generate icons if a src icon is defined.
    if (icon !== undefined) {
      generateIcons(manifest.icons, icon).then(() => {
        //images have been generated
        console.log(`done`)
        resolve()
      })
    } else {
      resolve()
    }
  })
