const fs = require(`fs`)
const Promise = require(`bluebird`)
const sharp = require(`sharp`)

// default icons for generating icons
const defaultIcons = [
  {
      "src": `icons/icon-48x48.png`,
      "sizes": `48x48`,
      "type": `image/png`,
  },
  {
      "src": `icons/icon-72x72.png`,
      "sizes": `72x72`,
      "type": `image/png`,
  },
  {
      "src": `icons/icon-96x96.png`,
      "sizes": `96x96`,
      "type": `image/png`,
  },
  {
      "src": `icons/icon-144x144.png`,
      "sizes": `144x144`,
      "type": `image/png`,
  },
  {
      "src": `icons/icon-192x192.png`,
      "sizes": `192x192`,
      "type": `image/png`,
  },
  {
      "src": `icons/icon-256x256.png`,
      "sizes": `256x256`,
      "type": `image/png`,
  },
  {
      "src": `icons/icon-384x384.png`,
      "sizes": `384x384`,
      "type": `image/png`,
  },
  {
      "src": `icons/icon-512x512.png`,
      "sizes": `512x512`,
      "type": `image/png`,
  },
]

sharp.simd(true)

function generateIcons(icons, srcIcon) {
  return Promise.map(icons, icon => {
    const size = parseInt(icon.sizes.substring(0, icon.sizes.lastIndexOf(`x`)))
    const imgPath = `./public/` + icon.src
    
    return sharp(srcIcon)
      .resize(size)
      .toFile(imgPath)
      .then(() => {
      })
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
    const iconPath = `./public/` + manifest.icons[0].src.substring(0, manifest.icons[0].src.lastIndexOf(`/`))

    //create destination directory if it doesn't exist
    if (!fs.existsSync(iconPath)){
      fs.mkdirSync(iconPath)
    }

    fs.writeFileSync(`${iconPath}/manifest.json`, JSON.stringify(manifest))
    
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
