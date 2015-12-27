// Quick hack for having constant reactids when rendering in Server-side
import ServerReactRootIndex from 'react/lib/ServerReactRootIndex'
ServerReactRootIndex.createReactRootIndex = () => {
  return 'gatsby'
};

import React from 'react'
import ReactDOMServer from 'react-dom/server'
import Router from 'react-router'
import find from 'lodash/collection/find'
import filter from 'lodash/collection/filter'
import createRoutes from 'create-routes'
import HTML from 'html'
import app from 'app'
import values from 'config'
import helpers from '../isomorphic/gatsby-helpers'
const link = helpers.link;
let pages = values.pages;
const config = values.config;
let routes = {};
let linkPrefix = config.linkPrefix;
if (!__PREFIX_LINKS__ || !linkPrefix) {
  linkPrefix = ''
}

app.loadContext((pagesReq) => {
  routes = createRoutes(pages, pagesReq);

  // Remove templates files.
  pages = filter(pages, (page) => {
    return page.path !== null
  })
});

module.exports = (locals, callback) => {
  return Router.run([routes], link(locals.path), (Handler, state) => {
    let body;
    let childPages;
    let childrenPaths;
    let html;
    let page;
    page = find(pages, (p) => {
      return linkPrefix + p.path === state.path
    });

    // Pull out direct children of the template for this path.
    childrenPaths = state.routes[state.routes.length - 2].childRoutes.map((route) => {
      return route.path
    });
    if (childrenPaths) {
      childPages = filter(pages, (p) => {
        return childrenPaths.indexOf(linkPrefix + p.path) >= 0
      })
    } else {
      childPages = []
    }

    body = '';
    html = '';
    try {
      body = ReactDOMServer.renderToString(
        <Handler
          config={config}
          pages={pages}
          page={page}
          childPages={childPages}
          state={state} />
      );
      html = '<!DOCTYPE html>\n' + ReactDOMServer.renderToStaticMarkup(
          <HTML config={config} page={page} body={body} />
      )
    } catch (e ) {
      console.error(e.stack)
    }

    return callback(null, html)
  })
};
