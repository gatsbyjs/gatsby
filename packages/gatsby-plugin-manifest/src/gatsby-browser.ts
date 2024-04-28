/* global __MANIFEST_PLUGIN_HAS_LOCALISATION__ */
import {
  withPrefix,
  type GatsbyBrowser,
  type PluginOptions,
  type RouteUpdateArgs,
} from "gatsby";
import getManifestForPathname from "./get-manifest-pathname";

// when we don't have localisation in our manifest, we tree shake everything away
export const onRouteUpdate: GatsbyBrowser["onRouteUpdate"] =
  function onRouteUpdate(
    { location }: RouteUpdateArgs,
    pluginOptions: PluginOptions,
  ): void {
    // @ts-ignore
    if (__MANIFEST_PLUGIN_HAS_LOCALISATION__) {
      const { localize } = pluginOptions;

      const manifestFilename = getManifestForPathname(
        location.pathname,
        localize,
        true,
      );

      const manifestEl = document.head.querySelector('link[rel="manifest"]');
      if (manifestEl) {
        manifestEl.setAttribute("href", withPrefix(manifestFilename));
      }
    }
  };
