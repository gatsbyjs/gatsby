const fs = require(`fs`)
const path = require(`path`)
// TODO(v5): use gatsby/sharp
const getSharpInstance = require(`./safe-sharp`)
const { createContentDigest, slash } = require(`gatsby-core-utils`)
const { defaultIcons, addDigestToPath, favicons } = require(`./common`)
const { doesIconExist } = require(`./node-helpers`)

const pluginOptionsSchema = require(`./pluginOptionsSchema`)

async function generateIcon(icon, srcIcon) {
  const imgPath = path.join(`public`, icon.src)

  const size = parseInt(icon.sizes.substring(0, icon.sizes.lastIndexOf(`x`)), 10)
  const density = Math.min(2400, Math.max(1, size))

  const sharp = await getSharpInstance()
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

exports.onPreInit = (_, pluginOptions) => {
  const defaultOptions = {
    cache_busting_mode: 'query',
    include_favicon: true,
    legacy: true,
    theme_color_in_head: true,
    cacheDigest: null,
  };

  const options = { ...defaultOptions, ...pluginOptions };

  if (options.cache_busting_mode !== 'none' && options.icon) {
    options.cacheDigest = createContentDigest(fs.readFileSync(options.icon));
  }

  Object.assign(pluginOptions, options);
};

exports.onPostBootstrap = async (
  { reporter, parentSpan, basePath, assetPrefix, pathPrefix },
  { localize, ...manifest }
) => {
  const activity = reporter.activityTimer('Build manifest and related icons', {
    parentSpan,
  });

  activity.start();

  const cache = new Map();

  const validatePrefix = (prefix, name) => {
    if (typeof prefix !== 'string') {
      return '';
    }
    if (!prefix.trim().startsWith('/')) {
      reporter.warn(`${name} should start with '/'`);
    }
    return prefix.trim();
  };

  const validateOptions = (options) => {
    if (!options || typeof options !== 'object' || !options.icon) {
      throw new Error(
        'pluginOptions must be an object and include an "icon" property'
      );
    }
  };

  const createManifestArgs = ({
    cache,
    reporter,
    manifest,
    basePath,
    assetPrefix,
    pathPrefix,
  }) => {
    validateOptions(manifest);
    return {
      cache,
      reporter,
      pluginOptions: manifest,
      basePath,
      assetPrefix: validatePrefix(assetPrefix, 'assetPrefix'),
      pathPrefix: validatePrefix(pathPrefix, 'pathPrefix'),
    };
  };

  try {
    await makeManifest(
      createManifestArgs({
        cache,
        reporter,
        manifest,
        basePath,
        assetPrefix,
        pathPrefix,
      })
    );
  } catch (error) {
    reporter.panic('Error in onPostBootstrap: ', error);
  }

  if (Array.isArray(localize)) {
    const locales = [...localize];
    await Promise.all(
      locales.map(async (locale) => {
        let cacheModeOverride = {};

        if (locale.icon && !locale.icons) {
          cacheModeOverride = { cache_busting_mode: 'name' };
        }

        const localizedManifest = {
          ...manifest,
          ...locale,
          ...cacheModeOverride,
        };

        const validatedAssetPrefix = validatePrefix(assetPrefix, 'assetPrefix');
        const validatedPathPrefix = validatePrefix(pathPrefix, 'pathPrefix');

        try {
          await makeManifest({
            cache,
            reporter,
            pluginOptions: localizedManifest,
            shouldLocalize: true,
            basePath: basePath || '',
            assetPrefix: validatedAssetPrefix,
            pathPrefix: validatedPathPrefix,
          });
        } catch (error) {
          reporter.error(
            `Error processing locale ${locale.lang || 'unknown'}: `,
            error
          );
        }
      })
    );
  }
  activity.end();
};

const makeManifest = async ({
  cache,
  reporter,
  pluginOptions,
  shouldLocalize = false,
  basePath = '',
  assetPrefix = '',
  pathPrefix = '',
}) => {
  const { icon, ...manifest } = pluginOptions;
  const suffix =
    shouldLocalize && pluginOptions.lang ? `_${pluginOptions.lang}` : '';

  const faviconIsEnabled = pluginOptions.include_favicon ?? true;

  delete manifest.plugins;
  delete manifest.legacy;
  delete manifest.theme_color_in_head;
  delete manifest.cache_busting_mode;
  delete manifest.crossOrigin;
  delete manifest.icon_options;
  delete manifest.include_favicon;
  delete manifest.cacheDigest;

  if (!manifest.icons) {
    manifest.icons = [...defaultIcons];
  }

  if (pluginOptions.icon_options) {
    manifest.icons = manifest.icons.map((icon) => ({
      ...pluginOptions.icon_options,
      ...icon,
    }));
  }
  const iconPaths = manifest.icons.map((icon) => ({
    dir: path.resolve('public', path.dirname(icon.src)),
    src: icon.src,
  }));

  const uniqueIconDirs = Array.from(new Set(iconPaths.map((icon) => icon.dir)));

  const createDirectory = (dir) => {
    fs.mkdirSync(dir, { recursive: true });
  };

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

  if (typeof icon !== 'undefined') {
    if (!doesIconExist(icon)) {
      throw new Error(
        `icon (${icon}) does not exist as defined in gatsby-config.js. Make sure the file exists relative to the root of the site.`
      );
    }

    const sharp = await getSharpInstance();
    const sharpIcon = sharp(icon);

    const metadata = await sharpIcon.metadata();

    if (metadata.width !== metadata.height) {
      reporter.warn(
        `The icon(${icon}) you provided to 'gatsby-plugin-manifest' is not square.\n` +
          `The icons we generate will be square and for the best results we recommend you provide a square icon.\n`
      );
    }

    const cacheMode =
      typeof pluginOptions.cache_busting_mode !== 'undefined'
        ? pluginOptions.cache_busting_mode
        : 'query';

    const iconDigest = createContentDigest(fs.readFileSync(icon));

    const processIconSet = async (iconSet) => {
      if (cacheMode === 'query') {
        for (const dstIcon of iconSet) {
          await checkCache(cache, dstIcon, icon, iconDigest, generateIcon);
        }
      }

      if (cacheMode !== 'none') {
        iconSet = iconSet.map((icon) => {
          const newIcon = { ...icon };
          newIcon.src = addDigestToPath(icon.src, iconDigest, cacheMode);
          return newIcon;
        });
      }

      if (cacheMode !== 'query') {
        for (const dstIcon of iconSet) {
          await checkCache(cache, dstIcon, icon, iconDigest, generateIcon);
        }
      }

      return iconSet;
    };

    manifest.icons = await processIconSet(manifest.icons);

    if (faviconIsEnabled) {
      await processIconSet(favicons);

      if (metadata.format === 'svg') {
        fs.copyFileSync(icon, path.join('public', 'favicon.svg'));
      }
    }
  }

  const prefixPath = (src) =>
    slash([assetPrefix, pathPrefix, basePath, src].filter(Boolean).join('/'));

  manifest.icons = Array.isArray(manifest.icons)
    ? manifest.icons.reduce((valid, icon) => {
        if (icon?.src) {
          valid.push({ ...icon, src: prefixPath(icon.src) });
        } else {
          reporter.warn('Skipping invalid icon:', icon);
        }
        return valid;
      }, [])
    : [];
  if (manifest.icons.length > 0) {
    const iconCount = manifest.icons.length;
    const iconWord = iconCount === 1 ? 'icon' : 'icons';
    reporter.info(`Processed ${iconCount} ${iconWord}.`);
  } else {
    reporter.warn('No valid icons found in manifest.');
  }

  if (manifest.start_url) {
    manifest.start_url = slash([assetPrefix, pathPrefix, basePath, manifest.start_url].filter(Boolean).join('/'));
  } else {
    reporter.warn('manifest.start_url is not defined');
  }

  const manifestPath = path.join('public', `manifest${suffix}.webmanifest`);

  const writeManifest = async () => {
    try {
      await fs.promises.mkdir(path.dirname(manifestPath), { recursive: true });

      const optimizedManifest = JSON.stringify(manifest);
      await fs.promises.writeFile(manifestPath, optimizedManifest, 'utf8');

      reporter.success(`Manifest written to ${manifestPath}`);

      const criticalFields = [
        'name',
        'short_name',
        'start_url',
        'display',
        'background_color',
        'theme_color',
      ];
      const missingFields = criticalFields.filter((field) => !manifest[field]);

      if (missingFields.length) {
        reporter.warn(
          `Missing critical fields in manifest: ${missingFields.join(', ')}`
        );
      }

      if (!manifest.icons || manifest.icons.length === 0) {
        reporter.warn('No icons defined in manifest');
      } else {
        const iconSizes = manifest.icons.map((icon) => parseInt(icon.sizes));
        if (!iconSizes.includes(192) || !iconSizes.includes(512)) {
          reporter.warn(
            'Manifest should include at least 192x192 and 512x512 icons'
          );
        }
      }
    } catch (error) {
      reporter.panicOnBuild(`Failed to write manifest: ${error.message}`);
    }
  };

  await writeManifest();
};
const { DefinePlugin } = require('webpack');

exports.onCreateWebpackConfig = ({ actions }, pluginOptions) => {
  const hasLocalization = Boolean(pluginOptions.localize && pluginOptions.localize.length);
  actions.setWebpackConfig({
    plugins: [
      new DefinePlugin({
        __MANIFEST_PLUGIN_HAS_LOCALIZATION__: JSON.stringify(hasLocalization),
      }),
    ],
  });
};