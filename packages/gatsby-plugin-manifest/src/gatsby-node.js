import * as fs from 'fs'
import * as path from 'path'
// TODO(v5): use gatsby/sharp
import getSharpInstance from './safe-sharp'
import { createContentDigest, slash } from 'gatsby-core-utils'
import { defaultIcons, addDigestToPath, favicons } from './common'
import { doesIconExist } from './node-helpers'

import pluginOptionsSchema from './pluginOptionsSchema'

async function generateIcon(icon, srcIcon) {
  const imgPath = path.join('public', icon.src)

  // console.log('generating icon: ', icon.src);
  // if (fs.existsSync(imgPath)) {
  //   console.log('icon already Exists, not regenerating');
  //   return true;
  // }
  const size = parseInt(icon.sizes.substring(0, icon.sizes.lastIndexOf('x')))

  // For vector graphics, instruct sharp to use a pixel density
  // suitable for the resolution we're rasterizing to.
  // For pixel graphics sources this has no effect.
  // Sharp accept density from 1 to 2400
  const density = Math.min(2400, Math.max(1, size))

  const sharp = await getSharpInstance()
  return sharp(srcIcon, { density })
    .resize({
      width: size,
      height: size,
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 0 },
    })
    .toFile(imgPath)
}

async function checkCache(cache, icon, srcIcon, srcIconDigest, callback) {
  const cacheKey = createContentDigest(`${icon.src}${srcIcon}${srcIconDigest}`)

  const created = cache.get(cacheKey, srcIcon)
  if (!created) {
    cache.set(cacheKey, true)

    try {
      await callback(icon, srcIcon)
    } catch (e) {
      cache.set(cacheKey, false)
      throw e
    }
  }
}

exports.pluginOptionsSchema = pluginOptionsSchema

/**
 * Setup pluginOption defaults
 * TODO: Remove once pluginOptionsSchema is stable
 */
exports.onPreInit = (_, pluginOptions) => {
  pluginOptions.cache_busting_mode = pluginOptions.cache_busting_mode ?? 'query'
  pluginOptions.include_favicon = pluginOptions.include_favicon ?? true
  pluginOptions.legacy = pluginOptions.legacy ?? true
  pluginOptions.theme_color_in_head = pluginOptions.theme_color_in_head ?? true
  pluginOptions.cacheDigest = null

  if (pluginOptions.cache_busting_mode !== 'none' && pluginOptions.icon) {
    pluginOptions.cacheDigest = createContentDigest(
      fs.readFileSync(pluginOptions.icon)
    )
  }
}

exports.onPostBootstrap = async (
  { reporter, parentSpan, basePath, assetPrefix, pathPrefix },
  { localize, ...manifest }
) => {
  const activity = reporter.activityTimer('Build manifest and related icons', {
    parentSpan,
  })

  activity.start()

  const cache = new Map()

  function validatePrefix(prefix, name) {
    if (typeof prefix !== 'string') {
      return ''
    }
    if (!prefix.trim().startsWith('/')) {
      reporter.warn(`${name} should start with '/'`)
    }
    return prefix.trim()
  }

  function validateOptions(options) {
    if (!options || typeof options !== 'object' || !options.icon) {
      throw new Error('pluginOptions must be an object and include an "icon" property')
    }
  }

  function createManifestArgs({ cache, reporter, manifest, basePath, assetPrefix, pathPrefix }) {
    validateOptions(manifest)
    return {
      cache,
      reporter,
      pluginOptions: manifest,
      basePath,
      assetPrefix: validatePrefix(assetPrefix, 'assetPrefix'),
      pathPrefix: validatePrefix(pathPrefix, 'pathPrefix'),
    }
  }

  try {
    await makeManifest(createManifestArgs({ cache, reporter, manifest, basePath, assetPrefix, pathPrefix }))
  } catch (error) {
    reporter.panic('Error in onPostBootstrap: ', error)
  }

  if (Array.isArray(localize)) {
    const locales = [...localize]
    await Promise.all(
      locales.map(async (locale) => {
        let cacheModeOverride = {}

        // Ensure unique filenames for output files if a different src Icon is defined.
        if (locale.icon && !locale.icons) {
          cacheModeOverride = { cache_busting_mode: 'name' }
        }

        const localizedManifest = {
          ...manifest,
          ...locale,
          ...cacheModeOverride,
        }

        // Validate and ensure assetPrefix and pathPrefix are properly set
        const validatedAssetPrefix = validatePrefix(assetPrefix, 'assetPrefix')
        const validatedPathPrefix = validatePrefix(pathPrefix, 'pathPrefix')

        try {
          await makeManifest({
            cache,
            reporter,
            pluginOptions: localizedManifest,
            shouldLocalize: true,
            basePath: basePath || '',
            assetPrefix: validatedAssetPrefix,
            pathPrefix: validatedPathPrefix,
          })
        } catch (error) {
          reporter.error(`Error processing locale ${locale.lang || 'unknown'}: `, error)
        }
      })
    )
  }
  activity.end()
}

