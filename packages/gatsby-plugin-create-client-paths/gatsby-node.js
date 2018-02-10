// Prefixes should be globs (i.e. of the form "/*" or "/foo/*")
var validatePrefixEntry = function validatePrefixEntry(prefix) {
  if (!prefix.match(/^\//) || !prefix.match(/\/\*$/)) {
    throw Error(`Plugin "gatsby-plugin-client-only-paths" found invalid prefix pattern: ${prefix}`);
  }
};

exports.onCreatePage = function (_ref, _ref2) {
  var page = _ref.page,
      store = _ref.store,
      actions = _ref.actions;
  var prefixes = _ref2.prefixes;
  var createPage = actions.createPage;
  var re = {};
  prefixes.forEach(validatePrefixEntry);
  return new Promise(function (resolve) {
    // Don't set matchPath again if it's already been set.
    if (page.matchPath || page.path.match(/dev-404-page/)) {
      resolve();
    }

    prefixes.some(function (prefix) {
      if (!re[prefix]) {
        // Remove the * from the prefix and memoize
        var trimmedPrefix = prefix.replace(/\*$/, ``);
        re[prefix] = new RegExp(`^${trimmedPrefix}`);
      } // Ensure that the path ends in a trailing slash, since it can be removed.


      var path = page.path.match(/\/$/) ? page.path : `${page.path}/`;

      if (path.match(re[prefix])) {
        page.matchPath = prefix.replace(/\*$/, `:path`);
        createPage(page);
        return true;
      }

      return false;
    });
    return resolve();
  });
};