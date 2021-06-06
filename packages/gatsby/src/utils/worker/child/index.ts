export { renderHTMLProd, renderHTMLDev } from "./render-html"
export { loadConfigAndPlugins } from "./load-config-and-plugins"

if (process.send) {
  process.send = (): boolean => false
}
