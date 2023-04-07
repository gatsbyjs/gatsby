const path = require(`path`)

module.exports = {
  "/ssr1/": path.join(__dirname, `prod-engines-output`, `ssr1.html`),
  "/slice-usage-ssr/": path.join(
    __dirname,
    `prod-engines-output`,
    `slice-usage-ssr.html`
  ),
}
