"use strict";

var _Doclets = require("../Doclets");

describe(`transformer-react-doc-gen: Doclets`, () => {
  it(`should apply @required`, () => {
    const doclets = {
      required: true
    };
    expect((0, _Doclets.applyPropDoclets)({
      doclets
    })).toEqual({
      doclets,
      required: true
    });
  });
  it(`should apply @required`, () => {
    const doclets = {
      defaultValue: `() => {}`
    };
    expect((0, _Doclets.applyPropDoclets)({
      doclets
    })).toEqual({
      doclets,
      defaultValue: {
        value: `() => {}`,
        computed: false
      }
    });
  });
  it(`should handle inline enum types`, () => {
    const doclets = {
      type: `{(true|'foo'|40|"bar")}`
    };
    expect((0, _Doclets.applyPropDoclets)({
      doclets,
      type: {}
    })).toEqual({
      doclets,
      type: {
        name: `enum`,
        value: [{
          value: `true`,
          computed: false
        }, {
          value: `'foo'`,
          computed: false
        }, {
          value: `40`,
          computed: false
        }, {
          value: `"bar"`,
          computed: false
        }]
      }
    });
  });
  it(`should create a union type for none-literals`, () => {
    const doclets = {
      type: `{(string|func|bool)}`
    };
    expect((0, _Doclets.applyPropDoclets)({
      doclets,
      type: {}
    })).toEqual({
      doclets,
      type: {
        name: `union`,
        value: [{
          name: `string`
        }, {
          name: `func`
        }, {
          name: `bool`
        }]
      }
    });
  });
});