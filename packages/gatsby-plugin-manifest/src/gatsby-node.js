import fs from "fs"
import path from "path"
import sharp from "./safe-sharp"
import { createContentDigest, cpuCoreCount } from "gatsby-core-utils"
import { defaultIcons, doesIconExist, addDigestToPath } from "./common"

sharp.simd(true)

// Handle Sharp's concurrency based on the Gatsby CPU count
// See: http://sharp.pixelplumbing.com/en/stable/api-utility/#concurrency
// See: https://www.gatsbyjs.org/docs/multi-core-builds/
sharp.concurrency(cpuCoreCount())

async function generateIcon(icon, srcIcon) {
  const imgPath = path.join(`public`, icon.src)

  // console.log(`generating icon: `, icon.src)
  // if (fs.existsSync(imgPath)) {
  //   console.log(`icon already Exists, not regenerating`)
  //   return true
  // }
  const size = parseInt(icon.sizes.substring(0, icon.sizes.lastIndexOf(`x`)))

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
}

async function checkCache(cache, icon, srcIcon, srcIconDigest, callback) {
  const cacheKey = createContentDigest(`${icon.src}${srcIcon}${srcIconDigest}`)

  let created = cache.get(cacheKey, srcIcon)

  if (!created) {
    cache.set(cacheKey, true)

    try {
      // console.log(`creating icon`, icon.src, srcIcon)
      await callback(icon, srcIcon)
    } catch (e) {
      cache.set(cacheKey, false)
      throw e
    }
  } else {
    // console.log(`icon exists`, icon.src, srcIcon)
  }
}

exports.onPostBootstrap = async (
  { reporter, parentSpan },
  { localize, ...manifest }
) => {
  const activity = reporter.activityTimer(`Build manifest and related icons`, {
    parentSpan,
  })
  activity.start()

  let cache = new Map()

  await makeManifest(cache, reporter, manifest)

  if (Array.isArray(localize)) {
    const locales = [...localize]
    await Promise.all(
      locales.map(locale => {
        let cacheModeOverride = {}

        /* localization requires unique filenames for output files if a different src Icon is defined.
           otherwise one language would override anothers icons in automatic mode.
        */
        if (locale.hasOwnProperty(`icon`) && !locale.hasOwnProperty(`icons`)) {
          // console.debug(`OVERRIDING CACHE BUSTING`, locale)
          cacheModeOverride = { cache_busting_mode: `name` }
        }

        return makeManifest(
          cache,
          reporter,
          {
            ...manifest,
            ...locale,
            ...cacheModeOverride,
          },
          true
        )
      })
    )
  }
  activity.end()
}

const makeManifest = async (cache, reporter, pluginOptions, shouldLocalize) => {
  const { icon, ...manifest } = pluginOptions
  const suffix =
    shouldLocalize && pluginOptions.lang ? `_${pluginOptions.lang}` : ``

  // Delete options we won't pass to the manifest.webmanifest.
  delete manifest.plugins
  delete manifest.legacy
  delete manifest.theme_color_in_head
  delete manifest.cache_busting_mode
  delete manifest.crossOrigin
  delete manifest.icon_options
  delete manifest.include_favicon

  // If icons are not manually defined, use the default icon set.
  if (!manifest.icons) {
    manifest.icons = [...defaultIcons]
  }

  // Specify extra options for each icon (if requested).
  if (pluginOptions.icon_options) {
    manifest.icons = manifest.icons.map(icon => {
      return {
        ...pluginOptions.icon_options,
        ...icon,
      }
    })
  }

  // Determine destination path for icons.
  let paths = {}
  manifest.icons.forEach(icon => {
    const iconPath = path.join(`public`, path.dirname(icon.src))
    if (!paths[iconPath]) {
      const exists = fs.existsSync(iconPath)
      //create destination directory if it doesn't exist
      if (!exists) {
        fs.mkdirSync(iconPath)
      }
      paths[iconPath] = true
    }
  })

  // Only auto-generate icons if a src icon is defined.
  if (icon !== undefined) {
    // Check if the icon exists
    if (!doesIconExist(icon)) {
      throw `icon (${icon}) does not exist as defined in gatsby-config.js. Make sure the file exists relative to the root of the site.`
    }

    const sharpIcon = sharp(icon)

    const metadata = await sharpIcon.metadata()

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

    const iconDigest = createContentDigest(fs.readFileSync(icon))

    //if cacheBusting is being done via url query icons must be generated before cache busting runs
    if (cacheMode === `query`) {
      await Promise.all(
        manifest.icons.map(dstIcon =>
          checkCache(cache, dstIcon, icon, iconDigest, generateIcon)
        )
      )
    }

    if (cacheMode !== `none`) {
      manifest.icons = manifest.icons.map(icon => {
        let newIcon = { ...icon }
        newIcon.src = addDigestToPath(icon.src, iconDigest, cacheMode)
        return newIcon
      })
    }

    //if file names are being modified by cacheBusting icons must be generated after cache busting runs
    if (cacheMode !== `query`) {
      await Promise.all(
        manifest.icons.map(dstIcon =>
          checkCache(cache, dstIcon, icon, iconDigest, generateIcon)
        )
      )
    }
  }

  //Write manifest
  fs.writeFileSync(
    path.join(`public`, `manifest${suffix}.webmanifest`),
    JSON.stringify(manifest)
  )
}

exports.onCreateWebpackConfig = ({ actions, plugins }, pluginOptions) => {
  actions.setWebpackConfig({
    plugins: [
      plugins.define({
        __MANIFEST_PLUGIN_HAS_LOCALISATION__:
          pluginOptions.localize && pluginOptions.localize.length,
      }),
    ],
  })
}
