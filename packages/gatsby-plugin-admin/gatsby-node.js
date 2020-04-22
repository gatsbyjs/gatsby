const path = require(`path`)
const express = require(`express`)
const pkg = require('gatsby-admin/package.json');

exports.onCreateDevServer = ({ app, store, reporter }) => {
  app.use(`/___admin`, express.static(path.join(require.resolve(`gatsby-admin`).replace(`/${pkg.main}`, ``), `public`)))
}