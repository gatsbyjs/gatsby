import "@total-typescript/ts-reset";
import type {
  CreateWebpackConfigArgs,
  GatsbyNode,
  PluginCallback,
  PluginOptions,
  Reporter,
} from "gatsby";
import fs from "node:fs";
import path from "node:path";

import sharp from "sharp";
import { createContentDigest, slash } from "gatsby-core-utils";
import { defaultIcons, addDigestToPath, favicons } from "./common";
import { doesIconExist } from "./node-helpers";

import pluginOptionsSchema from "./pluginOptionsSchema";

async function generateIcon(
  icon: { sizes: string; src: string },
  srcIcon?: string | undefined,
): Promise<sharp.OutputInfo> {
  const imgPath = path.join("public", icon.src);

  // console.log(`generating icon: `, icon.src)
  // if (fs.existsSync(imgPath)) {
  //   console.log(`icon already Exists, not regenerating`)
  //   return true
  // }
  const size = parseInt(icon.sizes.substring(0, icon.sizes.lastIndexOf("x")));

  // For vector graphics, instruct sharp to use a pixel density
  // suitable for the resolution we're rasterizing to.
  // For pixel graphics sources this has no effect.
  // Sharp accept density from 1 to 2400
  const density = Math.min(2400, Math.max(1, size));

  return sharp(srcIcon, { density })
    .resize({
      width: size,
      height: size,
      fit: "contain",
      background: { r: 255, g: 255, b: 255, alpha: 0 },
    })
    .toFile(imgPath);
}

async function checkCache(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cache: Map<string, any>,
  icon: {
    src: string;
    sizes: string;
    type: string;
  },
  srcIcon: string | undefined,
  srcIconDigest: string,
  callback: (
    icon: {
      src: string;
      sizes: string;
      type: string;
    },
    srcIcon?: string | undefined,
  ) => Promise<sharp.OutputInfo>,
): Promise<void> {
  const cacheKey = createContentDigest(
    `${icon?.src ?? ""}${srcIcon}${srcIconDigest}`,
  );

  const created = cache.get(cacheKey);
  if (!created) {
    cache.set(cacheKey, true);

    try {
      await callback(icon, srcIcon);
    } catch (e) {
      cache.set(cacheKey, false);
      throw e;
    }
  }
}

export { pluginOptionsSchema };

/**
 * Setup pluginOption defaults
 * TODO: Remove once pluginOptionsSchema is stable
 */
export const onPreInit: GatsbyNode["onPreInit"] = (_, pluginOptions) => {
  pluginOptions.cache_busting_mode =
    pluginOptions.cache_busting_mode ?? "query";
  pluginOptions.include_favicon = pluginOptions.include_favicon ?? true;
  pluginOptions.legacy = pluginOptions.legacy ?? true;
  pluginOptions.theme_color_in_head = pluginOptions.theme_color_in_head ?? true;
  pluginOptions.cacheDigest = null;

  if (pluginOptions.cache_busting_mode !== "none" && pluginOptions.icon) {
    pluginOptions.cacheDigest = createContentDigest(
      fs.readFileSync(pluginOptions.icon),
    );
  }
};

export const onPostBootstrap: GatsbyNode["onPostBootstrap"] =
  async function onPostBootstrap(
    { reporter, parentSpan, basePath },
    { localize, ...manifest },
    callback: PluginCallback<void>,
  ) {
    const activity = reporter.activityTimer(
      "Build manifest and related icons",
      {
        parentSpan,
      },
    );

    activity.start();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cache = new Map<string, any>();

    await makeManifest({ cache, reporter, pluginOptions: manifest, basePath });

    if (Array.isArray(localize)) {
      await Promise.all(
        localize.map((locale) => {
          let cacheModeOverride = {};

          /* localization requires unique filenames for output files if a different src Icon is defined.
           otherwise one language would override anothers icons in automatic mode.
        */
          if (
            Object.prototype.hasOwnProperty.call(locale, "icon") &&
            !Object.prototype.hasOwnProperty.call(locale, "icons")
          ) {
            // console.debug(`OVERRIDING CACHE BUSTING`, locale)
            cacheModeOverride = { cache_busting_mode: "name" };
          }

          return makeManifest({
            cache,
            reporter,
            pluginOptions: {
              ...manifest,
              ...locale,
              ...cacheModeOverride,
            },
            shouldLocalize: true,
            basePath,
          });
        }),
      );
    }

    callback(null, undefined);

    activity.end();
  };

/**
 * The complete Triforce, or one or more components of the Triforce.
 * @typedef {Object} makeManifestArgs
 * @property {Object} cache - from gatsby-node api
 * @property {Object} reporter - from gatsby-node api
 * @property {Object} pluginOptions - from gatsby-node api/gatsby config
 * @property {boolean?} shouldLocalize
 * @property {string?} basePath - string of base path frpvided by gatsby node
 */

