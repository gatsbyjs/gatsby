var loadPrismLanguage = require(`../load-prism-language`);

describe(`load prism language`, function () {
  afterEach(function () {
    jest.resetModules();
  });
  it(`throw if language not support`, function () {
    expect(function () {
      return loadPrismLanguage(`imnotalanguage`);
    }).toThrow(`Prism doesn't support language 'imnotalanguage'.`);
  });
  it(`load supported language`, function () {
    var language = `c`;

    var Prism = require(`prismjs`);

    var languagesBeforeLoaded = Object.keys(Prism.languages);
    expect(Prism.languages).not.toHaveProperty(language);
    loadPrismLanguage(language);
    var languagesAfterLoaded = Object.keys(Prism.languages);
    expect(Prism.languages).toHaveProperty(language);
    expect(languagesAfterLoaded.length).toBe(languagesBeforeLoaded.length + 1);
  });
  it(`also load the required language`, function () {
    var language = `cpp`;
    var requiredLanguage = `c`;

    var Prism = require(`prismjs`);

    var languagesBeforeLoaded = Object.keys(Prism.languages);
    expect(Prism.languages).not.toHaveProperty(language);
    expect(Prism.languages).not.toHaveProperty(requiredLanguage);
    loadPrismLanguage(language);
    var languagesAfterLoaded = Object.keys(Prism.languages);
    expect(Prism.languages).toHaveProperty(language);
    expect(Prism.languages).toHaveProperty(requiredLanguage);
    expect(languagesAfterLoaded.length).toBe(languagesBeforeLoaded.length + 2);
  });
});