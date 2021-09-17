"use strict";

var _glamor = require("glamor");

exports.onClientEntry = function () {
  if (window._glamor) {
    (0, _glamor.rehydrate)(window._glamor);
  }
};