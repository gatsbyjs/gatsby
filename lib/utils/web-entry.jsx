import React from 'react';
import Router from 'react-router';
import find from 'lodash/collection/find';
import filter from 'lodash/collection/filter';
import createRoutes from 'create-routes';
import app from 'app';
import first from 'lodash/array/first';

function loadConfig(cb) {
  var stuff = require('config');
  if (module.hot) {
    module.hot.accept(stuff.id, function() {
      return cb();
    });
  }
  return cb();
};

loadConfig(function() {
  return app.loadContext(function(pagesReq) {
    var config, pages, ref, relativePath, router, routes;
    ref = require('config'),
    pages = ref.pages,
    config = ref.config,
    relativePath = ref.relativePath;

    routes = createRoutes(pages, pagesReq);
    // Remove templates files.
    pages = filter(pages, function(page) {
      return page.path != null;
    });

    // Route already exists meaning we're hot-reloading.
    if (router) {
      return router.replaceRoutes([app]);
    } else {
      return router = Router.run([routes], Router.HistoryLocation, function(Handler, state) {
        var page;
        page = find(pages, function(page) {
          return page.path === state.pathname;
        });

        // Let app know the route is changing.
        if (app.onRouteChange) {
          app.onRouteChange(state, page, pages, config);
        }
        return React.render(
          <Handler
            config={config}
            pages={pages}
            page={page}
            state={state}
          />, typeof window !== "undefined" ? document.getElementById("react-mount") : void 0);
      });
    }

  });
});
