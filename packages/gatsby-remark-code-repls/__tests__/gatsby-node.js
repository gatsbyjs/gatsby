jest.mock("fs", function () {
  return {
    existsSync: jest.fn(),
    readFileSync: jest.fn()
  };
});
jest.mock("recursive-readdir-synchronous", function () {
  return jest.fn();
});

var fs = require("fs");

var recursiveReaddir = require("recursive-readdir-synchronous");

var _require = require("../constants"),
    OPTION_DEFAULT_HTML = _require.OPTION_DEFAULT_HTML,
    OPTION_DEFAULT_REDIRECT_TEMPLATE_PATH = _require.OPTION_DEFAULT_REDIRECT_TEMPLATE_PATH;

var _require2 = require("../gatsby-node"),
    createPages = _require2.createPages;

var createPage = jest.fn();
var createPagesParams = {
  actions: {
    createPage: createPage
  }
};
describe("gatsby-remark-code-repls", function () {
  beforeEach(function () {
    fs.existsSync.mockReset();
    fs.existsSync.mockReturnValue(true);
    fs.readFileSync.mockReset();
    fs.readFileSync.mockReturnValue("const foo = \"bar\";");
    recursiveReaddir.mockReset();
    recursiveReaddir.mockReturnValue(["file.js"]);
    createPage.mockReset();
  });
  describe("gatsby-node", function () {
    it("should iterate over all JavaScript files in the examples directory", function () {
      recursiveReaddir.mockReturnValue(["root-file.js", "path/to/nested/file.jsx"]);
      createPages(createPagesParams);
      expect(fs.readFileSync).toHaveBeenCalledTimes(2);
      expect(fs.readFileSync).toHaveBeenCalledWith("root-file.js", "utf8");
      expect(fs.readFileSync).toHaveBeenCalledWith("path/to/nested/file.jsx", "utf8");
    });
    it("should ignore non JavaScript files in the examples directory", function () {
      recursiveReaddir.mockReturnValue(["javascript.js", "not-javascript.html"]);
      createPages(createPagesParams);
      expect(fs.readFileSync).toHaveBeenCalledTimes(1);
      expect(fs.readFileSync).toHaveBeenCalledWith("javascript.js", "utf8");
    });
    it("should error if provided an invalid examples directory", function () {
      fs.existsSync.mockReturnValue(false);
      expect(function () {
        return createPages(createPagesParams);
      }).toThrow("Invalid REPL directory specified: \"REPL/\"");
    });
    it("should warn about an empty examples directory", function () {
      recursiveReaddir.mockReturnValue([]);
      spyOn(console, "warn"); // eslint-disable-line no-undef

      createPages(createPagesParams);
      expect(console.warn).toHaveBeenCalledWith("Specified REPL directory \"REPL/\" contains no files");
    });
    it("should create redirect pages for the code in each example file", function () {
      recursiveReaddir.mockReturnValue(["root-file.js", "path/to/nested/file.jsx"]);
      createPages(createPagesParams);
      expect(createPage).toHaveBeenCalledTimes(2);
      expect(createPage.mock.calls[0][0].path).toContain("root-file");
      expect(createPage.mock.calls[1][0].path).toContain("path/to/nested/file");
    });
    it("should use a default redirect template", function () {
      recursiveReaddir.mockReturnValue(["file.js"]);
      createPages(createPagesParams);
      expect(createPage).toHaveBeenCalledTimes(1);
      expect(createPage.mock.calls[0][0].component).toContain(OPTION_DEFAULT_REDIRECT_TEMPLATE_PATH);
    });
    it("should use a specified redirect template override", function () {
      recursiveReaddir.mockReturnValue(["file.js"]);
      createPages(createPagesParams, {
        redirectTemplate: "foo/bar.js"
      });
      expect(createPage).toHaveBeenCalledTimes(1);
      expect(createPage.mock.calls[0][0].component).toContain("foo/bar.js");
    });
    it("should error if an invalid redirect template is specified", function () {
      fs.existsSync.mockImplementation(function (path) {
        return path !== "foo/bar.js";
      });
      expect(function () {
        return createPages(createPagesParams, {
          redirectTemplate: "foo/bar.js"
        });
      }).toThrow("Invalid REPL redirectTemplate specified");
    });
    it("should not load any external packages by default", function () {
      recursiveReaddir.mockReturnValue(["file.js"]);
      createPages(createPagesParams);

      var _JSON$parse = JSON.parse(createPage.mock.calls[0][0].context.payload),
          js_external = _JSON$parse.js_external;

      expect(js_external).toBe("");
    });
    it("should load custom externals if specified", function () {
      recursiveReaddir.mockReturnValue(["file.js"]);
      createPages(createPagesParams, {
        externals: ["foo.js", "bar.js"]
      });

      var _JSON$parse2 = JSON.parse(createPage.mock.calls[0][0].context.payload),
          js_external = _JSON$parse2.js_external;

      expect(js_external).toContain("foo.js");
      expect(js_external).toContain("bar.js");
    });
    it("should inject the required prop-types for the Codepen prefill API", function () {
      recursiveReaddir.mockReturnValue(["file.js"]);
      createPages(createPagesParams);
      var _createPage$mock$call = createPage.mock.calls[0][0].context,
          action = _createPage$mock$call.action,
          payload = _createPage$mock$call.payload;
      expect(action).toBeTruthy();
      expect(payload).toBeTruthy();
    });
    it("should render default HTML for index page if no override specified", function () {
      recursiveReaddir.mockReturnValue(["file.js"]);
      createPages(createPagesParams, {});

      var _JSON$parse3 = JSON.parse(createPage.mock.calls[0][0].context.payload),
          html = _JSON$parse3.html;

      expect(html).toBe(OPTION_DEFAULT_HTML);
    });
    it("should support custom, user-defined HTML for index page", function () {
      recursiveReaddir.mockReturnValue(["file.js"]);
      createPages(createPagesParams, {
        html: "<span id=\"foo\"></span>"
      });

      var _JSON$parse4 = JSON.parse(createPage.mock.calls[0][0].context.payload),
          html = _JSON$parse4.html;

      expect(html).toBe("<span id=\"foo\"></span>");
    });
  });
});