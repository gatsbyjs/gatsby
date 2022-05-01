/* global __GATSBY_PLUGIN_OFFLINE_SETTINGS */
import { registerRoute } from "workbox-routing"
import {
  CacheFirst,
  StaleWhileRevalidate,
  NetworkOnly,
} from "workbox-strategies"
import { CacheableResponsePlugin } from "workbox-cacheable-response"

export function registerCypressRoute() {
  registerRoute(/\/__cypress\//, new NetworkOnly(), `GET`)
}

export function registerStaticBuildAssetsRoute() {
  registerRoute(
    /(\.js$|\.css$|static\/)/,
    new CacheFirst({
      plugins: [new CacheableResponsePlugin({ statuses: [200] })],
    }),
    `GET`
  )
}

export function registerPageDataRoute() {
  registerRoute(
    /^https?:.*\/page-data\/.*\.json/,
    new StaleWhileRevalidate({
      plugins: [new CacheableResponsePlugin({ statuses: [200] })],
    }),
    `GET`
  )
}

export function registerDefaultAssetsRoute() {
  registerRoute(
    /^https?:.*\.(png|jpg|jpeg|webp|avif|svg|gif|tiff|js|woff|woff2|json|css)$/,
    new StaleWhileRevalidate({
      plugins: [new CacheableResponsePlugin({ statuses: [200] })],
    }),
    `GET`
  )
}

export function registerGoogleFontsRoute() {
  registerRoute(
    /^https?:\/\/fonts\.googleapis\.com\/css/,
    new StaleWhileRevalidate({
      plugins: [new CacheableResponsePlugin({ statuses: [200] })],
    }),
    `GET`
  )
}

export function registerDefaultRoutes() {
  if (__GATSBY_PLUGIN_OFFLINE_SETTINGS.__cypressSupport) {
    registerCypressRoute()
  }

  registerStaticBuildAssetsRoute()
  registerPageDataRoute()
  registerDefaultAssetsRoute()
  registerGoogleFontsRoute()
}
