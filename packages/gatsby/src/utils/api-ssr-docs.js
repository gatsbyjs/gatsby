/**
 * Let a plugin take over the server rendering of the body
 * component. This is necessary for primarily css-in-js libraries
 * that want to extract critical CSS during server rendering.
 * @example
 * // From gatsby-plugin-glamor
 * import React from "react"
 * import { renderToString } from "react-dom/server"
 * import inline from "glamor-inline"
 *
 * exports.replaceServerBodyRender = ({ component }) => {
 *   const html = renderToString(component)
 *   const inlinedHtml = inline(html)
 *
 *   return { body: inlinedHtml }
 * }
 */
exports.replaceServerBodyRender = true

/**
 * Let a plugin add components to the "headComponents" array.
 * This is very handy for plugins that want to automatically add
 * components into their site's `<head>` instead of asking
 * users to manually modify their site's `<head>`.
 *
 * Many plugins can be plug-n-play using this and
 * [`createPostBodyComponents`](#createPostBodyComponents).
 * @example
 * // From gatsby-plugin-manifest. Add a `<link>` in the head
 * // pointing to the created manifest.json file.
 * import React from "react"
 *
 * exports.createHeadComponents = (args, pluginOptions) => [
 *   <link rel="manifest" href="/manifest.json" />,
 *   <meta name="theme-color" content={pluginOptions.theme_color} />,
 * ]
 */
exports.createHeadComponents = true

/**
 * Let a plugin add components to the "headComponents" array.
 * This is very handy for plugins that want to automatically add
 * components into their site's `<head>` instead of asking
 * users to manually modify their site's `<head>`.
 *
 * Many plugins can be plug-n-play using this and
 * [`createHeadComponents`](#createHeadComponents).
 * @example
 * // From gatsby-plugin-google-analytics. Adds its script snippet.
 * import React from "react"
 *
 * exports.createPostBodyComponents = (args, pluginOptions) => {
 *   if (process.env.NODE_ENV === `production`) {
 *     return [
 *       <script
 *         dangerouslySetInnerHTML={{
 *           __html: `
 *   (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
 *   (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
 *   m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
 *   })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');
 * 
 *   ga('create', '${pluginOptions.trackingId}', 'auto');
 *   ga('send', 'pageview');
 *       `,
 *         }}
 *       />,
 *     ]
 *   }
 * }
 */
exports.createPostBodyComponents = true
