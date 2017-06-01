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
 * exports.replaceServerPageRender = ({ component }) => {
 *   const html = renderToString(component)
 *   const inlinedHtml = inline(html)
 *
 *   return { body: inlinedHtml }
 * }
 */
exports.replaceServerPageRender = true

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

/**
 * Called after every page HTML render. It's a very common pattern for
 * React.js libraries that support server rendering to after each server
 * render, pull out data of various sorts generated during the render to add
 * to your HTML.
 *
 * This API is preferable to [`replaceServerBodyRender`](#replaceServerBodyRender]
 * as multiple plugins can implement this API where only one plugin
 * can take over server rendering. However, if your library requires taking over server rendering then
 * that's the one to use
 *
 * @example
 * // From gatsby-plugin-react-helmet.
 * import helmet from "react-helmet"
 *
 * exports.onRenderBody = (
 *   { headComponents, ...otherProps },
 *   pluginOptions
 * ) => {
 *   return {
 *     ...otherProps,
 *     headComponents: headComponents.concat([
 *       helmet.title.toComponent(),
 *       helmet.meta.toComponent(),
 *       helmet.link.toComponent(),
 *     ]),
 *   }
 * }
 */
exports.onRenderBody = true