/**
 * Build manifest
 * @param {makeManifestArgs}
 */
async function makeManifest({
  cache,
  reporter,
  pluginOptions,
  shouldLocalize = false,
  basePath = "",
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cache: Map<string, any>;
  reporter: Reporter;
  pluginOptions: PluginOptions;
  shouldLocalize?: boolean | undefined;
  basePath?: string | undefined;
}): Promise<void> {
  const { icon, ...manifest } = pluginOptions;
  const suffix =
    shouldLocalize && pluginOptions.lang ? `_${pluginOptions.lang}` : "";

  const faviconIsEnabled = pluginOptions.include_favicon ?? true;

  // Delete options we won't pass to the manifest.webmanifest.
  delete manifest.plugins;
  delete manifest.legacy;
  delete manifest.theme_color_in_head;
  delete manifest.cache_busting_mode;
  delete manifest.crossOrigin;
  delete manifest.icon_options;
  delete manifest.include_favicon;
  delete manifest.cacheDigest;

  // If icons are not manually defined, use the default icon set.
  if (!manifest.icons) {
    manifest.icons = [...defaultIcons];
  }

  // Specify extra options for each icon (if requested).
  if (pluginOptions.icon_options) {
    manifest.icons = manifest.icons.map((icon) => {
      return {
        ...pluginOptions.icon_options,
        ...icon,
      };
    });
  }

  // Determine destination path for icons.
  const paths = {};
  manifest.icons.forEach((icon) => {
    const iconPath = path.join("public", path.dirname(icon.src));
    if (!paths[iconPath]) {
      const exists = fs.existsSync(iconPath);
      // create destination directory if it doesn't exist
      if (!exists) {
        fs.mkdirSync(iconPath, { recursive: true });
      }
      paths[iconPath] = true;
    }
  });

  // Only auto-generate icons if a src icon is defined.
  if (typeof icon !== "undefined") {
    // Check if the icon exists
    if (!doesIconExist(icon)) {
      throw new Error(
        `icon (${icon}) does not exist as defined in gatsby-config.js. Make sure the file exists relative to the root of the site.`,
      );
    }

    const sharpIcon = sharp(icon);

    const metadata = await sharpIcon.metadata();

    if (metadata.width !== metadata.height) {
      reporter.warn(
        `The icon(${icon}) you provided to 'gatsby-plugin-manifest' is not square.\n` +
          "The icons we generate will be square and for the best results we recommend you provide a square icon.\n",
      );
    }

    // add cache busting
    const cacheMode =
      typeof pluginOptions.cache_busting_mode !== "undefined"
        ? pluginOptions.cache_busting_mode
        : "query";

    const iconDigest = createContentDigest(fs.readFileSync(icon));

    /**
     * Given an array of icon configs, generate the various output sizes from
     * the source icon image.
     */
    async function processIconSet(
      iconSet: Array<{
        src: string;
        sizes: string;
        type: string;
      }>,
    ): Promise<
      Array<{
        src: string;
        sizes: string;
        type: string;
      }>
    > {
      // if cacheBusting is being done via url query icons must be generated before cache busting runs
      if (cacheMode === "query") {
        for (const dstIcon of iconSet) {
          await checkCache(cache, dstIcon, icon, iconDigest, generateIcon);
        }
      }

      if (cacheMode !== "none") {
        iconSet = iconSet.map((icon) => {
          const newIcon = { ...icon };
          newIcon.src = addDigestToPath(icon.src, iconDigest, cacheMode);
          return newIcon;
        });
      }

      // if file names are being modified by cacheBusting icons must be generated after cache busting runs
      if (cacheMode !== "query") {
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

  // Fix #18497 by prefixing paths
  manifest.icons = manifest.icons.map((icon) => {
    return {
      ...icon,
      src: slash(path.join(basePath, icon.src)),
    };
  });

  if (manifest.start_url) {
    manifest.start_url = path.posix.join(basePath, manifest.start_url);
  }

  // Write manifest
  fs.writeFileSync(
    path.join("public", `manifest${suffix}.webmanifest`),
    JSON.stringify(manifest),
  );
}

export const onCreateWebpackConfig: GatsbyNode["onCreateWebpackConfig"] =
  function onCreateWebpackConfig(
    { actions, plugins }: CreateWebpackConfigArgs,
    pluginOptions: PluginOptions,
  ): void {
    actions.setWebpackConfig({
      plugins: [
        plugins.define({
          __MANIFEST_PLUGIN_HAS_LOCALISATION__:
            pluginOptions.localize && pluginOptions.localize.length,
        }),
      ],
    });
  };
