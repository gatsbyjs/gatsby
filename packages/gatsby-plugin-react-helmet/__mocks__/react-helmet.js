"use strict";

var helmet = {
  htmlAttributes: {
    toComponent: function toComponent() {
      return "html-attributes-component";
    }
  },
  bodyAttributes: {
    toComponent: function toComponent() {
      return "body-attributes-component";
    }
  },
  title: {
    toComponent: function toComponent() {
      return "title-component";
    }
  },
  link: {
    toComponent: function toComponent() {
      return "link-component";
    }
  },
  meta: {
    toComponent: function toComponent() {
      return "meta-component";
    }
  },
  noscript: {
    toComponent: function toComponent() {
      return "noscript-component";
    }
  },
  script: {
    toComponent: function toComponent() {
      return "script-component";
    }
  },
  style: {
    toComponent: function toComponent() {
      return "style-component";
    }
  }
};
module.exports = {
  Helmet: {
    renderStatic: function renderStatic() {
      return helmet;
    }
  }
};