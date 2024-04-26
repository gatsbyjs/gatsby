import { stripIndent } from "common-tags";
import terminalLink from "terminal-link";
import Joi from "joi";
import pluginSchemas from "./plugin-schemas.json"; // with { type: "json" };
import cmses from "./questions/cmses.json"; // with { type: "json" };
import styles from "./questions/styles.json"; // with { type: "json" };
import colors from "ansi-colors";

const supportedOptionTypes = ["string", "boolean", "number"];

type Schema = Joi.Description & {
  // Limitation in Joi typings
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  flags?: Record<string, any> | undefined;
};

type PluginName = keyof typeof pluginSchemas;

type IChoice = {
  name: string;
  initial: unknown;
  message: string;
  hint?: string | undefined;
};
type Choices = Array<IChoice>;

type Option = Record<string, Schema> | undefined;

type IFormPrompt = {
  type: string;
  name: string;
  multiple: boolean;
  message: string;
  choices: Choices;
};

function getName(key: string): string | undefined {
  const plugins = [cmses, styles]; // "features" doesn't map to names
  for (const types of plugins) {
    if (key in types) {
      // @ts-ignore Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{ "gatsby-source-contentful": { message: string; plugins: string[]; }; "gatsby-source-datocms": { message: string; plugins: string[]; }; "gatsby-plugin-netlify-cms": { message: string; dependencies: string[]; }; "gatsby-source-sanity": { ...; }; "gatsby-source-shopify": { ...; }; "gatsby-source-wordpress": { ...; };...'.
      // No index signature with a parameter of type 'string' was found on type '{ "gatsby-source-contentful": { message: string; plugins: string[]; }; "gatsby-source-datocms": { message: string; plugins: string[]; }; "gatsby-plugin-netlify-cms": { message: string; dependencies: string[]; }; "gatsby-source-sanity": { ...; }; "gatsby-source-shopify": { ...; }; "gatsby-source-wordpress": { ...; };...'.ts(7053)
      return types[key].message;
    }
  }
  return key;
}

function docsLink(pluginName: string): string {
  return colors.blueBright(
    terminalLink(
      "the plugin docs",
      `https://www.gatsbyjs.com/plugins/${pluginName}/`,
      { fallback: (_, url) => url },
    ),
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function isOptionRequired([_, option]: [string, Schema]): boolean {
  return option?.flags?.presence === "required";
}

function schemaToChoice([name, option]: [string, Schema]): IChoice {
  const hasDefaultValue =
    option.flags?.default &&
    supportedOptionTypes.includes(typeof option.flags?.default);

  return {
    name,
    initial: hasDefaultValue ? option.flags?.default.toString() : undefined,
    message: name,
    hint: option.flags?.description,
  };
}

export function makePluginConfigQuestions(
  selectedPlugins: Array<string>,
): Array<IFormPrompt> {
  const formPrompts: Array<IFormPrompt> = [];

  selectedPlugins.forEach((pluginName: string): void => {
    const schema = pluginSchemas[pluginName as PluginName];

    if (!schema || typeof schema === "string" || !("keys" in schema)) {
      return;
    }
    const options: Option = schema?.keys;

    if (!options) {
      return;
    }

    const choices: Choices = Object.entries(options)
      .filter(isOptionRequired)
      .map(schemaToChoice);

    if (choices.length > 0) {
      formPrompts.push({
        type: "forminput",
        name: pluginName,
        multiple: true,
        message: stripIndent`
          Configure the ${getName(pluginName)} plugin.
          See ${docsLink(pluginName)} for help.
          ${
            choices.length > 1
              ? colors.green(
                  "Use arrow keys to move between fields, and enter to finish",
                )
              : ""
          }
          `,
        choices,
      });
    }
  });

  return formPrompts;
}
