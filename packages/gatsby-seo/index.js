"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.default = void 0;

var _taggedTemplateLiteralLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/taggedTemplateLiteralLoose"));

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _reactHelmet = _interopRequireDefault(require("react-helmet"));

var _gatsby = require("gatsby");

function _templateObject() {
  var data = (0, _taggedTemplateLiteralLoose2.default)(["\n  query DefaultSEOQuery {\n    site {\n      siteMetadata {\n        title\n        description\n        author\n      }\n    }\n  }\n"]);

  _templateObject = function _templateObject() {
    return data;
  };

  return data;
}

function SEO(_ref) {
  var children = _ref.children,
      description = _ref.description,
      lang = _ref.lang,
      link = _ref.link,
      meta = _ref.meta,
      keywords = _ref.keywords,
      title = _ref.title,
      rest = (0, _objectWithoutPropertiesLoose2.default)(_ref, ["children", "description", "lang", "link", "meta", "keywords", "title"]);
  return _react.default.createElement(_gatsby.StaticQuery, {
    query: detailsQuery,
    render: function render(data) {
      var metaDescription = description || data.site.siteMetadata.description;
      return _react.default.createElement(_reactHelmet.default, (0, _extends2.default)({}, rest, {
        htmlAttributes: {
          lang: lang
        },
        title: title,
        titleTemplate: "%s | " + data.site.siteMetadata.title,
        link: [].concat(link),
        meta: [{
          name: "description",
          content: metaDescription
        }, {
          property: "og:title",
          content: title
        }, {
          property: "og:description",
          content: metaDescription
        }, {
          property: "og:type",
          content: "website"
        }, {
          name: "twitter:card",
          content: "summary"
        }, {
          name: "twitter:creator",
          content: data.site.siteMetadata.author
        }, {
          name: "twitter:title",
          content: title
        }, {
          name: "twitter:description",
          content: metaDescription
        }].concat(keywords.length > 0 ? {
          name: "keywords",
          content: keywords.join(", ")
        } : []).concat(meta)
      }), children);
    }
  });
}

SEO.defaultProps = {
  lang: "en",
  link: [],
  meta: [],
  keywords: []
};
SEO.propTypes = {
  children: _propTypes.default.node,
  description: _propTypes.default.string,
  lang: _propTypes.default.string,
  link: _propTypes.default.array,
  meta: _propTypes.default.array,
  keywords: _propTypes.default.arrayOf(_propTypes.default.string),
  title: _propTypes.default.string.isRequired
};
var _default = SEO;
exports.default = _default;
var detailsQuery = (0, _gatsby.graphql)(_templateObject());