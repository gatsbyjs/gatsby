import { Joi, type ObjectSchema } from "./joi";
// import type { GatsbyNode, PluginOptions } from "gatsby";
import { validateOptionsSchema } from "./validate";

type ITestPluginOptionsSchemaReturnType = {
  errors: Array<string>;
  warnings: Array<string>;
  isValid: boolean;
  hasWarnings: boolean;
};

export async function testPluginOptionsSchema(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pluginSchemaFunction: any, // GatsbyNode["pluginOptionsSchema"],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pluginOptions: any, // PluginOptions,
): Promise<ITestPluginOptionsSchemaReturnType | undefined> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pluginSchema: ObjectSchema<any> | undefined = pluginSchemaFunction?.({
    Joi: Joi.extend((joi) => {
      return {
        type: "subPlugins",
        base: joi
          .array()
          .items(
            joi.alternatives(
              joi.string(),
              joi.object({
                resolve: Joi.string(),
                options: Joi.object({}).unknown(true),
              }),
            ),
          )
          .custom(
            (arrayValue) =>
              arrayValue.map((value) => {
                if (typeof value === "string") {
                  value = { resolve: value };
                }

                return value;
              }),
            "Gatsby specific subplugin validation",
          )
          .default([]),
      };
    }),
  });

  try {
    if (typeof pluginSchema === "undefined") {
      return;
    }

    const { warning } = await validateOptionsSchema(
      pluginSchema,
      pluginOptions,
    );

    const warnings = warning.details.map((detail) => detail.message) ?? [];

    if (warnings.length > 0) {
      // eslint-disable-next-line consistent-return
      return {
        isValid: true,
        errors: [],
        hasWarnings: true,
        warnings,
      };
    }

    return;
  } catch (e) {
    const errors = e?.details?.map((detail) => detail.message) ?? [];
    // eslint-disable-next-line consistent-return
    return { isValid: false, errors, hasWarnings: false, warnings: [] };
  }
}
