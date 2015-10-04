var React = require('react');
var Router = require('react-router');
var find = require('lodash/collection/find');
var filter = require('lodash/collection/filter');
var createRoutes = require('create-routes');
var HTML = require('html');
var app = require('app');
var values = require('config');

var pages = values.pages, config = values.config;
var routes = {};

app.loadContext(function(pagesReq) {
  routes = createRoutes(pages, pagesReq);

  // Remove templates files.
  return pages = filter(pages, function(page) {
    return page.path != null;
  });
});

module.exports = function(locals, callback) {
  return Router.run([routes], locals.path, function(Handler, state) {
    var body, childPages, childrenPaths, html, page;
    page = find(pages, function(page) {
      return page.path === state.pathname;
    });

    // Pull out direct children of the template for this path.
    childrenPaths = state.routes[state.routes.length - 2].childRoutes.map(function(route) {
      return route.path;
    });
    if (childrenPaths) {
      childPages = filter(pages, function(page) {
        return childrenPaths.indexOf(page.path) >= 0;
      });
    } else {
      childPages = [];
    }

    body = "";
    html = "";
    try {
      body = React.renderToString(
        <Handler
          config={config}
          pages={pages}
          page={page}
          childPages={childPages}
          state={state}
        />
      );
      html = "<!DOCTYPE html>\n" + React.renderToStaticMarkup(
        <HTML
          config={config}
          page={page}
          body={body}
        />
      );
    }
    catch (e) {
      console.error(e.stack);
    }

    return callback(null, html);
  });
};
