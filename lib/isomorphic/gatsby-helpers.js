import { pages, config, relativePath } from 'config';
import filter from 'lodash/collection/filter';
import first from 'lodash/array/first';
import includes from 'underscore.string/include';

// Prefix links for Github Pages.
// TODO make this generic for all prefixing?
exports.link = function(link) {
  if ((typeof __GH_PAGES__ !== "undefined" && __GH_PAGES__ !== null) && __GH_PAGES__ && (config.ghPagesURLPrefix != null)) {
    return config.ghPagesURLPrefix + link;
  } else {
    return link;
  }
};

// Get the child pages for a given template.
exports.templateChildrenPages = function(filename, state) {
  // Pop off the file name to leave the relative directory
  // path to this template.
  var split = filename.split('/');
  split.pop();
  var result = split.join('/');
  if (result === "") {
    result = "/";
  }

  var childrenRoutes = first(
    filter(
      state.routes, function(route) { return includes(route.path, result); }
    )
  ).childRoutes;

  var childrenPaths = childrenRoutes.map(function(path) { return path.path; });

  if (childrenPaths) {
    var childPages = filter(pages, function(page) {
      return childrenPaths.indexOf(page.path) >= 0;
    });
  } else {
    childPages = [];
  }

  return childPages;
};
