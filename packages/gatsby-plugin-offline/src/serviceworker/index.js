import { precache } from "gatsby-plugin-offline/serviceworker/precache.js"
import { setup } from "gatsby-plugin-offline/serviceworker/setup.js"
import { registerDefaultRoutes } from "gatsby-plugin-offline/serviceworker/default-routes.js"
import { setupOfflineRouting } from "gatsby-plugin-offline/serviceworker/offline.js"
import { googleAnalytics } from "gatsby-plugin-offline/serviceworker/google-analytics.js"

precache()
setup()
registerDefaultRoutes()
setupOfflineRouting()
googleAnalytics()