/**
 * The complete Triforce, or one or more components of the Triforce.
 * @typedef {Object} makeManifestArgs
 * @property {Object} cache - from gatsby-node api
 * @property {Object} reporter - from gatsby-node api
 * @property {Object} pluginOptions - from gatsby-node api/gatsby config
 * @property {boolean?} shouldLocalize
 * @property {string?} basePath - string of base path provided by gatsby node
 * @property {string?} assetPrefix - string of asset prefix provided by gatsby node
 * @property {string?} pathPrefix - string of path prefix provided by gatsby node
 */

/**
 * Build manifest
 * @param {makeManifestArgs}
 */
const makeManifest = async ({
  cache,
  reporter,
  pluginOptions,
  shouldLocalize = false,
  basePath = '',
  assetPrefix = '',
  pathPrefix = '',
}) => {
  const { icon, ...manifest } = pluginOptions
  const suffix =
    shouldLocalize && pluginOptions.lang ? `_${pluginOptions.lang}` : ''

  const faviconIsEnabled = pluginOptions.include_favicon ?? true

  // Delete options we won't pass to the manifest.webmanifest.
  delete manifest.plugins
  delete manifest.legacy
  delete manifest.theme_color_in_head
  delete manifest.cache_busting_mode
  delete manifest.crossOrigin
  delete manifest.icon_options
  delete manifest.include_favicon
  delete manifest.cacheDigest

  // If icons are not manually defined, use the default icon set.
  if (!manifest.icons) {
    manifest.icons = [...defaultIcons]
  }

  // Specify extra options for each icon (if requested).
  if (pluginOptions.icon_options) {
    manifest.icons = manifest.icons.map((icon) => {
      return {
        ...pluginOptions.icon_options,
        ...icon,
      }
    })
  }
  const iconPaths = manifest.icons.map((icon) => ({
    dir: path.resolve('public', path.dirname(icon.src)),
    src: icon.src,
  }));

  const uniqueIconDirs = Array.from(new Set(iconPaths.map((icon) => icon.dir)));

  const createDirectory = (dir) => {
    const dirParts = dir.split(path.sep);
    let currentPath = '';
    for (const part of dirParts) {
      currentPath = path.join(currentPath, part);
      if (!fs.existsSync(currentPath)) {
        fs.mkdirSync(currentPath);
      }
    }
  };

  uniqueIconDirs.forEach((dir) => {
    try {
      createDirectory(dir);
    } catch (error) {
      reporter.error(`Failed to create directory at ${dir}: ${error.message}`);
      throw error;
    }
  });

  // Only auto-generate icons if a src icon is defined.
  if (typeof icon !== 'undefined') {
    // Check if the icon exists
    if (!doesIconExist(icon)) {
      throw new Error(
        `icon (${icon}) does not exist as defined in gatsby-config.js. Make sure the file exists relative to the root of the site.`
      )
    }

    const sharp = await getSharpInstance()
    const sharpIcon = sharp(icon)

    const metadata = await sharpIcon.metadata()

    if (metadata.width !== metadata.height) {
      reporter.warn(
        `The icon(${icon}) you provided to 'gatsby-plugin-manifest' is not square.\n` +
          `The icons we generate will be square and for the best results we recommend you provide a square icon.\n`
      )
    }

    // add cache busting
    const cacheMode =
      typeof pluginOptions.cache_busting_mode !== 'undefined'
        ? pluginOptions.cache_busting_mode
        : 'query'

    const iconDigest = createContentDigest(fs.readFileSync(icon))

    /**
     * Given an array of icon configs, generate the various output sizes from
     * the source icon image.
     */
    async function processIconSet(iconSet) {
      // if cacheBusting is being done via url query icons must be generated before cache busting runs
      if (cacheMode === 'query') {
        for (const dstIcon of iconSet) {
          await checkCache(cache, dstIcon, icon, iconDigest, generateIcon)
        }
      }

      if (cacheMode !== 'none') {
        iconSet = iconSet.map((icon) => {
          const newIcon = { ...icon }
          newIcon.src = addDigestToPath(icon.src, iconDigest, cacheMode)
          return newIcon
        })
      }

      // if file names are being modified by cacheBusting icons must be generated after cache busting runs
      if (cacheMode !== 'query') {
        for (const dstIcon of iconSet) {
          await checkCache(cache, dstIcon, icon, iconDigest, generateIcon);
        }
      }

      return iconSet;
    }

    manifest.icons = await processIconSet(manifest.icons);

    // If favicon is enabled, apply the same caching policy and generate
    // the resized image(s)
    if (faviconIsEnabled) {
      await processIconSet(favicons);

      if (metadata.format === "svg") {
        fs.copyFileSync(icon, path.join("public", "favicon.svg"));
      }
    }
  }
  // Optimize icon paths and validate
  const prefixPath = src => slash([assetPrefix, pathPrefix, basePath, src].filter(Boolean).join('/'));

  manifest.icons = Array.isArray(manifest.icons)
    ? manifest.icons.reduce((valid, icon) => {
        if (icon?.src) {
          valid.push({ ...icon, src: prefixPath(icon.src) });
        } else {
          reporter.warn(`Skipping invalid icon:`, icon);
        }
        return valid;
      }, [])
    : [];

  manifest.icons.length
    ? reporter.info(`Processed ${manifest.icons.length} icon${manifest.icons.length === 1 ? '' : 's'}.`)
    : reporter.warn(`No valid icons found in manifest.`);

  if (manifest.start_url) {
    manifest.start_url = slash(
      path.join(assetPrefix || '', pathPrefix || '', basePath || '', manifest.start_url)
    );
  } else {
    reporter.warn('manifest.start_url is not defined');
  }

  // Write manifest efficiently
  const manifestPath = path.join("public", `manifest${suffix}.webmanifest`);

  const writeManifest = async () => {
    try {
      await fs.promises.mkdir(path.dirname(manifestPath), { recursive: true });

      const optimizedManifest = JSON.stringify(manifest);
      await fs.promises.writeFile(manifestPath, optimizedManifest, 'utf8');

      reporter.success(`Manifest written to ${manifestPath}`);

      // Validate critical manifest fields
      const criticalFields = ['name', 'short_name', 'start_url', 'display', 'background_color', 'theme_color'];
      const missingFields = criticalFields.filter(field => !manifest[field]);
      
      if (missingFields.length) {
        reporter.warn(`Missing critical fields in manifest: ${missingFields.join(', ')}`);
      }

      // Check icons
      if (!manifest.icons || manifest.icons.length === 0) {
        reporter.warn('No icons defined in manifest');
      } else {
        const iconSizes = manifest.icons.map(icon => parseInt(icon.sizes));
        if (!iconSizes.includes(192) || !iconSizes.includes(512)) {
          reporter.warn('Manifest should include at least 192x192 and 512x512 icons');
        }
      }

    } catch (error) {
      reporter.panicOnBuild(`Failed to write manifest: ${error.message}`);
    }
  };

  await writeManifest();
};

exports.onCreateWebpackConfig = ({ actions, plugins }, pluginOptions) => {
  actions.setWebpackConfig({
    plugins: [
      plugins.define({
        __MANIFEST_PLUGIN_HAS_LOCALISATION__: Boolean(
          pluginOptions.localize && pluginOptions.localize.length
        ),
      }),
    ],
  });
};
