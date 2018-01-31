// Replacing '/' would result in empty string which is invalid
var replacePath = function replacePath(_path) {
  return _path === `/` ? _path : _path.replace(/\/$/, ``);
};

exports.onCreatePage = function (_ref) {
  var page = _ref.page,
      actions = _ref.actions;
  var createPage = actions.createPage,
      deletePage = actions.deletePage;
  return new Promise(function (resolve) {
    var oldPage = Object.assign({}, page);
    page.path = replacePath(page.path);

    if (page.path !== oldPage.path) {
      deletePage(oldPage);
      createPage(page);
    }

    resolve();
  });
};