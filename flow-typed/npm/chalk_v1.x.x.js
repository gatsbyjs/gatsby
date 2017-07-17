// flow-typed signature: f8f8af9c4192e9e159c56fb23ec4efb3
// flow-typed version: 94e9f7e0a4/chalk_v1.x.x/flow_>=v0.21.x

type $npm$chalk$StyleElement = {
  open: string;
  close: string;
};

type $npm$chalk$Chain = $npm$chalk$Style & (...text: string[]) => string;

type $npm$chalk$Style = {
  // General
  reset: $npm$chalk$Chain;
  bold: $npm$chalk$Chain;
  italic: $npm$chalk$Chain;
  underline: $npm$chalk$Chain;
  inverse: $npm$chalk$Chain;
  strikethrough: $npm$chalk$Chain;

  // Text colors
  black: $npm$chalk$Chain;
  red: $npm$chalk$Chain;
  green: $npm$chalk$Chain;
  yellow: $npm$chalk$Chain;
  blue: $npm$chalk$Chain;
  magenta: $npm$chalk$Chain;
  cyan: $npm$chalk$Chain;
  white: $npm$chalk$Chain;
  gray: $npm$chalk$Chain;
  grey: $npm$chalk$Chain;

  // Background colors
  bgBlack: $npm$chalk$Chain;
  bgRed: $npm$chalk$Chain;
  bgGreen: $npm$chalk$Chain;
  bgYellow: $npm$chalk$Chain;
  bgBlue: $npm$chalk$Chain;
  bgMagenta: $npm$chalk$Chain;
  bgCyan: $npm$chalk$Chain;
  bgWhite: $npm$chalk$Chain;
};

type $npm$chalk$StyleMap = {
  // General
  reset: $npm$chalk$StyleElement;
  bold: $npm$chalk$StyleElement;
  italic: $npm$chalk$StyleElement;
  underline: $npm$chalk$StyleElement;
  inverse: $npm$chalk$StyleElement;
  strikethrough: $npm$chalk$StyleElement;

  // Text colors
  black: $npm$chalk$StyleElement;
  red: $npm$chalk$StyleElement;
  green: $npm$chalk$StyleElement;
  yellow: $npm$chalk$StyleElement;
  blue: $npm$chalk$StyleElement;
  magenta: $npm$chalk$StyleElement;
  cyan: $npm$chalk$StyleElement;
  white: $npm$chalk$StyleElement;
  gray: $npm$chalk$StyleElement;

  // Background colors
  bgBlack: $npm$chalk$StyleElement;
  bgRed: $npm$chalk$StyleElement;
  bgGreen: $npm$chalk$StyleElement;
  bgYellow: $npm$chalk$StyleElement;
  bgBlue: $npm$chalk$StyleElement;
  bgMagenta: $npm$chalk$StyleElement;
  bgCyan: $npm$chalk$StyleElement;
  bgWhite: $npm$chalk$StyleElement;
};

declare module "chalk" {
  declare var enabled: boolean;
  declare var supportsColor: boolean;
  declare var styles: $npm$chalk$StyleMap;

  declare function stripColor(value: string): any;
  declare function hasColor(str: string): boolean;

  // General
  declare var reset: $npm$chalk$Chain;
  declare var bold: $npm$chalk$Chain;
  declare var italic: $npm$chalk$Chain;
  declare var underline: $npm$chalk$Chain;
  declare var inverse: $npm$chalk$Chain;
  declare var strikethrough: $npm$chalk$Chain;

  // Text colors
  declare var black: $npm$chalk$Chain;
  declare var red: $npm$chalk$Chain;
  declare var green: $npm$chalk$Chain;
  declare var yellow: $npm$chalk$Chain;
  declare var blue: $npm$chalk$Chain;
  declare var magenta: $npm$chalk$Chain;
  declare var cyan: $npm$chalk$Chain;
  declare var white: $npm$chalk$Chain;
  declare var gray: $npm$chalk$Chain;
  declare var grey: $npm$chalk$Chain;

  // Background colors
  declare var bgBlack: $npm$chalk$Chain;
  declare var bgRed: $npm$chalk$Chain;
  declare var bgGreen: $npm$chalk$Chain;
  declare var bgYellow: $npm$chalk$Chain;
  declare var bgBlue: $npm$chalk$Chain;
  declare var bgMagenta: $npm$chalk$Chain;
  declare var bgCyan: $npm$chalk$Chain;
  declare var bgWhite: $npm$chalk$Chain;
}
