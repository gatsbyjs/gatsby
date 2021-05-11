const Prism = require(`prismjs`);

const env = {
  grammar: undefined
};

function loadEnv(language) {
  env.grammar = Prism.languages[language];
  if (!env.grammar) return;
}

module.exports = (language = `html`) => {
  loadEnv(language);

  // Gatsby Prism Autolinker Plugin
  //
  // This file serves as an adapter module
  // for the original Prism Show Invisibles
  // implementation. The ported plugin code
  // is from npm's prismjs@1.21.0.
  //
  // @see https://github.com/PrismJS/prism/blob/v1.17.1/plugins/autolinker/prism-autolinker.js
  //
  // prism-autolinker.js:start
  if (
    (typeof self !== `undefined` && !self.Prism) ||
    (typeof global !== `undefined` && !global.Prism)
  ) {
    return
  }

  var url = /\b([a-z]{3,7}:\/\/|tel:)[\w\-+%~/.:=&@]+(?:\?[\w\-+%~/.:=?&!$'()*,;@]*)?(?:#[\w\-+%~/.:#=?&!$'()*,;@]*)?/,
    email = /\b\S+@[\w.]+[a-z]{2}/,
    linkMd = /\[([^\]]+)]\(([^)]+)\)/,

    // Tokens that may contain URLs and emails
    candidates = ['comment', 'url', 'attr-value', 'string'];

  Prism.plugins.autolinker = {
    processGrammar: function (grammar) {
      // Abort if grammar has already been processed
      if (!grammar || grammar['url-link']) {
        return;
      }

      Prism.languages.DFS(grammar, function (key, def, type) {
        if (candidates.indexOf(type) > -1 && !Array.isArray(def)) {
          if (!def.pattern) {
            def = this[key] = {
              pattern: def
            };
          }

          def.inside = def.inside || {};

          if (type == 'comment') {
            def.inside['md-link'] = linkMd;
          }
          if (type == 'attr-value') {
            Prism.languages.insertBefore('inside', 'punctuation', { 'url-link': url }, def);
          }
          else {
            def.inside['url-link'] = url;
          }

          def.inside['email-link'] = email;
        }
      });
      grammar['url-link'] = url;
      grammar['email-link'] = email;
    }
  };

  Prism.hooks.add('before-highlight', function(env) {
    Prism.plugins.autolinker.processGrammar(env.grammar);
  });

  Prism.hooks.add('wrap', function(env) {
    if (/-link$/.test(env.type)) {
      env.tag = 'a';

      var href = env.content;

      if (env.type == 'email-link' && href.indexOf('mailto:') != 0) {
        href = 'mailto:' + href;
      }
      else if (env.type == 'md-link') {
        // Markdown
        var match = env.content.match(linkMd);

        href = match[2];
        env.content = match[1];
      }

      env.attributes.href = href;

      // Silently catch any error thrown by decodeURIComponent (#1186)
      try {
        env.content = decodeURIComponent(env.content);
      } catch(e) {}
    }
  });
  // prism-autolinker.js:end

  Prism.plugins.autolinker.processGrammar(env.grammar);
}
